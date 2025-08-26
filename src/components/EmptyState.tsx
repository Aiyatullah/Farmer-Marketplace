"use client";

import { Button } from "./ui/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  title = "No orders yet",
  description = "You haven't placed any orders yet. Start shopping to see your orders here.",
  actionText = "Browse Products",
  actionHref = "/market"
}: {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          {description}
        </p>
        <Button asChild>
          <Link href={actionHref}>{actionText}</Link>
        </Button>
      </div>
    </div>
  );
}
