import { NextResponse } from "next/server";
import { auth } from "@/../lib/auth";
import { Role } from "@prisma/client";
import { db } from "../../../../../lib/db";

async function requireFarmer(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const userRole = await db.userRole.findUnique({ where: { userId: session.user.id } });
  if (!userRole || userRole.role !== Role.FARMER) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function GET(request: Request) {
  const check = await requireFarmer(request);
  if ('error' in check) return check.error;
  const { session } = check;
  const products = await db.product.findMany({
    where: { farmerId: session!.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const check = await requireFarmer(request);
  if ('error' in check) return check.error;
  const { session } = check;
  const body = await request.json().catch(() => ({}));
  const { name, description, price, quantity, category, location } = body || {};
  if (!name || !price || !quantity || !category || !location) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const product = await db.product.create({
    data: {
      name,
      description: description ?? null,
      price: Number(price),
      quantity: Number(quantity),
      category,
      location,
      farmerId: session!.user.id,
    },
  });
  return NextResponse.json({ product }, { status: 201 });
}
