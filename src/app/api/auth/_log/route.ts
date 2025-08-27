import { NextResponse } from "next/server";

export async function POST() {
  // This is a dummy endpoint that just returns success
  return NextResponse.json({ success: true });
}
