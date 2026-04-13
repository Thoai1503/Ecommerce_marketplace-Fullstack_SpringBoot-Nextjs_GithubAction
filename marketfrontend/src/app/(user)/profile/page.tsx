"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/helper/api";
import { useUserAuth } from "@/context/UserAuthContext";
import { uploadUserAvatar, User } from "@/services/userService";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const { setRoles } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
    setUser(JSON.parse(raw));
  }, []);

  if (!user) return null;

  const avatar =
    avatarPreview ||
    (user.avatarUrl && user.avatarUrl.trim() !== ""
      ? user.avatarUrl
      : "/image/user/avatar_default.jpg");

  // 🔒 khóa nếu đã set
  const isGenderLocked = user.gender !== null;
  const isDobLocked = user.dateOfBirth !== null;

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
    </div>
  );
}
