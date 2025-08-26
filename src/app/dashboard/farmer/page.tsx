/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function FarmerDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    location: "",
  });
  const [userName, setUserName] = useState<string>("Farmer");

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
        const meRes = await fetch("/api/me", {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!meRes.ok) {
          if (mounted) setError("Not signed in");
          return;
        }
        const me = await meRes.json();
        if (!mounted) return;
        setUserName(me.session?.user?.name ?? "Farmer");

        if (me.role !== "FARMER") {
          // Redirect non-farmers away
          router.replace(
            me.role === "CUSTOMER" ? "/dashboard/customer" : "/select-role"
          );
          return;
        }

        // Load products if farmer
        const listRes = await fetch("/api/farmer/products", {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          if (mounted) setProducts(listData.products || []);
        }
      } catch {
        if (mounted) setError("Failed to load session");
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
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // If we are here, role should be FARMER
  const name = userName || "Farmer";

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Farmer Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {name}!</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setCreating(true);
              setCreateError(null);
              try {
                const token = (() => {
                  try {
                    return localStorage.getItem("bearer_token") || "";
                  } catch {
                    return "";
                  }
                })();
                const res = await fetch("/api/farmer/products", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({
                    name: form.name,
                    description: form.description || undefined,
                    price: Number(form.price),
                    quantity: Number(form.quantity),
                    category: form.category,
                    location: form.location,
                  }),
                });
                if (!res.ok) {
                  const j = await res.json().catch(() => ({}));
                  throw new Error(j?.error || "Failed to create product");
                }
                const j = await res.json();
                setProducts((prev) => [j.product, ...prev]);
                setForm({
                  name: "",
                  description: "",
                  price: "",
                  quantity: "",
                  category: "",
                  location: "",
                });
              } catch (e: any) {
                setCreateError(e?.message || "Failed to create product");
              } finally {
                setCreating(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="E.g., Fresh Tomatoes"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                placeholder="E.g., Vegetables"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="E.g., Springfield, IL"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="Short description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <CardFooter className="sm:col-span-2 p-0 pt-2">
              <Button
                type="submit"
                disabled={creating}
                className="w-full sm:w-auto"
              >
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Product
              </Button>
              {createError && (
                <p className="text-sm text-red-600 ml-4">{createError}</p>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <li key={p.id}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-1">
                      <p>
                        {p.category} • {p.location}
                      </p>
                      <p>
                        ${p.price} • Qty {p.quantity}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          const token = (() => {
                            try {
                              return localStorage.getItem("bearer_token") || "";
                            } catch {
                              return "";
                            }
                          })();
                          const res = await fetch(
                            `/api/farmer/products/${p.id}`,
                            {
                              method: "DELETE",
                              headers: token
                                ? { Authorization: `Bearer ${token}` }
                                : {},
                            }
                          );
                          if (res.ok) {
                            setProducts((prev) =>
                              prev.filter((x) => x.id !== p.id)
                            );
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
