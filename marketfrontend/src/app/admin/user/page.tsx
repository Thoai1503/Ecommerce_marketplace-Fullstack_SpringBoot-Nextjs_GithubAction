"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MoreVertical,
  Shield,
  ShoppingCart,
  User as UserIcon,
} from "lucide-react";
import { Skeleton } from "@mui/material";
import http from "@/lib/http";

/* ================= TYPES ================= */
interface User {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  userType: string; // buyer | seller | admin
  isActive: number; // 1 | 0
}

/* ================= API ================= */
// const fetchUsers = async (): Promise<User[]> => {
//   const res = await fetch("http://localhost:8000/users");
//   if (!res.ok) throw new Error("Fetch users failed");
//   return res.json();
// };

const fetchUsers2 = async (): Promise<User[]> => {
  const res = await http
    .get("/users")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
  return res;
};

/* ================= ROLE BADGE ================= */
const renderRole = (role: string) => {
  switch (role.toLowerCase()) {
    case "both":
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger">
          ADMIN
        </span>
      );

    case "seller":
      return (
        <span className="badge bg-warning-subtle text-warning border border-warning">
          SELLER
        </span>
      );

    case "buyer":
      return (
        <span className="badge bg-info-subtle text-info border border-info">
          BUYER
        </span>
      );

    default:
      return (
        <span className="badge bg-secondary-subtle text-secondary border">
          UNKNOWN
        </span>
      );
  }
};

/* ================= PAGE ================= */
const Page: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers2,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);

const users = [...data]
  .filter((u) =>
    ["buyer", "seller"].includes(u.userType.toLowerCase())
  )
  .filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => a.userId - b.userId);


  return (
    <div className="container-fluid px-4 py-4">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold mb-3">Người dùng</h2>

        <div style={{ maxWidth: 420 }}>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} />
            </span>
            <input
              className="form-control border-start-0"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between">
          <div className="fw-bold d-flex align-items-center gap-2">
            <Users size={20} className="text-primary" />
            Danh sách người dùng
          </div>
          <span className="badge bg-primary-subtle text-primary border">
            {users.length} user
          </span>
        </div>

        <div className="card-body p-0">
          {isLoading ? (
            <div className="p-3">
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => {
                    const isActive = u.isActive === 1;

                    return (
                      <tr key={u.userId}>
                        <td>{index + 1}</td>
                        <td className="fw-semibold">{u.fullName}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>{renderRole(u.userType)}</td>
                        <td>
                          {isActive ? (
                            <span className="badge bg-success-subtle text-success border border-success">
                              Active
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary border">
                              <EyeOff size={12} className="me-1" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-link text-muted"
                              data-bs-toggle="dropdown"
                            >
                              <MoreVertical size={18} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                              <li>
                                <button className="dropdown-item">
                                  Xem chi tiết
                                </button>
                              </li>
                              <li>
                                <button className="dropdown-item">
                                  Chỉnh sửa
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
