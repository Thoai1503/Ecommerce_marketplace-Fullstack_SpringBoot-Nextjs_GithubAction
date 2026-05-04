
import http from "@/lib/http";
import { Seller, SellerStatus } from "@/types/index";

export const getSellers = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<Seller[]> => {
  return await http
    .get("/admin/sellers", { params })
    .then((res) => {
      // Backend returns { data: [], total, page, size, totalPages }
      const body = res.data;
      return Array.isArray(body) ? body : (body.data ?? []);
    })
    .catch((error) => {
      throw error;
    });
};

export const getSellerById = async (id: string): Promise<Seller | undefined> => {
  return await http
    .get(`/admin/sellers/${id}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const createSeller = async (
  data: Omit<
    Seller,
    | "id"
    | "accountCode"
    | "createdAt"
    | "totalProducts"
    | "totalOrders"
    | "totalRevenue"
    | "rating"
    | "reviewCount"
  > & { password?: string },
): Promise<Seller> => {
  return await http
    .post("/admin/sellers", data)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateSeller = async (id: string, data: Partial<Seller>): Promise<Seller> => {
  return await http
    .put(`/admin/sellers/${id}`, data)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const deleteSellers = async (ids: string[]): Promise<boolean> => {
  // TODO: BE cần thêm bulk delete
  for (const id of ids) {
    await http.delete(`/admin/sellers/${id}`);
  }
  return true;
};

export const toggleSellerStatus = async (
  id: string,
  newStatus: SellerStatus,
  reason?: string,
): Promise<boolean> => {
  const action =
    newStatus === "BLOCKED" ? "block"
    : newStatus === "ACTIVE" ? "unblock"
    : newStatus === "REJECTED" ? "reject"
    : newStatus === "PENDING" ? "reopen"
    : "approve";
  const body = (newStatus === "BLOCKED" || newStatus === "REJECTED")
    ? { reason: reason ?? "Admin cập nhật trạng thái" }
    : {};

  return await http
    .patch(`/admin/sellers/${id}/${action}`, body)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const approveSeller = async (id: string): Promise<Seller> => {
  return await http
    .patch(`/admin/sellers/${id}/approve`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const rejectSeller = async (id: string, reason: string): Promise<Seller> => {
  return await http
    .patch(`/admin/sellers/${id}/reject`, { reason })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const reopenSeller = async (id: string): Promise<Seller> => {
  return await http
    .patch(`/admin/sellers/${id}/reopen`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const blockSeller = async (id: string, reason: string): Promise<Seller> => {
  return await http
    .patch(`/admin/sellers/${id}/block`, { reason })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const unblockSeller = async (id: string): Promise<Seller> => {
  return await http
    .patch(`/admin/sellers/${id}/unblock`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
