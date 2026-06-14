// app/api/users/route.ts .
import { NextResponse } from "next/server";
import pool from "@/lib/db";
// export async function GET() {
//   const users = [
//     { id: 1, name: "Alice" },
//     { id: 2, name: "Bob" },
//   ];

//   return NextResponse.json(users);
// }
export async function GET() {
  try {
    const [rows] = await pool.execute("SELECT * FROM user");
    console.log(rows);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Lỗi query database" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  // Process the data
  return NextResponse.json({ success: true, data: body }, { status: 201 });
}
