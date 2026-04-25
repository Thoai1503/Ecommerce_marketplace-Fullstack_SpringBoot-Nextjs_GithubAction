"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Loader2,
  KeyRound,
  Briefcase,
  Lock as LockIcon,
} from "lucide-react";
import http from "@/lib/http";
import { useEmailCheck } from "@/hooks/useEmailCheck";
import { usePhoneCheck } from "@/hooks/usePhoneCheck";

type BusinessType = "individual" | "household" | "company";

interface FormData {
  fullName: string;
  shopName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessType: BusinessType;
}

type Step = "form" | "otp";

const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

export default function SellerRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    shopName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessType: "individual",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [apiMessage, setApiMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // OTP flow state
  const [step, setStep] = useState<Step>("form");
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Real-time email uniqueness
  const emailStatus = useEmailCheck(formData.email);
  // Real-time phone uniqueness
  const phoneStatus = usePhoneCheck(formData.phone);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
    if (apiMessage) setApiMessage(null);
  };

  // Password rules checklist
  const pwRules = useMemo(() => {
    const pw = formData.password;
    return {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      digit: /[0-9]/.test(pw),
    };
  }, [formData.password]);

  const pwScore =
    Number(pwRules.length) +
    Number(pwRules.upper) +
    Number(pwRules.lower) +
    Number(pwRules.digit);

  const strengthLabels = ["Rất yếu", "Yếu", "Trung bình", "Khá", "Mạnh"];
  const strengthColors = [
    "bg-slate-200",
    "bg-red-400",
    "bg-amber-400",
    "bg-blue-400",
    "bg-green-500",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.shopName.trim())
      newErrors.shopName = "Vui lòng nhập tên cửa hàng";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    else if (emailStatus === "taken") newErrors.email = "Email đã tồn tại";
    else if (emailStatus === "disposable")
      newErrors.email = "Không chấp nhận email tạm thời. Vui lòng dùng email cá nhân hoặc doanh nghiệp.";

    if (!formData.phone.trim())
      newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!VN_PHONE_REGEX.test(formData.phone.trim()))
      newErrors.phone = "SĐT VN không hợp lệ (VD: 0912345678)";
    else if (phoneStatus === "taken")
      newErrors.phone = "Số điện thoại này đã được đăng ký";

    if (!pwRules.length) newErrors.password = "Mật khẩu ít nhất 8 ký tự";
    else if (!pwRules.upper || !pwRules.digit)
      newErrors.password = "Cần ít nhất 1 chữ in hoa và 1 số";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

    if (!agreeTerms)
      newErrors.terms = "Bạn phải đồng ý với điều khoản để tiếp tục";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;
    setSendingOtp(true);
    setApiMessage(null);
    try {
      const res = await http.post<{ devOtp?: string; devReason?: string }>(
        "/auth/otp/send-register",
        { email: formData.email }
      );
      setStep("otp");
      startCooldown();
      if (res.data?.devOtp) {
        // DEV mode: hiện OTP trong banner, user tự copy-paste vào ô nhập
        setApiMessage({
          type: "success",
          text: `[DEV MODE] Mã OTP của bạn là: ${res.data.devOtp} — vui lòng copy và dán vào ô bên dưới. (Lý do: ${
            res.data.devReason || "email chưa verify domain ở môi trường dev"
          })`,
        });
      } else {
        setApiMessage({
          type: "success",
          text: `Đã gửi mã OTP đến ${formData.email}. Kiểm tra hộp thư (kể cả Spam).`,
        });
      }
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } | string };
        message?: string;
      };
      const apiMsg =
        (typeof e?.response?.data === "object"
          ? e.response?.data?.message
          : e?.response?.data) || e?.message;
      setApiMessage({
        type: "error",
        text:
          typeof apiMsg === "string" && apiMsg ? apiMsg : "Không gửi được OTP",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setSendingOtp(true);
    try {
      const res = await http.post<{ devOtp?: string }>(
        "/auth/otp/send-register",
        { email: formData.email }
      );
      startCooldown();
      if (res.data?.devOtp) {
        setApiMessage({
          type: "success",
          text: `[DEV MODE] Mã OTP mới: ${res.data.devOtp} — copy và dán vào ô bên dưới.`,
        });
      } else {
        setApiMessage({ type: "success", text: "Đã gửi lại mã OTP." });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setApiMessage({
        type: "error",
        text: e?.response?.data?.message || "Không gửi được OTP",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setApiMessage({ type: "error", text: "OTP phải gồm 6 chữ số" });
      return;
    }
    setIsLoading(true);
    setApiMessage(null);
    try {
      await http.post("/auth/seller/register", {
        fullName: formData.fullName,
        shopName: formData.shopName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        otp: otp.trim(),
      });
      setApiMessage({
        type: "success",
        text: "Đăng ký thành công! Chuyển hướng...",
      });
      setTimeout(() => {
        router.push(
          `/seller/pending?email=${encodeURIComponent(formData.email)}`
        );
      }, 800);
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } | string };
        message?: string;
      };
      const apiMsg =
        (typeof e?.response?.data === "object"
          ? e.response?.data?.message
          : e?.response?.data) || e?.message;
      setApiMessage({
        type: "error",
        text:
          typeof apiMsg === "string" && apiMsg
            ? apiMsg
            : "Đăng ký thất bại. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ============ UI ============
  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-5/12 bg-blue-700 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white text-blue-700 rounded-xl flex items-center justify-center shadow-xl shadow-black/10">
              <span className="font-black text-xl italic">V</span>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight block leading-none">
                VietCommerce Hub
              </span>
              <span className="text-xs font-bold text-amber-300 tracking-widest uppercase">
                Connecting Vietnam
              </span>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-black mb-4 leading-[1.1] tracking-tight">
              Bắt đầu hành trình kinh doanh{" "}
              <span className="text-yellow-300">đột phá</span>.
            </h1>
            <p className="text-base text-blue-100 mb-8 font-medium leading-relaxed">
              Đăng ký ngay để tiếp cận hàng triệu khách hàng và sử dụng bộ
              công cụ quản lý chuyên nghiệp.
            </p>

            <div className="space-y-6">
              {[
                {
                  title: "Miễn phí đăng ký",
                  desc: "Không phí duy trì, chỉ trả phí khi có đơn hàng.",
                },
                {
                  title: "Hỗ trợ 24/7",
                  desc: "Đội ngũ hỗ trợ tận tâm luôn sẵn sàng.",
                },
                {
                  title: "Thanh toán nhanh chóng",
                  desc: "Chu kỳ đối soát linh hoạt, dòng tiền ổn định.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/50 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">{item.title}</h4>
                    <p className="text-blue-100 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-600/40 border border-blue-400/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="text-amber-300 shrink-0 mt-0.5"
                />
                <div className="text-sm">
                  <p className="font-bold mb-1">Quy trình xét duyệt</p>
                  <p className="text-blue-100 text-xs leading-relaxed">
                    Hồ sơ được admin xem xét trong vòng 24h. Sau khi duyệt, bạn
                    có thể đăng sản phẩm và bắt đầu bán hàng.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust signal — bảo mật dữ liệu */}
            <div className="mt-3 flex items-center gap-2 text-[11px] text-blue-100/90 font-medium">
              <LockIcon size={14} className="text-amber-300 shrink-0" />
              <span>
                Dữ liệu được mã hoá <span className="font-bold text-white">AES-256</span>
                {" "}· Tuân thủ{" "}
                <span className="font-bold text-white">Luật An ninh mạng VN</span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs font-medium text-blue-200/60 mt-8">
          © 2026 VietCommerce Seller Center.
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 lg:p-12 relative bg-slate-50 overflow-y-auto h-screen">
        <div className="absolute top-8 right-8 flex items-center gap-2 text-sm font-medium text-slate-600 z-20">
          Đã có tài khoản?
          <Link
            href="/login"
            className="text-blue-700 font-bold hover:underline"
          >
            Đăng nhập
          </Link>
        </div>

        <div className="max-w-[600px] w-full bg-white p-8 lg:p-12 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white relative my-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {step === "form"
                ? "Đăng ký Nhà bán hàng"
                : "Xác thực Email"}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              {step === "form"
                ? "Điền thông tin bên dưới để tạo cửa hàng của bạn."
                : `Nhập mã 6 số đã được gửi đến ${formData.email}`}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <StepPill active={step === "form"} done={step !== "form"} label="1. Thông tin" />
            <div className="flex-1 h-[2px] bg-slate-200" />
            <StepPill active={step === "otp"} done={false} label="2. Xác thực" />
          </div>

          {apiMessage && (
            <div
              className={`mb-5 px-4 py-3 rounded-xl border flex items-start gap-2 text-sm font-medium ${
                apiMessage.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {apiMessage.type === "success" ? (
                <CheckCircle size={18} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
              )}
              <span>{apiMessage.text}</span>
            </div>
          )}

          {step === "form" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOtp();
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldWrapper label="Họ và tên" error={errors.fullName}>
                  <InputWithIcon icon={<User size={18} />}>
                    <input
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={inputCls(!!errors.fullName)}
                      placeholder="Nguyễn Văn A"
                    />
                  </InputWithIcon>
                </FieldWrapper>

                <FieldWrapper label="Tên cửa hàng" error={errors.shopName}>
                  <InputWithIcon icon={<Store size={18} />}>
                    <input
                      type="text"
                      name="shopName"
                      autoComplete="organization"
                      value={formData.shopName}
                      onChange={handleChange}
                      className={inputCls(!!errors.shopName)}
                      placeholder="Cửa hàng ABC"
                    />
                  </InputWithIcon>
                </FieldWrapper>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldWrapper
                  label="Email"
                  error={errors.email}
                  hint={
                    emailStatus === "available" ? (
                      <span className="text-green-600 text-xs font-bold flex items-center gap-1 ml-1">
                        <CheckCircle size={10} /> Email có thể dùng
                      </span>
                    ) : emailStatus === "taken" ? (
                      <span className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1">
                        <AlertCircle size={10} /> Email đã tồn tại
                      </span>
                    ) : emailStatus === "disposable" ? (
                      <span className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1">
                        <AlertCircle size={10} /> Email tạm thời không được chấp nhận
                      </span>
                    ) : null
                  }
                >
                  <InputWithIcon
                    icon={<Mail size={18} />}
                    rightButton={
                      emailStatus === "checking" ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Loader2 size={16} className="animate-spin" />
                        </span>
                      ) : emailStatus === "available" ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          <CheckCircle size={16} />
                        </span>
                      ) : emailStatus === "taken" || emailStatus === "disposable" ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                          <AlertCircle size={16} />
                        </span>
                      ) : null
                    }
                  >
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${inputCls(
                        !!errors.email || emailStatus === "taken" || emailStatus === "disposable"
                      )} pr-10`}
                      placeholder="email@example.com"
                    />
                  </InputWithIcon>
                </FieldWrapper>

                <FieldWrapper
                  label="Số điện thoại"
                  error={errors.phone}
                  hint={
                    phoneStatus === "available" ? (
                      <span className="text-green-600 text-xs font-bold flex items-center gap-1 ml-1">
                        <CheckCircle size={10} /> SĐT có thể dùng
                      </span>
                    ) : phoneStatus === "taken" ? (
                      <span className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1">
                        <AlertCircle size={10} /> SĐT đã được đăng ký
                      </span>
                    ) : null
                  }
                >
                  <InputWithIcon
                    icon={<Phone size={18} />}
                    rightButton={
                      phoneStatus === "checking" ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Loader2 size={16} className="animate-spin" />
                        </span>
                      ) : phoneStatus === "available" ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          <CheckCircle size={16} />
                        </span>
                      ) : phoneStatus === "taken" ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                          <AlertCircle size={16} />
                        </span>
                      ) : null
                    }
                  >
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${inputCls(
                        !!errors.phone || phoneStatus === "taken"
                      )} pr-10`}
                      placeholder="0912345678"
                    />
                  </InputWithIcon>
                </FieldWrapper>
              </div>

              <FieldWrapper
                label="Loại hình kinh doanh"
                error={undefined}
                hint={
                  <span className="text-slate-400 text-[11px] ml-1">
                    Chọn loại hình phù hợp để admin xét duyệt nhanh hơn.
                  </span>
                }
              >
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "individual", label: "Cá nhân", desc: "Bán lẻ nhỏ" },
                      { value: "household", label: "Hộ KD", desc: "Có GPKD hộ" },
                      { value: "company", label: "Doanh nghiệp", desc: "Có MST" },
                    ] as { value: BusinessType; label: string; desc: string }[]
                  ).map((opt) => {
                    const active = formData.businessType === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() =>
                          setFormData((p) => ({ ...p, businessType: opt.value }))
                        }
                        className={`flex flex-col items-start gap-1 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                          active
                            ? "border-blue-600 bg-blue-50 shadow-sm"
                            : "border-slate-100 bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Briefcase
                            size={13}
                            className={active ? "text-blue-600" : "text-slate-400"}
                          />
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </FieldWrapper>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldWrapper label="Mật khẩu" error={errors.password}>
                  <InputWithIcon
                    icon={<Lock size={18} />}
                    rightButton={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`${inputCls(!!errors.password)} pr-10`}
                      placeholder="••••••••"
                    />
                  </InputWithIcon>

                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < pwScore
                                ? strengthColors[pwScore]
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                        <span className="text-[10px] font-bold text-slate-500 ml-1 w-20 text-right">
                          {strengthLabels[pwScore]}
                        </span>
                      </div>
                      <ul className="text-[11px] space-y-0.5 ml-1">
                        <RuleItem ok={pwRules.length} text="Ít nhất 8 ký tự" />
                        <RuleItem ok={pwRules.upper} text="Có chữ in HOA" />
                        <RuleItem ok={pwRules.lower} text="Có chữ thường" />
                        <RuleItem ok={pwRules.digit} text="Có chữ số" />
                      </ul>
                    </div>
                  )}
                </FieldWrapper>

                <FieldWrapper
                  label="Xác nhận mật khẩu"
                  error={errors.confirmPassword}
                  hint={
                    formData.confirmPassword.length > 0 ? (
                      formData.password === formData.confirmPassword ? (
                        <span className="text-green-600 text-xs font-bold flex items-center gap-1 ml-1">
                          <CheckCircle size={10} /> Mật khẩu khớp
                        </span>
                      ) : (
                        <span className="text-red-500 text-xs font-bold flex items-center gap-1 ml-1">
                          <AlertCircle size={10} /> Mật khẩu không khớp
                        </span>
                      )
                    ) : null
                  }
                >
                  <InputWithIcon
                    icon={<Lock size={18} />}
                    rightButton={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    }
                  >
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`${inputCls(!!errors.confirmPassword)} pr-10`}
                      placeholder="••••••••"
                    />
                  </InputWithIcon>
                </FieldWrapper>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.terms)
                        setErrors((prev) => {
                          const c = { ...prev };
                          delete c.terms;
                          return c;
                        });
                    }}
                    className="mt-1 w-4 h-4 text-blue-600 border-2 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium leading-relaxed">
                    Tôi đồng ý với{" "}
                    <a href="#" className="text-blue-600 font-bold hover:underline">
                      Điều khoản dịch vụ
                    </a>{" "}
                    và{" "}
                    <a href="#" className="text-blue-600 font-bold hover:underline">
                      Chính sách bảo mật
                    </a>{" "}
                    của VietCommerce Hub.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-500 text-xs font-bold mt-1 ml-6 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.terms}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    sendingOtp ||
                    emailStatus === "taken" ||
                    emailStatus === "disposable" ||
                    phoneStatus === "taken"
                  }
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-700/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base group"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Đang gửi mã OTP...</span>
                    </>
                  ) : (
                    <>
                      Gửi mã xác thực{" "}
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Chúng tôi sẽ gửi mã OTP 6 số tới email của bạn để xác thực.
                </p>
              </div>
            </form>
          ) : (
            // OTP STEP
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <FieldWrapper label="Mã OTP (6 số)" error={undefined}>
                <InputWithIcon icon={<KeyRound size={18} />}>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className={`${inputCls(false)} tracking-[12px] font-mono text-center text-2xl`}
                    placeholder="••••••"
                    autoFocus
                  />
                </InputWithIcon>
                <p className="text-[11px] text-slate-400 mt-2 ml-1">
                  Mã có hiệu lực trong 10 phút.
                </p>
              </FieldWrapper>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-slate-500 hover:text-slate-700 font-bold"
                >
                  ← Quay lại chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || sendingOtp}
                  className="text-blue-600 hover:text-blue-700 font-bold disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Gửi lại sau ${resendCooldown}s`
                    : "Gửi lại OTP"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-700/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base group"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    Xác thực & Đăng ký{" "}
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */
const inputCls = (hasError: boolean) =>
  `w-full pl-10 pr-4 py-3 bg-slate-50 border-2 ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-slate-100 focus:border-blue-600"
  } rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-semibold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 text-sm`;

const FieldWrapper = ({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
      {label}
    </label>
    {children}
    {error ? (
      <p className="text-red-500 text-xs font-bold ml-1 flex items-center gap-1">
        <AlertCircle size={10} /> {error}
      </p>
    ) : (
      hint
    )}
  </div>
);

const InputWithIcon = ({
  icon,
  rightButton,
  children,
}: {
  icon: React.ReactNode;
  rightButton?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="relative group">
    {children}
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
      {icon}
    </span>
    {rightButton}
  </div>
);

const RuleItem = ({ ok, text }: { ok: boolean; text: string }) => (
  <li
    className={`flex items-center gap-1.5 font-medium ${
      ok ? "text-green-600" : "text-slate-400"
    }`}
  >
    <CheckCircle size={11} /> {text}
  </li>
);

const StepPill = ({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) => (
  <div
    className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-colors ${
      active
        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
        : done
        ? "bg-green-100 text-green-700"
        : "bg-slate-100 text-slate-400"
    }`}
  >
    {label}
  </div>
);
