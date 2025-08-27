import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../lib/auth";
import { Role } from "@prisma/client";
import { db } from "../../../../../../lib/db";

type ParamContext =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

export async function DELETE(
  request: NextRequest,
  context: ParamContext
): Promise<NextResponse> {
  const params = await context.params; // works for both sync & async
  const { id } = params;

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

  const product = await db.product.findUnique({ where: { id } });
  if (!product || product.farmerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
