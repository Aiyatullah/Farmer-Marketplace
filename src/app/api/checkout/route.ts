import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { db } from "../../../../lib/db";
import { auth } from "@/../lib/auth";
import Stripe from "stripe";

type CartItem = {
  productId: string;
  quantity: number;
};

type ItemSummary = {
  productId: string;
  quantity: number;
  price: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const items: CartItem[] = body?.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const sessionAuth = await auth.api.getSession({ headers: req.headers });
    const userId = sessionAuth?.user?.id;

    // Fetch products
    const ids = items.map((i) => i.productId);
    const products = await db.product.findMany({ where: { id: { in: ids } } });

    // Build Stripe line items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((cartItem) => {
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

    // Items summary for webhook fallback
    const itemsSummary: ItemSummary[] = items
      .map((i) => {
        const p = products.find((x) => x.id === i.productId);
        if (!p) return null;

        const qty = Math.min(Math.max(1, Number(i.quantity || 0)), p.quantity);
        if (qty <= 0) return null;

        return { productId: p.id, quantity: qty, price: p.price };
      })
      .filter((x): x is ItemSummary => Boolean(x)); // type-safe filter

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
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "Unknown checkout error";
    console.error("checkout error", errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
