import { NextResponse } from "next/server";
import { auth } from "@/../lib/auth";

export async function GET(request: Request) {
  // Forward headers so Better Auth can read Authorization: Bearer <token>
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ session: null }, { status: 401 });
  }
  return NextResponse.json({ session });
}
