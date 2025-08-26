import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market – FarmConnect",
  description: "Browse and buy fresh farm produce from local farmers.",
  openGraph: {
    title: "Market – FarmConnect",
    description: "Browse and buy fresh farm produce from local farmers.",
    type: "website",
  },
  alternates: {
    canonical: "/market",
  },
};

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
