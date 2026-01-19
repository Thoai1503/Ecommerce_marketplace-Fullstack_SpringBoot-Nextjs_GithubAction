"use client";

import React, { useState } from "react";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-xl shadow-xl px-8 py-10">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Login
        </h1>
        <p className="text-center text-gray-500 mt-1 mb-8">
          Welcome back!
        </p>

        {/* Email */}
        <div className="mb-5 text-black">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="text"
            placeholder="Enter your email"
            className="w-full h-12 rounded-lg border border-gray-300 px-4
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-3 text-black">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className="w-full h-12 rounded-lg border border-gray-300 px-4 pr-12
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              👁
            </button>
          </div>

          <div className="flex justify-end mt-2">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>
        </div>

        {/* Login Button */}
        <button
          className="w-full h-12 mt-4 rounded-lg bg-blue-600 text-white font-semibold
                     hover:bg-blue-700 transition"
        >
          Log in
        </button>

        {/* Register */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don’t have an account?
            <a
              href="/register"
              className="ml-1 text-blue-600 font-semibold hover:underline"
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
