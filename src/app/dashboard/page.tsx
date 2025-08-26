"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = (() => {
          try { return localStorage.getItem("bearer_token") || ""; } catch { return ""; }
        })();
        const res = await fetch("/api/me", {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          if (mounted) {
            setError("Not signed in");
          }
          return;
        }
        const data = await res.json();
        const role = data.role as string | null;
        if (mounted) {
          if (role === "CUSTOMER") {
            router.replace("/dashboard/customer");
          } else if (role === "FARMER") {
            router.replace("/dashboard/farmer");
          } else if (role === "ADMIN") {
            router.replace("/dashboard/admin");
          } else {
            // If no role is assigned, redirect to role selection
            router.push("/select-role");
          }
        }
      } catch (err) {
        if (mounted) setError("Failed to load session"+err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  });

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>{error}</h1>;
  
  return null;
}