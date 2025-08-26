import { auth } from "@/../lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await auth.signOut();
    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `auth-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error signing out" },
      { status: 500 }
    );
  }
}
