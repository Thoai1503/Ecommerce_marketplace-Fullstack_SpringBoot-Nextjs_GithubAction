// app/api/users/route.ts .
import { NextResponse } from "next/server";

export async function GET() {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Process the data
  return NextResponse.json({ success: true, data: body }, { status: 201 });
}
