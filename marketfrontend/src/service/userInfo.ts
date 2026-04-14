import http from "@/lib/http";

export interface UserInfo {
  id: number;
  email?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
}

/**
 * Fetch user info by user_id (store owner info)
 * @param userId - User ID to fetch
 * @returns User information
 */
export const getUserInfoById = async (userId: number): Promise<UserInfo> => {
  try {
    const response = await http.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user info for user_id=${userId}:`, error);
    return {
      id: userId,
      email: "",
      fullName: "",
      phone: "",
      avatar: "",
    };
  }
};

/**
 * Fetch multiple users info by IDs (batch)
 * @param userIds - Array of user IDs
 * @returns Map of user info by user ID
 */
export const getUsersInfoByIds = async (
  userIds: number[],
): Promise<Record<number, UserInfo>> => {
  const uniqueIds = Array.from(new Set(userIds)); // Remove duplicates
  const results: Record<number, UserInfo> = {};

  try {
    // If API supports batch GET, call it; otherwise fetch individually
    // For now, we'll fetch individually to ensure compatibility
    await Promise.all(
      uniqueIds.map(async (userId) => {
        try {
          const userInfo = await getUserInfoById(userId);
          results[userId] = userInfo;
        } catch (error) {
          console.error(`Failed to fetch user_id=${userId}:`, error);
          results[userId] = {
            id: userId,
            email: "",
            fullName: "",
            phone: "",
            avatar: "",
          };
        }
      }),
    );

    return results;
  } catch (error) {
    console.error("Failed to fetch users info:", error);
    return {};
  }
};
