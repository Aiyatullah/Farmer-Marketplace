"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, Package, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {Separator} from "./ui/separator";

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELED";

const statusVariants = {
  PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  PAID: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  SHIPPED: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
  COMPLETED: 'bg-green-100 text-green-800 hover:bg-green-100',
  CANCELED: 'bg-red-100 text-red-800 hover:bg-red-100',
} as const;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface OrderCardProps {
  order: {
    id: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
    items: OrderItem[];
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const statusMap = {
    PENDING: { text: 'Pending' },
    PAID: { text: 'Paid' },
    SHIPPED: { text: 'Shipped' },
    COMPLETED: { text: 'Completed' },
    CANCELED: { text: 'Canceled' },
  } as const;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Order #{order.id.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusVariants[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
            {statusMap[order.status]?.text ?? order.status}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid gap-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × ${item.price.toFixed(2)} each
                  </p>
                </div>
                <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {format(new Date(order.createdAt), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {format(new Date(order.createdAt), 'h:mm a')}
              </div>
            </div>
            <p className="font-medium">Total: ${order.total.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t bg-muted/25 p-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orders/${order.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
