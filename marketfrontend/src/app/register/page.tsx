"use client";

import React, { useState } from "react";

const API_URL = "http://localhost:8000";

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

const Page: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  /* ================= CHANGE ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
    setSuccess(null);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);

    // FE validate
    if (formData.password !== formData.confirmPassword) {
      setErrors({
        confirmPassword: "Confirm password does not match.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const message = await res.text();

        if (message.toLowerCase().includes("email")) {
          setErrors({ email: message });
        } else if (message.toLowerCase().includes("password")) {
          setErrors({ password: message });
        } else {
          setErrors({ general: message || "Registration failed." });
        }
        return;
      }

      // SUCCESS
      setSuccess("Registration successful! Redirecting to login...");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Auto redirect
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch {
      setErrors({
        general: "Unable to connect to the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error?: string) =>
    `w-full h-12 rounded-lg border px-4 text-sm placeholder:text-gray-400
     focus:outline-none focus:ring-2
     ${
       error
         ? "border-red-500 focus:ring-red-500"
         : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
     }`;

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/image/ecommerce.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl bg-white rounded-3xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[#f4f8ff]">
          <div>
            <h2 className="text-4xl font-extrabold text-blue-600 leading-tight">
              Shop till you drop,
              <br />
              receive a great gift
            </h2>
            <p className="mt-4 text-gray-600 max-w-md">
              Join the leading online shopping community to receive thousands of
              vouchers and exclusive deals every day.
            </p>
          </div>

          <ul className="space-y-5">
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600">
                local_shipping
              </span>
              <div>
                <p className="font-semibold text-black">Free shipping</p>
                <p className="text-sm text-gray-500">First order from 0 VND</p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600">
                sell
              </span>
              <div>
                <p className="font-semibold text-black">Good prices every day</p>
                <p className="text-sm text-gray-500">
                  Guaranteed lowest prices.
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600">
                verified_user
              </span>
              <div>
                <p className="font-semibold text-black">Information security</p>
                <p className="text-sm text-gray-500">
                  Absolute security for transactions.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="p-8 lg:p-12 flex items-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto space-y-4 text-black"
          >
            <h1 className="text-3xl font-bold">Register an account</h1>

            {/* SUCCESS */}
            {success && (
              <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 border border-green-200">
                {success}
              </div>
            )}

            {/* ERROR */}
            {errors.general && (
              <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-200">
                {errors.general}
              </div>
            )}

            <div>
              <input
                name="fullName"
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleChange}
                className={inputClass(errors.fullName)}
                required
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass(errors.email)}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass(errors.password) + " pr-12"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClass(errors.confirmPassword) + " pr-12"}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((v) => !v)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold
                         hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Processing..." : "Register now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
