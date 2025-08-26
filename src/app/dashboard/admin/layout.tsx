import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard – FarmConnect",
  description: "Overview of users, products, and orders for administrators.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/dashboard/admin",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
