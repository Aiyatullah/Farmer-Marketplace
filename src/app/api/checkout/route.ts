import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { db } from "../../../../lib/db";
import { auth } from "@/../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const items: Array<{ productId: string; quantity: number }> =
      body?.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const sessionAuth = await auth.api.getSession({ headers: req.headers });
    const userId = sessionAuth?.user?.id;

    // Fetch products
    const ids = items.map((i) => i.productId);
    const products = await db.product.findMany({ where: { id: { in: ids } } });

    // Build Stripe line items
    const line_items = items.map((cartItem) => {
      const p = products.find((x) => x.id === cartItem.productId);
      if (!p) throw new Error(`Product ${cartItem.productId} not found`);

      const qty = Math.min(
        Math.max(1, Number(cartItem.quantity || 0)),
        p.quantity
      );
      if (qty <= 0) throw new Error(`Product ${p.name} out of stock`);

      return {
        quantity: qty,
        price_data: {
          currency: "usd",
          product_data: {
            name: p.name,
            description: p.description || undefined,
            metadata: { productId: p.id },
          },
          unit_amount: Math.round(p.price * 100),
        },
      };
    });

    // Also attach a compact items summary in session metadata for webhook fallback
    const itemsSummary = items
      .map((i) => {
        const p = products.find((x) => x.id === i.productId);
        if (!p) return null;
        const qty = Math.min(Math.max(1, Number(i.quantity || 0)), p.quantity);
        if (qty <= 0) return null;
        return { productId: p.id, quantity: qty, price: p.price };
      })
      .filter(Boolean) as Array<{ productId: string; quantity: number; price: number }>;

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      customer_creation: "if_required",
      metadata: {
        ...(userId && { userId }),
        items: JSON.stringify(itemsSummary),
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (e: any) {
    console.error("checkout error", e);
    return NextResponse.json(
      { error: e?.message || "Checkout error" },
      { status: 500 }
    );
  }
}

