"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000";

type User = {
  id: number;
  email: string;
  phone?: string | null;
  fullName: string;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  userType: string;
  isVerified: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      window.location.href = "/login";
      return;
    }
    setUser(JSON.parse(raw));
  }, []);

  if (!user) return null;

  const avatar =
    user.avatarUrl && user.avatarUrl.trim() !== ""
      ? user.avatarUrl
      : "/image/user/avatar_default.jpg";

  // 🔒 khóa nếu đã set
  const isGenderLocked = user.gender !== null;
  const isDobLocked = user.dateOfBirth !== null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => (prev ? { ...prev, [name]: value } : prev));
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
        const msg = await res.text();
        alert(msg || "Cập nhật thất bại");
        return;
      }

      const updatedUser: User = await res.json();

      // ✅ LƯU LẠI LOCAL
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

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
              <button className="btn btn-outline-secondary btn-sm" disabled>
                Thay ảnh (sắp có)
              </button>
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
                      <span className="text-muted small ms-2">
                        (đã khóa)
                      </span>
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
                      <span className="text-muted small ms-2">
                        (đã khóa)
                      </span>
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
                      user.isVerified === 1
                        ? "Đã xác thực"
                        : "Chưa xác thực"
                    }
                    disabled
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Trạng thái</label>
                  <input
                    className="form-control"
                    value={
                      user.isActive === 1 ? "Hoạt động" : "Bị khóa"
                    }
                    disabled
                  />
                </div>

                <div className="col-12 d-flex gap-2 mt-4">
                  <button
                    type="submit"
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
    </div>
  );
}
