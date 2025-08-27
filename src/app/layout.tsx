import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/../lib/auth";
import { headers } from "next/headers";
import { MainNav } from "@/components/MainNav";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FarmConnect - Local Farmers Marketplace",
  description: "Connect with local farmers and buy fresh produce directly from the source.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });  
  const userRole = (session?.user as { role?: string })?.role || "";


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <Providers>
          <MainNav isAuthenticated={!!session?.user} userRole={userRole} />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t py-6 md:py-8 bg-background">
            <div className="container px-4 mx-auto">
              <div className="flex flex-col items-center justify-between md:flex-row">
                <div className="mb-4 md:mb-0">
                  <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                    FarmConnect
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} FarmConnect. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
