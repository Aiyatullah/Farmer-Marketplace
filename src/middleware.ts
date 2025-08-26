import { NextRequest, NextResponse } from "next/server";

export async function middleware(_: NextRequest) {
  // Bearer tokens are stored in localStorage on the client, so middleware
  // cannot reliably check auth. Do per-route checks in code instead.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"], // Specify the routes the middleware applies to
};
