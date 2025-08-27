import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return a minimal session response
    return NextResponse.json({ 
      session: null,
      error: null
    });
  } catch (error) {
    return NextResponse.json(error, { status: 500 }); // Internal Server Error
  }
}
