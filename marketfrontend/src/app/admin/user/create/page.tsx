"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import http from "@/lib/http";

const Page: React.FC = () => {
  const router = useRouter();

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    fullName: "",
    date_of_birth: "",
    gender: "other",
    isActive: 1,
  });

  /* ================= CLEANUP PREVIEW ================= */
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  /* ================= HANDLERS ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Avatar phải là file hình ảnh");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /* ================= VALIDATE FE ================= */
  const validate = (): boolean => {
    if (!formData.email.includes("@")) {
      setError("Email không hợp lệ");
      return false;
    }

    if (!/^\d{8,15}$/.test(formData.phone)) {
      setError("Số điện thoại phải từ 8–15 chữ số");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự");
      return false;
    }

    if (!formData.fullName.trim()) {
      setError("Họ và tên không được để trống");
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("password", formData.password);
      fd.append("full_name", formData.fullName);
      fd.append("gender", formData.gender);
      fd.append("is_active", String(formData.isActive));

      if (formData.date_of_birth) {
        fd.append("date_of_birth", formData.date_of_birth);
      }

      if (avatarFile) {
        fd.append("avatar", avatarFile);
      }

      // ❗ KHÔNG set Content-Type
      await http.post("/users", fd);

      router.push("/admin/user");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Tạo người dùng thất bại";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid px-4 py-4">
      {/* HEADER */}
      <div className="mb-4 d-flex align-items-center gap-3">
        <button className="btn btn-light" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="fw-bold mb-0">Tạo người dùng</h2>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body" style={{ maxWidth: 720 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger mb-3">{error}</div>
            )}

            {/* EMAIL */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* PHONE */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Số điện thoại</label>
              <input
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Mật khẩu</label>
              <input
                name="password"
                type="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* FULL NAME */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Họ và tên</label>
              <input
                name="fullName"
                className="form-control"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* AVATAR */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Avatar</label>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="border rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 96, height: 96, overflow: "hidden" }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageIcon size={32} className="text-muted" />
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            {/* DATE OF BIRTH */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Ngày sinh</label>
              <input
                type="date"
                name="date_of_birth"
                className="form-control"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>

            {/* GENDER */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Giới tính</label>
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* ACTIVE */}
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                checked={formData.isActive === 1}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked ? 1 : 0,
                  }))
                }
              />
              <label className="form-check-label">
                Kích hoạt tài khoản
              </label>
            </div>

            {/* ACTIONS */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={loading}
              >
                <Save size={18} />
                {loading ? "Đang lưu..." : "Lưu"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => router.back()}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
