// app/actions/auth.ts
"use server";
import sql from "mssql";
import { cookies } from "next/headers";

export async function logoutAction() {
  const cookieStore = cookies();
  // sql.close(); // Đóng kết nối SQL nếu đang mở
  (await cookieStore).delete("role");
  (await cookieStore).delete("token"); // nếu có
  (await cookieStore).delete("refreshToken");
  (await cookieStore).delete("user");
  return { success: true };
}
