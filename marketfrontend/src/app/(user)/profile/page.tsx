"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/helper/api";
import { useUserAuth } from "@/context/UserAuthContext";
import { uploadUserAvatar, User } from "@/services/userService";

type OwnedVoucher = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  discountType?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  validTo?: string | null;
  claimEndAt?: string | null;
  issuerType?: string | null;
  status: string;
  claimedAt?: string | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "No limits";
  return new Date(value).toLocaleDateString("vi-VN");
};

const getVoucherValue = (voucher: OwnedVoucher) => {
  if (voucher.discountType === "PERCENT") {
    return `Giam ${Number(voucher.discountPercent || 0)}%`;
  }

  if (voucher.discountType === "FIXED") {
    return `Giam ${Number(voucher.discountAmount || 0).toLocaleString("vi-VN")}d`;
  }

  if (voucher.discountType === "FREE_SHIPPING") {
    return "Mien phi van chuyen";
  }

  return voucher.title;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const { setRoles } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [hasSavedToDb, setHasSavedToDb] = useState(false); // 🔒 Track đã lưu DB chưa
  const [ownedVouchers, setOwnedVouchers] = useState<OwnedVoucher[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);

  /* ================= UPLOAD AVATAR MUTATION ================= */
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("User not found");
      return uploadUserAvatar(user.id, file);
    },
    onSuccess: (updatedUser: User) => {
      console.log("Avatar updated successfully:", updatedUser);

      // Update local state
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Clear file inputs
      setAvatarFile(null);
      setAvatarPreview(null);

      alert("Cập nhật ảnh đại diện thành công");
    },
    onError: (error: any) => {
      console.error("Avatar upload error:", error);
      const errorMsg =
        error?.response?.data || error.message || "Lỗi cập nhật ảnh";
      alert(`Lỗi: ${errorMsg}`);
    },
  });

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      window.location.href = "/login";
      return;
    }
    const parsedUser = JSON.parse(raw);
    setUser(parsedUser);
    
    // 🔒 Nếu đã có data trong DB (từ session trước) thì khóa
    const wasSaved = parsedUser.gender || parsedUser.dateOfBirth;
    setHasSavedToDb(!!wasSaved);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const loadOwnedVouchers = async () => {
      setVoucherLoading(true);

      try {
        const [userVouchersRes, vouchersRes] = await Promise.all([
          fetch(`${API_URL}/api/user-vouchers/user/${user.id}`),
          fetch(`${API_URL}/api/vouchers`),
        ]);

        if (!userVouchersRes.ok || !vouchersRes.ok) {
          throw new Error("Khong the tai voucher");
        }

        const [userVouchersJson, vouchersJson] = await Promise.all([
          userVouchersRes.json(),
          vouchersRes.json(),
        ]);

        const userVouchers = Array.isArray(userVouchersJson)
          ? userVouchersJson
          : [];
        const vouchers = Array.isArray(vouchersJson) ? vouchersJson : [];
        const voucherMap = new Map(
          vouchers.map((voucher: any) => [Number(voucher.id), voucher]),
        );

        const merged = userVouchers
          .map((item: any) => {
            const voucher = voucherMap.get(Number(item.voucherId ?? item.voucher_id));
            if (!voucher) return null;

            return {
              id: Number(voucher.id),
              code: voucher.code,
              title: voucher.title,
              description: voucher.description,
              discountType: voucher.discountType,
              discountPercent: voucher.discountPercent,
              discountAmount: voucher.discountAmount,
              validTo: voucher.validTo,
              claimEndAt: voucher.claimEndAt,
              issuerType: voucher.issuerType,
              status: item.status,
              claimedAt: item.claimedAt ?? item.claimed_at,
            } satisfies OwnedVoucher;
          })
          .filter((item: OwnedVoucher | null): item is OwnedVoucher => Boolean(item))
          .sort((a, b) => {
            const left = a.claimedAt ? new Date(a.claimedAt).getTime() : 0;
            const right = b.claimedAt ? new Date(b.claimedAt).getTime() : 0;
            return right - left;
          });

        setOwnedVouchers(merged);
      } catch (error) {
        console.error("Load owned vouchers error:", error);
        setOwnedVouchers([]);
      } finally {
        setVoucherLoading(false);
      }
    };

    loadOwnedVouchers();
  }, [user?.id]);

  if (!user) return null;

  const avatar =
    avatarPreview ||
    (user.avatarUrl && user.avatarUrl.trim() !== ""
      ? user.avatarUrl
      : "/image/user/avatar_default.jpg");

  // 🔒 Khóa khi đã lưu vào DB (sau khi submit thành công)
  const isGenderLocked = hasSavedToDb && !!user.gender && user.gender !== "";
  const isDobLocked = hasSavedToDb && !!user.dateOfBirth && user.dateOfBirth !== "";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setUser((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  /* ================= HANDLE AVATAR FILE CHANGE ================= */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước tệp không được vượt quá 2MB");
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* ================= HANDLE AVATAR UPLOAD ================= */
  const handleAvatarUpload = () => {
    if (!avatarFile) {
      alert("Vui lòng chọn ảnh");
      return;
    }

    uploadAvatar(avatarFile);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: user.fullName,
          phone: user.phone,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
        }),
      });

      if (!res.ok) {
        let msg = await res.text();
        // 🔍 Parse JSON nếu có
        try {
          const json = JSON.parse(msg);
          msg = json.message || json.error || msg;
        } catch {}
        
        // 🔍 Kiểm tra lỗi trùng số điện thoại
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes("phone") && (lowerMsg.includes("exist") || lowerMsg.includes("duplicate") || lowerMsg.includes("taken"))) {
          alert("Số điện thoại đã được sử dụng bởi tài khoản khác");
        } else {
          alert(msg || "Cập nhật thất bại");
        }
        return;
      }

      const updatedUser: User = await res.json();

      // ✅ LƯU LẠI LOCAL
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setHasSavedToDb(true); // 🔒 Bật khóa sau khi lưu thành công

      alert("Cập nhật thông tin thành công");
    } catch (err) {
      console.error(err);
      alert("Không kết nối được server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 900 }}>
      <h3 className="fw-bold mb-4">Hồ sơ của tôi</h3>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <div className="row g-4">
            {/* AVATAR */}
            <div className="col-md-3 text-center">
              <img
                src={avatar}
                alt="Avatar"
                className="rounded-circle border"
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
              <p className="text-muted small mt-2">JPG, PNG. Tối đa 2MB</p>
              <label className="btn btn-outline-secondary btn-sm">
                {isUploadingAvatar ? "Đang tải lên..." : "Thay ảnh"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                  disabled={isUploadingAvatar}
                />
              </label>
              {avatarFile && (
                <button
                  className="btn btn-primary btn-sm ms-2"
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? "Đang lưu..." : "Lưu ảnh"}
                </button>
              )}
            </div>

            {/* FORM */}
            <div className="col-md-9">
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={user.email} disabled />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    name="phone"
                    className="form-control"
                    value={user.phone ?? ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Họ và tên</label>
                  <input
                    name="fullName"
                    className="form-control"
                    value={user.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Ngày sinh
                    {isDobLocked && (
                      <span className="text-muted small ms-2">(đã khóa)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="form-control"
                    value={user.dateOfBirth ?? ""}
                    onChange={handleChange}
                    disabled={isDobLocked}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Giới tính
                    {isGenderLocked && (
                      <span className="text-muted small ms-2">(đã khóa)</span>
                    )}
                  </label>
                  <select
                    name="gender"
                    className="form-select"
                    value={user.gender ?? ""}
                    onChange={handleChange}
                    disabled={isGenderLocked}
                  >
                    <option value="">-- Chọn --</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Xác thực</label>
                  <input
                    className="form-control"
                    value={
                      user.isVerified === 1 ? "Đã xác thực" : "Chưa xác thực"
                    }
                    disabled
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Trạng thái</label>
                  <input
                    className="form-control"
                    value={user.isActive === 1 ? "Hoạt động" : "Bị khóa"}
                    disabled
                  />
                </div>

                <div className="col-12 d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    // onClick={() => setRoles(null)}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>

                  <a href="/" className="btn btn-outline-secondary">
                    Quay lại
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0">Voucher currently in possession</h5>
            <span className="badge text-bg-light">
              {ownedVouchers.length} voucher
            </span>
          </div>

          {voucherLoading ? (
            <div className="text-muted">Loading voucher list...</div>
          ) : ownedVouchers.length === 0 ? (
            <div className="text-muted">
              You don't have any vouchers. Please visit the vouchers page to claim offers.
            </div>
          ) : (
            <div className="row g-3">
              {ownedVouchers.map((voucher) => (
                <div key={`${voucher.id}-${voucher.claimedAt}`} className="col-12 col-md-6">
                  <div
                    className="border rounded-4 p-3 h-100"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255, 247, 237, 0.9), rgba(255, 255, 255, 1))",
                      borderColor: "rgba(251, 146, 60, 0.2)",
                    }}
                  >
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                      <div>
                        <div className="small text-danger fw-bold mb-1">
                          {voucher.code}
                        </div>
                        <div className="fw-bold">{getVoucherValue(voucher)}</div>
                      </div>
                      <span className="badge rounded-pill text-bg-light">
                        {voucher.status}
                      </span>
                    </div>

                    <div className="text-muted small mb-2">
                      {voucher.description || voucher.title}
                    </div>

                    <div className="small text-secondary">
                      <div>Claimed: {formatDate(voucher.claimedAt)}</div>
                      <div>Claim End: {formatDate(voucher.claimEndAt)}</div>
                      <div>Valid To: {formatDate(voucher.validTo)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
