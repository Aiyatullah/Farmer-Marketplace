// src/app/market/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Star,
  Heart,
  MapPin,
  Tag,
} from "lucide-react";

// Single placeholder image for all products (testing)
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974";

// Product type backed by Prisma API (/api/products)
type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  location: string;
  stock: number;
  image: string; // placeholder image since schema has no image field
};

export default function MarketPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([50]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(
    []
  );

  const [quickView, setQuickView] = useState<Product | null>(null);

  const locations = useMemo(
    () => ["all", ...new Set(products.map((p) => p.location))],
    [products]
  );
  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category))],
    [products]
  );

  useEffect(() => {
    // Load products from API (Prisma)
    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const list: Product[] = (data.products || []).map((p: Product) => ({
          ...p,
          image: PLACEHOLDER_IMAGE, // force single placeholder for testing
        }));
        setProducts(list);
        setFilteredProducts(list);
      } catch (e: unknown) {
        setError((e as Error)?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Stable pseudo-rating 3.5 - 5.0 based on product id
  const productRating = (id: string) => {
    const seed = id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    return 3.5 + ((seed % 16) / 16) * 1.5; // 3.5 - 5.0
  };

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "popular")
      list.sort((a, b) => productRating(b.id) - productRating(a.id));
    return list;
  }, [filteredProducts, sortBy]);

  useEffect(() => {
    let result = products;
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (locationFilter !== "all") {
      result = result.filter((p) => p.location === locationFilter);
    }
    result = result.filter((p) => p.price <= priceRange[0]);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    setFilteredProducts(result);
  }, [categoryFilter, locationFilter, priceRange, products, searchQuery]);

  const countInCart = (productId: string) =>
    cart.find((c) => c.product.id === productId)?.quantity || 0;

  const handleAddToCart = (productToAdd: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === productToAdd.id
      );
      if (existingItem) {
        // Do not exceed available stock
        if (existingItem.quantity >= productToAdd.stock) {
          return prevCart;
        }
        return prevCart.map((item) => {
          if (item.product.id !== productToAdd.id) return item;
          const newQty = Math.min(item.quantity + 1, productToAdd.stock);
          return { ...item, quantity: newQty };
        });
      }
      if (productToAdd.stock <= 0) return prevCart;
      return [...prevCart, { product: productToAdd, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.product.id !== productId) return item;
        const maxStock = item.product.stock;
        const next = Math.max(0, Math.min(maxStock, item.quantity + amount));
        return { ...item, quantity: next };
      });
      return updatedCart.filter((item) => item.quantity > 0);
    });
  };

  const subtotal = useMemo(
    () =>
      cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );

  const handleCheckout = async () => {
    try {
      if (cart.length === 0) return;
      const items = cart.map((c) => ({
        productId: c.product.id,
        quantity: c.quantity,
      }));
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Checkout failed");
      }
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: unknown) {
      console.error("checkout", e);
      alert((e as Error)?.message || "Checkout error");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading products...</p>
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

  return (
    // Page-level Cart Sheet
    <>
      <Sheet>
        <div className="relative">
          {/* Hero section */}
          <div className="bg-gradient-to-b from-primary/10 via-background to-background">
            <div className="container mx-auto px-4 py-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Find fresh, local produce
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Support farmers near you. Filter by category, location and
                    price.
                  </p>
                </div>
                {/* Cart trigger */}
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative h-11">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    View Cart
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
              </div>

              {/* Category chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={cat === categoryFilter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky filters bar */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container mx-auto px-4 py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 flex items-center gap-3">
                <Input
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label>Farm Location</Label>
                <Select onValueChange={setLocationFilter} defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location..." />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sort by</Label>
                <Select onValueChange={setSortBy} defaultValue={sortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Price slider row */}
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Max Price</span>
                <span className="font-semibold">
                  ${priceRange[0].toFixed(2)}
                </span>
              </div>
              <div className="w-full md:w-2/3">
                <Slider
                  defaultValue={[50]}
                  max={50}
                  step={1}
                  onValueChange={setPriceRange}
                />
              </div>
              <div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCategoryFilter("all");
                    setLocationFilter("all");
                    setPriceRange([50]);
                    setSearchQuery("");
                  }}
                >
                  Reset filters
                </Button>
              </div>
            </div>
          </div>

          {/* Cart Sheet content */}
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>Your Cart ({cart.length})</SheetTitle>
            </SheetHeader>
            <Separator />
            {cart.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-muted-foreground">Your cart is empty.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        <Image
                          src={item.product.image || PLACEHOLDER_IMAGE}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${item.product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        disabled={item.quantity >= item.product.stock}
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() =>
                          updateQuantity(item.product.id, -item.quantity)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <SheetFooter className="mt-auto">
                <div className="w-full space-y-4">
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </div>
              </SheetFooter>
            )}
          </SheetContent>

          {/* Quick View Sheet */}
          <Sheet
            open={!!quickView}
            onOpenChange={(open) => !open && setQuickView(null)}
          >
            <SheetContent side="right" className="w-full sm:max-w-md">
              {quickView && (
                <div className="space-y-4">
                  <div className="rounded-md overflow-hidden">
                    <AspectRatio ratio={4 / 3}>
                      <Image
                        src={quickView.image || PLACEHOLDER_IMAGE}
                        alt={quickView.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover"
                      />
                    </AspectRatio>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{quickView.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" /> {quickView.location}
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {quickView.category}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(productRating(quickView.id))
                              ? "fill-yellow-500"
                              : ""
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {productRating(quickView.id).toFixed(1)} / 5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      ${quickView.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      In stock: {quickView.stock}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        handleAddToCart(quickView);
                        setQuickView(null);
                      }}
                      disabled={
                        countInCart(quickView.id) >= quickView.stock ||
                        quickView.stock === 0
                      }
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {quickView.stock === 0
                        ? "Out of stock"
                        : countInCart(quickView.id) > 0
                        ? "Added"
                        : "Add to cart"}
                    </Button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Product grid */}
          <div className="container mx-auto px-4 pb-12">
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="group flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <CardHeader className="p-0">
                      <div className="relative">
                        <AspectRatio ratio={4 / 3}>
                          <Image
                            src={product.image || PLACEHOLDER_IMAGE}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover"
                          />
                        </AspectRatio>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Save"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        {product.stock === 0 && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-destructive text-destructive-foreground text-xs px-2 py-0.5">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {product.location}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5" />
                              {product.category}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < Math.round(productRating(product.id))
                                    ? "fill-yellow-500"
                                    : ""
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {productRating(product.id).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        In stock: {product.stock}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <p className="text-xl font-bold">
                        ${product.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setQuickView(product)}
                        >
                          Quick View
                        </Button>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={
                            countInCart(product.id) >= product.stock ||
                            product.stock === 0
                          }
                          variant={
                            countInCart(product.id) > 0
                              ? "secondary"
                              : "default"
                          }
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {product.stock === 0
                            ? "Out"
                            : countInCart(product.id) > 0
                            ? "Added"
                            : "Add"}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold">No Products Found</h2>
                <p className="text-muted-foreground">
                  Try adjusting your filters to find what youre looking for.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setCategoryFilter("all");
                    setLocationFilter("all");
                    setPriceRange([50]);
                    setSearchQuery("");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </Sheet>
    </>
  );
}
