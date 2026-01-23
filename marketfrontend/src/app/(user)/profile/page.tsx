"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      window.location.href = "/login";
      return;
    }

    const parsed: User = JSON.parse(raw);
    setUser(parsed);
    setFullName(parsed.fullName);
  }, []);

  if (!user) return null;

  const avatar =
    user.avatarUrl && user.avatarUrl.trim() !== ""
      ? user.avatarUrl
      : "/image/user/avatar_default.jpg";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ⛔ backend update sau
      const updatedUser = { ...user, fullName };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert("Cập nhật thông tin thành công");
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 720 }}>
      <h3 className="fw-bold mb-4">Hồ sơ của tôi</h3>

      <div className="card shadow-sm">
        <div className="card-body p-4">

          <div className="row g-4 align-items-center">
            {/* AVATAR */}
            <div className="col-md-4 text-center">
              <img
                src={avatar}
                alt="Avatar"
                className="rounded-circle border"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                }}
              />
              <p className="text-muted small mt-2">
                JPG, PNG. Tối đa 2MB
              </p>
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled
              >
                Thay ảnh (sắp có)
              </button>
            </div>

            {/* FORM */}
            <div className="col-md-8">
              <form onSubmit={handleSubmit} className="row g-3">

                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={user.email}
                    disabled
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 d-flex gap-2 mt-3">
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
