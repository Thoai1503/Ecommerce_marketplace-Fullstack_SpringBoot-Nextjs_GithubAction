"use client";

import { logoutAction } from "@/app/actions/auth";
import { useUserAuth } from "@/context/UserAuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
};

export default function HeaderAuth() {
  const [user, setUser] = useState<User | null>(null);
  const { roles } = useUserAuth();

  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    localStorage.removeItem("user");

    // BẮT BUỘC để layout đọc lại cookie
    router.refresh();
    router.push("/login");
  };

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      setUser(JSON.parse(raw));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="d-flex gap-3 justify-content-end align-items-center">
      {/* Notification */}
      <div className="top-dropdown">
        <span className="fw-medium d-flex align-items-center gap-1">
          <span className="material-symbols-outlined">notifications</span>
          Thông báo
        </span>
        <div className="dropdown-menu-custom">
          <div className="px-3 py-2 text-secondary text-center">
            Chưa có thông báo
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="top-dropdown">
        <span className="fw-medium d-flex align-items-center gap-1">
          <span className="material-symbols-outlined">help</span>
          Hỗ trợ
        </span>
        <div className="dropdown-menu-custom">
          <a href="/help" className="dropdown-item">
            Trung tâm trợ giúp
          </a>
          <a href="/contact" className="dropdown-item">
            Liên hệ CSKH
          </a>
        </div>
      </div>

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
        <div className="user-dropdown d-flex align-items-center gap-2">
          <img
            src={user.avatarUrl || "/image/user/avatar_default.jpg"}
            alt="avatar"
            className="user-avatar"
          />

          <span className="fw-medium user-name">
            {user.fullName} {roles}
          </span>

          <div className="dropdown-menu-custom">
            <a href="/profile" className="dropdown-item">
              Profile
            </a>
            <button
              onClick={handleLogout}
              className="dropdown-item text-danger"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .top-dropdown,
        .user-dropdown {
          position: relative;
          cursor: pointer;
        }

        .dropdown-menu-custom {
          position: absolute;
          top: 100%;
          right: 0;
          min-width: 180px;
          background: #fff;
          border-radius: 6px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          padding: 6px 0;
          display: none;
          z-index: 1000;
        }

        .top-dropdown:hover .dropdown-menu-custom,
        .user-dropdown:hover .dropdown-menu-custom {
          display: block;
        }

        .dropdown-item {
          display: block;
          width: 100%;
          padding: 8px 14px;
          background: transparent;
          border: none;
          text-align: left;
          font-size: 14px;
          color: #333;
          text-decoration: none;
        }

        .dropdown-item:hover {
          background: #f5f5f5;
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}
