import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      location: true,
      quantity: true,
      // description and farmerId are available if needed
    },
  });

  const mapped = products.map((p: {
    id: string;
    name: string;
    category: string;
    price: number;
    location: string;
    quantity: number;
  }) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    location: p.location,
    stock: p.quantity,
    // No image in schema; send a placeholder
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974",
  }));

  return NextResponse.json({ products: mapped });
}
