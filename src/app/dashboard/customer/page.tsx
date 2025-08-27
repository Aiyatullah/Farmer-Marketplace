"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { OrderCard } from "@/components/OrderCard";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { OrderStatus } from "@/components/OrderCard";

// const statusVariants = {
//   PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
//   PAID: "bg-blue-100 text-blue-800 hover:bg-blue-100",
//   SHIPPED: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
//   COMPLETED: "bg-green-100 text-green-800 hover:bg-green-100",
//   CANCELED: "bg-red-100 text-red-800 hover:bg-red-100",
// } as const;

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

type Order = {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("Customer");
  const router = useRouter();

  // Role guard: ensure only CUSTOMER stays here
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = (() => {
          try {
            return localStorage.getItem("bearer_token") || "";
          } catch {
            return "";
          }
        })();
        const res = await fetch("/api/me", {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          if (mounted) router.replace("/");
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        const r = data.role as string | null;
        if (r === "FARMER") {
          router.replace("/dashboard/farmer");
          return;
        }
        if (!r) {
          router.replace("/select-role");
          return;
        }
        setName(data.session?.user?.name || "Customer");
      } catch {
        router.replace("/");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        console.log("Orders API Response:", data); // Debug log
        setOrders(data.orders || []);
        setName(data.user?.name || "Customer");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    // Check for success message in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("order") === "success") {
      toast.success("Order placed successfully!");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader className="text-destructive">
            <CardTitle>Error Loading Orders</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="ml-4 mb-4"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={5000} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {name}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your order history
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <a href="/market" className="hover:no-underline">
                Continue Shopping
              </a>
            </Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
