import http from "@/lib/http";
import { API_URL } from "@/helper/api";

export type User = {
  id: number;
  email: string;
  phone?: string | null;
  fullName: string;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  userType: string;
  isVerified: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
};

/**
 * Update user avatar via multipart form upload
 * @param userId - User ID
 * @param avatarFile - Avatar file to upload
 * @returns Updated user object
 */
export const uploadUserAvatar = async (
  userId: number,
  avatarFile: File,
): Promise<User> => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  return await http
    .post(`/users/${userId}/avatar`, formData)
    .then((res) => res.data)
    .catch((error) => {
      console.error("Avatar upload error:", error);
      throw error;
    });
};

/**
 * Get user by ID
 * @param userId - User ID
 * @returns User object
 */
export const getUserById = async (userId: number): Promise<User> => {
  return await http
    .get(`/users/${userId}`)
    .then((res) => res.data)
    .catch((error) => {
      console.error("Get user error:", error);
      throw error;
    });
};
