import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../lib/auth";
import { Role } from "@prisma/client";
import { db } from "../../../../../../lib/db";

async function requireFarmer(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const userRole = await db.userRole.findUnique({
    where: { userId: session.user.id },
  });
  if (!userRole || userRole.role !== Role.FARMER) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const check = await requireFarmer(request);
  if ("error" in check) return check.error;

  const { session } = check;
  const id = context.params.id;

  const product = await db.product.findUnique({ where: { id } });
  if (!product || product.farmerId !== session!.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
