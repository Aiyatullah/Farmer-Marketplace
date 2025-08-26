import Stripe from "stripe";

// Expect STRIPE_SECRET_KEY in env. Throw early if missing to surface config issues.
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
}

export const stripe = new Stripe(key);
