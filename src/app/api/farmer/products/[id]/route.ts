import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../lib/auth";
import { Role } from "@prisma/client";
import { db } from "../../../../../../lib/db";


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // ✅ 1. Check session
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ 2. Check role
  const userRole = await db.userRole.findUnique({
    where: { userId: session.user.id },
  });

  if (!userRole || userRole.role !== Role.FARMER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ✅ 3. Get product by id
  const { id } = params;
  const product = await db.product.findUnique({ where: { id } });

  if (!product || product.farmerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ✅ 4. Delete
  await db.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
