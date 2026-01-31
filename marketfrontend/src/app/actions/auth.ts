// app/actions/auth.ts
"use server";

import { cookies } from "next/headers";

export async function logoutAction() {
  const cookieStore = cookies();

  (await cookieStore).delete("role");
  (await cookieStore).delete("token"); // nếu có
  (await cookieStore).delete("user");
  return { success: true };
}
