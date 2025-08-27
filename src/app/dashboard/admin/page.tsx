"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define proper types
interface User {
  id: string;
  name?: string;
  email: string;
  createdAt: string;
}

interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  price: number;
}

interface Counts {
  userCount: number;
  productCount: number;
  orderCount: number;
}

interface AdminOverview {
  users: User[];
  products: Product[];
  orders: Order[];
  counts: Counts;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminOverview | null>(null);

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
        // Verify role and load data
        const res = await fetch("/api/admin/overview", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        });
        if (res.status === 401) {
          if (mounted) router.replace("/");
          return;
        }
        if (res.status === 403) {
          if (mounted) router.replace("/dashboard");
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to load admin data");
        }
        const j: AdminOverview = await res.json();
        if (mounted) setData(j);
      } catch (e: unknown) {
        if (mounted) {
          const errMsg =
            e instanceof Error ? e.message : "Failed to load admin dashboard";
          setError(errMsg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const {
    users = [],
    products = [],
    orders = [],
    counts = { userCount: 0, productCount: 0, orderCount: 0 },
  } = data || {};

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of users, products, and orders.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {counts.userCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {counts.productCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {counts.orderCount}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="py-2 pr-4">{u.name || "—"}</td>
                      <td className="py-2 pr-4">{u.email}</td>
                      <td className="py-2">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t">
                      <td className="py-2 pr-4">{o.id.slice(0, 8)}…</td>
                      <td className="py-2 pr-4">{o.userId.slice(0, 8)}…</td>
                      <td className="py-2 pr-4">${o.total.toFixed(2)}</td>
                      <td className="py-2">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 pr-4">{p.name}</td>
                    <td className="py-2 pr-4">{p.category}</td>
                    <td className="py-2 pr-4">{p.location}</td>
                    <td className="py-2 pr-4">{p.quantity}</td>
                    <td className="py-2">${p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
