"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  fullName: string;
  email: string;
};

export default function HeaderAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      setUser(JSON.parse(raw));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="d-flex gap-3 justify-content-end align-items-center">
      {!user ? (
        <>
          <a href="/register" className="fw-medium">
            Register
          </a>
          <span
            style={{
              width: "1px",
              height: "12px",
              background: "rgba(255,255,255,0.5)",
            }}
          />
          <a href="/login" className="fw-medium">
            Login
          </a>
        </>
      ) : (
        <>
          <span className="fw-medium">
            Xin chào, <strong>{user.fullName}</strong>
          </span>
        </>
      )}
    </div>
  );
}
