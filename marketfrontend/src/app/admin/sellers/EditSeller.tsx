"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Contact,
  Globe,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
  Store,
  Trash2,
  UserPlus,
} from "lucide-react";
import { z } from "zod";

import { useSellerDetail } from "../../../hooks/admin/useSellers";
import { useEmailCheck } from "../../../hooks/useEmailCheck";
import { usePhoneCheck } from "../../../hooks/usePhoneCheck";
import { useLogoUpload } from "../../../hooks/admin/useLogoUpload";
import { useSellerDraft, SellerFormData } from "../../../hooks/admin/useSellerDraft";
import http from "../../../lib/http";

import { SellerStatus } from "../../../types/index";
import ToastComponent, { ToastType } from "../../../components/ui/Toast";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import StatusSelector from "../../../components/admin/sellers/StatusSelector";
import AuthMethodSection from "../../../components/admin/sellers/AuthMethodSection";
import LogoUploadSection from "../../../components/admin/sellers/LogoUploadSection";

// ================= Zod validation =================
const sellerSchema = z.object({
  brandTitle: z.string().min(1, "Tên thương hiệu là bắt buộc."),
  category: z.string().min(1),
  website: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(val),
      "Địa chỉ website không hợp lệ.",
    ),
  location: z.string().min(1, "Địa chỉ kho/văn phòng là bắt buộc."),
  email: z.string().min(1, "Email là bắt buộc.").email("Định dạng email không hợp lệ."),
  phone: z
    .string()
    .min(1, "Số điện thoại là bắt buộc.")
    .regex(/^(0|\+84)(3|5|7|8|9)\d{8}$/, "Số điện thoại không đúng định dạng VN."),
  status: z.enum(["ACTIVE", "BLOCKED", "PENDING", "REJECTED"]),
  ownerName: z.string().min(1, "Tên người đại diện là bắt buộc."),
  password: z.string().optional(),
});

const EMPTY_FORM: SellerFormData = {
  brandTitle: "",
  category: "Fashion",
  website: "",
  location: "",
  email: "",
  phone: "",
  status: "ACTIVE",
  ownerName: "",
  logoUrl: "",
};

export default function EditSeller() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const isEditMode = !!id;

  const { seller, isLoading, createSeller, updateSeller, isSaving } = useSellerDetail(
    id || "",
  );

  // ================== State ==================
  const [formData, setFormData] = useState<SellerFormData>(EMPTY_FORM);
  const [authMethod, setAuthMethod] = useState<"invite" | "manual">("invite");
  const [manualPassword, setManualPassword] = useState("");
  const [emailEditable, setEmailEditable] = useState(false); // email chỉ cho sửa khi admin bấm "Đổi email"
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(
    null,
  );

  const pushToast = (message: string, type: ToastType) =>
    setToast({ id: Date.now().toString(), message, type });

  // Email uniqueness — skip khi edit mode và email không đổi
  const emailCheckStatus = useEmailCheck(formData.email, {
    skip: isEditMode && !!seller && formData.email === seller.email,
  });

  // Phone uniqueness — skip khi edit mode và phone không đổi
  const phoneCheckStatus = usePhoneCheck(formData.phone, {
    skip: isEditMode && !!seller && formData.phone === seller.phone,
  });

  // Logo upload hook
  const logo = useLogoUpload({
    onUrlChange: (url) => setFormData((prev) => ({ ...prev, logoUrl: url })),
    onToast: pushToast,
  });

  // Draft auto-save
  const draft = useSellerDraft({
    enabled: !isEditMode,
    formData,
    authMethod,
    onRestore: (d) => {
      setFormData(d.formData);
      setAuthMethod(d.authMethod || "invite");
      pushToast(
        `Đã khôi phục bản nháp lúc ${new Date(d.savedAt).toLocaleTimeString()}.`,
        "info",
      );
    },
  });

  // Load seller vào form khi Edit mode
  useEffect(() => {
    if (isEditMode && seller) {
      setFormData({
        brandTitle: seller.brandTitle ?? "",
        category: seller.category ?? "",
        website: seller.website ?? "",
        location: seller.location ?? "",
        email: seller.email ?? "",
        phone: seller.phone ?? "",
        status: seller.status ?? "PENDING",
        ownerName: seller.ownerName ?? "",
        logoUrl: seller.logoUrl ?? "",
      });
    }
  }, [isEditMode, seller]);

  // ================== Validation ==================
  const validateForm = () => {
    const payloadToValidate = {
      ...formData,
      password: !isEditMode && authMethod === "manual" ? manualPassword : undefined,
    };

    const extendedSchema = sellerSchema.superRefine((data, ctx) => {
      if (data.password !== undefined && data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mật khẩu phải có ít nhất 8 ký tự.",
          path: ["password"],
        });
      }
    });

    const result = extendedSchema.safeParse(payloadToValidate);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(newErrors);
      console.warn(
        "[EditSeller] Zod validation failed:",
        newErrors,
        "payload:",
        payloadToValidate,
      );
      return false;
    }

    // Email uniqueness đã được real-time check rồi — block trực tiếp
    if (emailCheckStatus === "taken") {
      setErrors((prev) => ({ ...prev, email: "Email này đã được sử dụng." }));
      return false;
    }

    // Phone uniqueness — block trực tiếp
    if (phoneCheckStatus === "taken") {
      setErrors((prev) => ({ ...prev, phone: "Số điện thoại này đã được sử dụng." }));
      return false;
    }

    setErrors({});
    return true;
  };

  // ================== Submit ==================
  // Helper: extract message tiếng Việt từ axios error, bỏ prefix kỹ thuật
  const extractErrorMessage = (e: any, fallback: string): string => {
    const data = e?.response?.data;
    if (typeof data === "object" && data?.message) return data.message;
    if (typeof data === "string" && data) {
      // Tránh hiển thị raw SQL error nếu backend lọt
      if (data.includes("Duplicate entry") && data.includes("phone")) {
        return "Số điện thoại này đã được sử dụng";
      }
      if (data.includes("Duplicate entry") && data.includes("email")) {
        return "Email này đã được sử dụng";
      }
      // Dịch message tiếng Anh phổ biến sang tiếng Việt
      if (data === "Email already exists") return "Email này đã được sử dụng";
      if (data === "Phone already exists") return "Số điện thoại này đã được sử dụng";
      if (data === "Email is required") return "Email là bắt buộc";
      return data;
    }
    return e?.message || fallback;
  };

  const handleSubmit = async (action: "save" | "save_and_add") => {
    if (!validateForm()) {
      pushToast("Vui lòng kiểm tra lại thông tin nhập liệu.", "error");
      return;
    }

    try {
      if (isEditMode) {
        await updateSeller(formData);
        pushToast("Cập nhật thông tin thành công!", "success");
        setTimeout(() => router.push("/admin/sellers"), 1000);
        return;
      }

      // CREATE
      await createSeller({
        ...formData,
        logoUrl:
          formData.logoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            formData.brandTitle,
          )}&background=random`,
        ...(authMethod === "manual" ? { password: manualPassword } : {}),
      });

      // Gửi email invite (nếu chọn)
      let inviteSent = false;
      let inviteError: string | null = null;
      if (authMethod === "invite") {
        try {
          await http.post("/auth/request-password-setup", {
            email: formData.email,
            shopName: formData.brandTitle,
          });
          inviteSent = true;
        } catch (inviteErr: any) {
          console.error("[EditSeller] invite email failed:", inviteErr);
          inviteError =
            inviteErr?.response?.data?.message ||
            inviteErr?.message ||
            "Không gửi được email invite";
        }
      }

      const successMsg =
        authMethod === "invite"
          ? inviteSent
            ? `Đã tạo "${formData.brandTitle}" và gửi email invite tới ${formData.email}`
            : `Đã tạo "${formData.brandTitle}" nhưng không gửi được email: ${inviteError}. Bạn có thể gửi lại từ trang chi tiết.`
          : `Đã tạo tài khoản cho "${formData.brandTitle}"!`;

      pushToast(successMsg, authMethod === "invite" && !inviteSent ? "warning" : "success");

      draft.clear();

      if (action === "save_and_add") {
        setFormData(EMPTY_FORM);
        setManualPassword("");
        setAuthMethod("invite");
        logo.reset();
        window.scrollTo(0, 0);
      } else {
        setTimeout(() => router.push("/admin/sellers"), 1000);
      }
    } catch (e: any) {
      console.error("[EditSeller] submit error:", e);
      pushToast(
        extractErrorMessage(e, "Đã có lỗi xảy ra. Vui lòng thử lại."),
        "error",
      );
    }
  };

  const handleClearDraft = () => {
    draft.clear();
    setFormData(EMPTY_FORM);
    setManualPassword("");
    setAuthMethod("invite");
    setErrors({});
    logo.reset();
    pushToast("Đã xóa bản nháp.", "info");
  };

  // ================== Render ==================
  if (isEditMode && isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-slate-400">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const submitDisabled =
    isSaving ||
    emailCheckStatus === "taken" ||
    emailCheckStatus === "checking" ||
    phoneCheckStatus === "taken" ||
    phoneCheckStatus === "checking";

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-6xl mx-auto pb-24 space-y-6">
      {toast && <ToastComponent toast={toast} onClose={() => setToast(null)} />}

      <Breadcrumbs
        items={[
          { label: "Nhà bán hàng", path: "/admin/sellers" },
          { label: isEditMode ? "Chỉnh sửa nhà bán hàng" : "Thêm nhà bán hàng" },
        ]}
      />

      {/* Draft banner */}
      {!isEditMode && draft.savedAt && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start sm:items-center gap-2 text-sm text-amber-900 font-medium">
            <Info size={16} className="text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold">Bản nháp đã được lưu</span>
              <span className="text-amber-700 font-normal">
                {" "}
                · Tự động khôi phục lần sau nếu bạn thoát giữa chừng (lúc{" "}
                {new Date(draft.savedAt).toLocaleTimeString()})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearDraft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 rounded-lg transition-all self-end sm:self-auto shrink-0"
          >
            <Trash2 size={14} />
            Xóa bản nháp
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/sellers")}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              {isEditMode ? "Chỉnh sửa nhà bán hàng" : "Thêm nhà bán hàng"}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {isEditMode
                ? `Cập nhật thông tin cho mã: ${seller?.accountCode}`
                : "Thiết lập hồ sơ và tài khoản cho đối tác mới."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/sellers")}
            className="px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all border-0 bg-transparent"
          >
            Hủy
          </button>

          {!isEditMode && (
            <button
              onClick={() => handleSubmit("save_and_add")}
              disabled={submitDisabled}
              className="hidden md:flex items-center gap-2 px-5 py-3 bg-white border-2 border-blue-100 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={18} /> Lưu & Thêm tiếp
            </button>
          )}

          <button
            onClick={() => handleSubmit("save")}
            disabled={submitDisabled}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0 disabled:opacity-50"
          >
            {isSaving ? (
              "Đang xử lý..."
            ) : isEditMode ? (
              <>
                <Save size={18} /> Lưu thay đổi
              </>
            ) : (
              <>
                <UserPlus size={18} /> Tạo tài khoản
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Main Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Store Info */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
              <Store size={18} className="text-blue-500" /> Thông tin cửa hàng
            </h3>

            <div className="space-y-6">
              <LogoUploadSection
                logoUrl={formData.logoUrl}
                isUploading={logo.isUploading}
                uploadProgress={logo.uploadProgress}
                fileMetadata={logo.fileMetadata}
                isDragging={logo.isDragging}
                lastFile={logo.lastFile}
                uploadError={logo.uploadError}
                formatBytes={logo.formatBytes}
                fileInputRef={logo.fileInputRef}
                onFileChange={logo.handleFileChange}
                onClick={logo.clickFileInput}
                onRemove={logo.removeLogo}
                onRetry={logo.retry}
                onDragOver={logo.handleDragOver}
                onDragLeave={logo.handleDragLeave}
                onDrop={logo.handleDrop}
              />

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  Tên thương hiệu (Brand Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.brandTitle}
                  onChange={(e) => {
                    setFormData({ ...formData, brandTitle: e.target.value });
                    if (errors.brandTitle) setErrors({ ...errors, brandTitle: "" });
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-bold transition-all ${
                    errors.brandTitle
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:ring-blue-500/10"
                  }`}
                  placeholder="VD: ZARA International"
                />
                {errors.brandTitle && (
                  <p className="text-xs text-red-500 mt-1 font-bold flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.brandTitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Danh mục chính</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium appearance-none cursor-pointer"
                    >
                      <option value="Fashion">Fashion</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Watches">Watches</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Website</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => {
                        setFormData({ ...formData, website: e.target.value });
                        if (errors.website) setErrors({ ...errors, website: "" });
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-all ${
                        errors.website
                          ? "border-red-300 focus:ring-red-100"
                          : "border-slate-200 focus:ring-blue-500/10"
                      }`}
                      placeholder="www.example.com"
                    />
                    <Globe
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                  </div>
                  {errors.website && (
                    <p className="text-xs text-red-500 mt-1 font-bold">{errors.website}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
              <Contact size={18} className="text-purple-500" /> Thông tin liên hệ
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Tên người đại diện (Owner Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => {
                    setFormData({ ...formData, ownerName: e.target.value });
                    if (errors.ownerName) setErrors({ ...errors, ownerName: "" });
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-all ${
                    errors.ownerName
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:ring-purple-500/10"
                  }`}
                  placeholder="VD: Nguyễn Văn A"
                />
                {errors.ownerName && (
                  <p className="text-xs text-red-500 mt-1 font-bold">{errors.ownerName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">
                      Email (Tài khoản chính) <span className="text-red-500">*</span>
                    </label>
                    {isEditMode && !emailEditable && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Đổi email sẽ ảnh hưởng đến đăng nhập của nhà bán hàng. Nhà bán hàng có thể bị mất quyền truy cập nếu email mới sai. Bạn chắc chắn muốn tiếp tục?")) {
                            setEmailEditable(true);
                          }
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Đổi email
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      readOnly={isEditMode && !emailEditable}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      className={`w-full px-4 py-3 pr-10 border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-all ${
                        isEditMode && !emailEditable
                          ? "bg-slate-50 text-slate-600 cursor-not-allowed border-slate-200"
                          : errors.email || emailCheckStatus === "taken"
                            ? "bg-white border-red-300 focus:ring-red-100"
                            : emailCheckStatus === "available"
                              ? "bg-white border-green-300 focus:ring-green-100"
                              : "bg-white border-slate-200 focus:ring-purple-500/10"
                      }`}
                      placeholder="email@example.com"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      {emailCheckStatus === "checking" && (
                        <Loader2 size={18} className="text-slate-400 animate-spin" />
                      )}
                      {emailCheckStatus === "available" && (
                        <CheckCircle2 size={18} className="text-green-600" />
                      )}
                      {emailCheckStatus === "taken" && (
                        <AlertCircle size={18} className="text-red-500" />
                      )}
                    </div>
                  </div>
                  {isEditMode && emailEditable && (
                    <p className="text-[11px] text-amber-700 mt-1 font-bold flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <span>Lưu ý: Đổi email sẽ ảnh hưởng đăng nhập của seller. Họ sẽ dùng email mới để đăng nhập ở lần sau.</span>
                    </p>
                  )}
                  {errors.email ? (
                    <p className="text-xs text-red-500 mt-1 font-bold">{errors.email}</p>
                  ) : emailCheckStatus === "taken" ? (
                    <p className="text-xs text-red-500 mt-1 font-bold flex items-center gap-1">
                      <AlertCircle size={12} /> Email này đã được sử dụng
                    </p>
                  ) : emailCheckStatus === "available" ? (
                    <p className="text-xs text-green-600 mt-1 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Email khả dụng
                    </p>
                  ) : emailCheckStatus === "invalid" ? (
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Định dạng email chưa hợp lệ
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                      className={`w-full px-4 py-3 pr-10 border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-all ${
                        errors.phone || phoneCheckStatus === "taken"
                          ? "bg-white border-red-300 focus:ring-red-100"
                          : phoneCheckStatus === "available"
                            ? "bg-white border-green-300 focus:ring-green-100"
                            : "bg-white border-slate-200 focus:ring-purple-500/10"
                      }`}
                      placeholder="VD: 0912345678"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      {phoneCheckStatus === "checking" && (
                        <Loader2 size={18} className="text-slate-400 animate-spin" />
                      )}
                      {phoneCheckStatus === "available" && (
                        <CheckCircle2 size={18} className="text-green-600" />
                      )}
                      {phoneCheckStatus === "taken" && (
                        <AlertCircle size={18} className="text-red-500" />
                      )}
                    </div>
                  </div>
                  {errors.phone ? (
                    <p className="text-xs text-red-500 mt-1 font-bold">{errors.phone}</p>
                  ) : phoneCheckStatus === "taken" ? (
                    <p className="text-xs text-red-500 mt-1 font-bold flex items-center gap-1">
                      <AlertCircle size={12} /> Số điện thoại này đã được sử dụng
                    </p>
                  ) : phoneCheckStatus === "available" ? (
                    <p className="text-xs text-green-600 mt-1 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> SĐT khả dụng
                    </p>
                  ) : phoneCheckStatus === "invalid" ? (
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Định dạng SĐT VN chưa hợp lệ (VD: 0912345678)
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Địa chỉ kho/văn phòng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      if (errors.location) setErrors({ ...errors, location: "" });
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-all ${
                      errors.location
                        ? "border-red-300 focus:ring-red-100"
                        : "border-slate-200 focus:ring-purple-500/10"
                    }`}
                    placeholder="VD: 123 Đường ABC, Quận 1..."
                  />
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                </div>
                {errors.location && (
                  <p className="text-xs text-red-500 mt-1 font-bold">{errors.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {!isEditMode && (
            <AuthMethodSection
              authMethod={authMethod}
              onAuthMethodChange={setAuthMethod}
              email={formData.email}
              manualPassword={manualPassword}
              onManualPasswordChange={(v) => {
                setManualPassword(v);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              errorPassword={errors.password}
            />
          )}

          <StatusSelector
            value={formData.status}
            onChange={(v) => setFormData({ ...formData, status: v })}
            hideBlocked={!isEditMode}
          />

          {/* Read-only stats (Edit mode) */}
          {isEditMode && seller && (
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Thống kê nhanh
              </h3>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-medium text-slate-600">Ngày đăng ký</span>
                <span className="text-sm font-bold text-slate-800">
                  {new Date(seller.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-medium text-slate-600">Tổng sản phẩm</span>
                <span className="text-sm font-bold text-slate-800">{seller.totalProducts}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-medium text-slate-600">Tổng doanh thu</span>
                <span className="text-sm font-bold text-blue-600">
                  {(seller.totalRevenue / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
