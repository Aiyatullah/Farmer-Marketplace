import { NextResponse } from "next/server";

export async function GET() {
  try {
     console.log("hello")
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
    );
  }
}
