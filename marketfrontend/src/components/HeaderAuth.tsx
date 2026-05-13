"use client";

import { logoutAction } from "@/app/actions/auth";
import { useUserAuth } from "@/context/UserAuthContext";
import { findUserById } from "@/feature/client/service";
import { API_URL } from "@/helper/api";
import {
  clearAuth,
  getStoredAccessToken,
  isAccessTokenExpiring,
} from "@/lib/authSession";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
};

type UserNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  referenceId?: number | null;
};

const normalizeNotification = (item: any): UserNotification => {
  const referenceId = item?.referenceId ?? item?.reference_id;

  return {
    id: String(item?.id ?? item?.notificationId ?? ""),
    title: item?.title ?? "Thông báo",
    message: item?.message ?? "",
    type: item?.type ?? "system",
    isRead: Boolean(Number(item?.isRead ?? item?.read ?? 0)),
    createdAt: item?.createdAt ?? item?.created_at ?? new Date().toISOString(),
    referenceId:
      referenceId === null || referenceId === undefined
        ? null
        : Number(referenceId),
  };
};

const formatNotificationTime = (dateStr: string) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.max(0, Math.round(diffMs / 60000));
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

const getNotificationHref = async (notification: UserNotification) => {
  const type = notification.type.trim().toLowerCase();

  if (type === "shop" && notification.referenceId) {
    return `/shop/${notification.referenceId}`;
  }

  if (type === "promotion") {
    if (notification.referenceId) {
      try {
        const res = await fetch(`${API_URL}/api/vouchers/${notification.referenceId}`, {
          cache: "no-store",
        });

        if (res.ok) {
          const voucher = await res.json();
          const issuerType = String(
            voucher?.issuerType ?? voucher?.issuer_type ?? "",
          ).toUpperCase();
          const issuerId = Number(voucher?.issuerId ?? voucher?.issuer_id ?? 0);

          if (issuerType === "SHOP" && issuerId > 0) {
            return `/shop/${issuerId}`;
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    return "/voucher";
  }

  return null;
};

export default function HeaderAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const { roles, userId } = useUserAuth();
  const router = useRouter();
  // alert("User data : " + JSON.stringify(user) + ", Roles: " + roles);
  //alert("User ID from context: " + userId + ", Roles: " + roles);

  useEffect(() => {
    if (userId && roles) {
      // alert("Fetching user data for ID: " + userId);
      findUserById(userId)
        .then((userData) => {
          // alert("User data fetched: " + JSON.stringify(userData));
          setUser(userData);
        })
        .catch((error) => {
          console.warn("Session expired. Falling back to guest mode.", error);
          clearAuth();
          setUser(null);
          router.refresh();
        });
    } else {
      setUser(null);
    }
  }, [userId, roles, router]);
  // alert("Current user: " + JSON.stringify(user) + ", Roles: " + roles);

  const handleLogout = async () => {
    await logoutAction();
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("expiresIn");
    localStorage.removeItem("token");
    router.refresh();
    router.push("/login");
  };

  // ===== LOAD USER =====
  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token || isAccessTokenExpiring(0)) {
      setUser(null);
      return;
    }

    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    const handleAuthCleared = () => {
      setUser(null);
    };

    window.addEventListener("auth:cleared", handleAuthCleared);
    return () => window.removeEventListener("auth:cleared", handleAuthCleared);
  }, []);

  // ===== LOAD CART COUNT =====
  useEffect(() => {
    const cart = localStorage.getItem("cart");
    if (cart) {
      const items = JSON.parse(cart);
      setCartCount(Array.isArray(items) ? items.length : 0);
    }
  }, []);

  const loadNotifications = async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/notifications/user/${userId}`, {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data.map(normalizeNotification) : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markNotificationAsRead = async (notificationId: string) => {
    if (!userId) return;

    setNotifications((items) =>
      items.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      ),
    );

    try {
      await fetch(
        `${API_URL}/api/notifications/${notificationId}/read?user_id=${userId}`,
        {
          method: "PATCH",
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!userId) return;

    setNotifications((items) =>
      items.map((item) => ({ ...item, isRead: true })),
    );

    try {
      await fetch(`${API_URL}/api/notifications/user/${userId}/read-all`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = async (notification: UserNotification) => {
    await markNotificationAsRead(notification.id);

    const href = await getNotificationHref(notification);
    if (href) {
      router.push(href);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("expiresIn");
    localStorage.removeItem("token");
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
        {unreadCount > 0 && (
          <span className="badge-custom notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <div className="dropdown-menu-custom">
          <div className="notification-menu-head">
            <span>Thông báo</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllNotificationsAsRead}>
                Đã đọc tất cả
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="px-3 py-2 text-secondary text-center">
                No announcement yet
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`notification-item ${
                    item.isRead ? "" : "is-unread"
                  }`}
                  onClick={() => handleNotificationClick(item)}
                >
                  <span className="notification-title">{item.title}</span>
                  <span className="notification-message">{item.message}</span>
                  <span className="notification-time">
                    {formatNotificationTime(item.createdAt)}
                  </span>
                </button>
              ))
            )}
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
            <a href="/wishlist" className="dropdown-item">
              Wishlist
            </a>
            <a href="/purchase" className="dropdown-item">
              Purchase order
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

        .notification-badge {
          right: auto;
          left: 14px;
        }

        .top-dropdown,
        .user-dropdown {
          position: relative;
          cursor: pointer;
          z-index: 3000;
        }

        .top-dropdown::after,
        .user-dropdown::after {
          content: "";
          display: none;
          height: 8px;
          position: absolute;
          right: 0;
          top: 100%;
          width: max(100%, 280px);
          z-index: 3999;
        }

        .dropdown-menu-custom {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 180px;
          background: #fff;
          border-radius: 6px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          padding: 6px 0;
          display: none;
          z-index: 4000;
        }

        :global(.utility-bar) {
          position: relative;
          z-index: 3000;
        }

        .notification-menu-head {
          align-items: center;
          border-bottom: 1px solid #edf2f7;
          display: flex;
          font-size: 13px;
          font-weight: 700;
          justify-content: space-between;
          padding: 8px 12px;
        }

        .notification-menu-head button {
          background: transparent;
          border: 0;
          color: #0d6efd;
          font-size: 12px;
          font-weight: 600;
          padding: 0;
        }

        .notification-list {
          max-height: 320px;
          overflow-y: auto;
          width: 280px;
        }

        .notification-item {
          background: #fff;
          border: 0;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          display: block;
          padding: 10px 12px;
          text-align: left;
          width: 100%;
        }

        .notification-item:hover {
          background: #f8fafc;
        }

        .notification-item.is-unread {
          background: #eff6ff;
        }

        .notification-title,
        .notification-message,
        .notification-time {
          display: block;
        }

        .notification-title {
          color: #0f172a;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .notification-message {
          color: #475569;
          font-size: 12px;
          line-height: 1.35;
        }

        .notification-time {
          color: #94a3b8;
          font-size: 11px;
          margin-top: 4px;
        }

        .top-dropdown:hover .dropdown-menu-custom,
        .top-dropdown:hover::after,
        .user-dropdown:hover .dropdown-menu-custom {
          display: block;
        }

        .user-dropdown:hover::after {
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
