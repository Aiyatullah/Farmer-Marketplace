import { NextResponse } from "next/server";
import { auth } from "@/../lib/auth";
import { Role } from "@prisma/client";
import { db } from "../../../../../lib/db";

// ✅ returns either NextResponse (if not allowed) or the session object
async function requireFarmer(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = await db.userRole.findUnique({
    where: { userId: session.user.id },
  });

  if (!userRole || userRole.role !== Role.FARMER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session; // ✅ safe, always session when valid farmer
}

export async function GET(request: Request) {
  const result = await requireFarmer(request);
  if (result instanceof NextResponse) return result; // error case
  const session = result; // valid session

  const products = await db.product.findMany({
    where: { farmerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const result = await requireFarmer(request);
  if (result instanceof NextResponse) return result;
  const session = result;

  const body = await request.json().catch(() => ({}));
  const { name, description, price, quantity, category, location } = body || {};

  if (!name || !price || !quantity || !category || !location) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const product = await db.product.create({
    data: {
      name,
      description: description ?? null,
      price: Number(price),
      quantity: Number(quantity),
      category,
      location,
      farmerId: session.user.id,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
