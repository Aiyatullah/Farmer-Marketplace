import { NextResponse } from "next/server";
import { auth } from "@/../lib/auth";
import { db } from "@/../lib/db";

// Map backend order status to frontend status
function mapOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'PENDING',
    'PAID': 'PROCESSING',
    'SHIPPED': 'SHIPPED',
    'COMPLETED': 'DELIVERED',
    'CANCELED': 'CANCELLED'
  };
  return statusMap[status] || status;
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Fetch user role
    const userRole = await db.userRole.findUnique({
      where: { userId },
    });

    let orders;
    
    if (userRole?.role === 'FARMER') {
      // For farmers, get all orders containing their products
      orders = await db.order.findMany({
        where: {
          items: {
            some: {
              product: {
                farmerId: userId
              }
            }
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // For customers, get their own orders
      orders = await db.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // Get user data for the response
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        userRole: true
      }
    });

    // Map order statuses to match frontend expectations
    const mappedOrders = orders.map(order => ({
      ...order,
      status: mapOrderStatus(order.status)
    }));

    return NextResponse.json({
      orders: mappedOrders,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.userRole?.role || 'CUSTOMER'
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
