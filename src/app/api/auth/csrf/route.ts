import { NextResponse } from "next/server";

export async function GET() {
  try {
     console.log("hello")
  } catch (error) {
    return NextResponse.json(
      { error: "Error generating CSRF token" },
      { status: 500 }
    );
  }
}
