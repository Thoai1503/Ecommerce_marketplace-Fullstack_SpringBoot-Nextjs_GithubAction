"use client";

import React, { useState } from "react";

const Page: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    emailOrPhone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    console.log("REGISTER DATA:", formData);
    alert("Đăng ký thành công (demo)");
  };

  const inputClass =
    "w-full h-12 rounded-lg border border-gray-300 px-4 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
    "placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[#f4f8ff]">
          <div>
            <h2 className="text-4xl font-extrabold text-blue-600 leading-tight">
              Mua sắm thả ga,
              <br />
              nhận quà cực đã
            </h2>
            <p className="mt-4 text-gray-600 max-w-md">
              Tham gia cộng đồng mua sắm trực tuyến hàng đầu để nhận hàng ngàn
              voucher và ưu đãi độc quyền mỗi ngày.
            </p>
          </div>

          <ul className="space-y-5">
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600">
                local_shipping
              </span>
              <div>
                <p className="font-semibold text-black">Miễn phí vận chuyển</p>
                <p className="text-sm text-gray-500">
                  Cho đơn hàng đầu tiên từ 0đ
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600">
                sell
              </span>
              <div>
                <p className="font-semibold text-black">Giá tốt mỗi ngày</p>
                <p className="text-sm text-gray-500">
                  Cam kết giá rẻ nhất thị trường
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600">
                verified_user
              </span>
              <div>
                <p className="font-semibold text-black">Bảo mật thông tin</p>
                <p className="text-sm text-gray-500">
                  An toàn tuyệt đối cho mọi giao dịch
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="p-8 lg:p-12 flex items-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto space-y-4"
          >
            <div className="mb-4">
             <h1 className="text-3xl font-bold text-black">
                Đăng ký tài khoản
             </h1>
              <p className="text-gray-500 mt-1">
                Trải nghiệm mua sắm tuyệt vời cùng chúng tôi
              </p>
            </div>

            {/* Full name */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-black">Họ và tên</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Nhập họ và tên của bạn"
                required
              />
            </div>

            {/* Email / phone */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-black">
                Email
              </label>
              <input
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                 className={`${inputClass} pr-12 text-gray-900`}
                placeholder="Nhập email hoặc số điện thoại"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-black">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputClass} pr-12 text-gray-900`}
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-black">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputClass} pr-12 text-gray-900`}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword
                      ? "visibility_off"
                      : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-500/30"
            >
              Đăng ký ngay
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;