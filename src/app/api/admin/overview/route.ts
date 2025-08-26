import { NextResponse } from "next/server";
import { auth } from "@/../lib/auth";
import { db } from "@/../lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ADMIN role
    const role = await db.userRole.findUnique({
      where: { userId: session.user.id },
    });
    if (!role || role.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [users, products, orders, counts] = await Promise.all([
      db.user.findMany({
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          category: true,
          location: true,
          farmerId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.order.findMany({
        select: {
          id: true,
          userId: true,
          total: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      (async () => {
        const userCount = await db.user.count();
        const productCount = await db.product.count();
        const orderCount = await db.order.count();
        return { userCount, productCount, orderCount };
      })(),
    ]);

    return NextResponse.json({ users, products, orders, counts });
  } catch (error) {
    console.error("/api/admin/overview", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
