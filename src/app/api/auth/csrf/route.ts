import {auth} from "@/../lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { csrfToken } = await auth.getCsrfToken();
    return NextResponse.json({ csrfToken });
  } catch (error) {
    return NextResponse.json(
      { error: "Error generating CSRF token" },
      { status: 500 }
    );
  }
}
