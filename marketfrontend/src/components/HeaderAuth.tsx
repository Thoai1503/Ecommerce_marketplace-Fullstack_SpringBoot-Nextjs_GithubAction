"use client";

import { logoutAction } from "@/app/actions/auth";
import { useUserAuth } from "@/context/UserAuthContext";
import { findUserById } from "@/feature/client/service";
import { Alegreya } from "next/font/google";
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
  const [cartCount, setCartCount] = useState(0);
  const { roles, userId } = useUserAuth();
  // alert("User data : " + JSON.stringify(user) + ", Roles: " + roles);
  //alert("User ID from context: " + userId + ", Roles: " + roles);

  useEffect(() => {
    if (userId && roles) {
      // alert("Fetching user data for ID: " + userId);
      findUserById(userId).then((userData) => {
        // alert("User data fetched: " + JSON.stringify(userData));
        setUser(userData);
      });
    }
  }, [userId, roles]);
  // alert("Current user: " + JSON.stringify(user) + ", Roles: " + roles);

  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    localStorage.removeItem("user");
    router.refresh();
    router.push("/login");
  };

  // ===== LOAD USER =====
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  // ===== LOAD CART COUNT =====
  useEffect(() => {
    const cart = localStorage.getItem("cart");
    if (cart) {
      const items = JSON.parse(cart);
      setCartCount(Array.isArray(items) ? items.length : 0);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    //xoá cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/";
  };

  return (
    <div className="d-flex gap-3 justify-content-end align-items-center">
      {/* 🛒 CART */}
      <div
        className="position-relative cursor-pointer icon-btn"
        onClick={() => router.push("/cart")}
      >
        <span className="material-symbols-outlined">shopping_cart</span>
        cart
        {cartCount > 0 && <span className="badge-custom">{cartCount}</span>}
      </div>

      {/* 🔔 NOTIFICATION */}
      <div className="top-dropdown icon-btn">
        <span className="material-symbols-outlined">notifications</span>
        notification
        <div className="dropdown-menu-custom">
          <div className="px-3 py-2 text-secondary text-center">
            No announcement yet
          </div>
        </div>
      </div>

      {/* ❓ HELP */}
      <div className="top-dropdown icon-btn">
        <span className="material-symbols-outlined">help</span>
        Help
        <div className="dropdown-menu-custom">
          <a href="/help" className="dropdown-item">
            Help Center
          </a>
          <a href="/contact" className="dropdown-item">
            Contact Customer Service
          </a>
        </div>
      </div>

      {/* USER */}
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

          <span className="fw-medium user-name">{user.fullName}</span>

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

      {/* STYLE */}
      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          font-size: 100%;
        }

        .icon-btn:hover {
          opacity: 0.8;
        }

        .badge-custom {
          position: absolute;
          top: -4px;
          right: -8px;
          background: red;
          color: #fff;
          border-radius: 999px;
          font-size: 10px;
          padding: 2px 6px;
        }

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
