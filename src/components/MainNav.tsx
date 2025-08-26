"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Home, ShoppingCart, LayoutDashboard } from "lucide-react";
import { SignOutButton } from "@/app/signout";

type NavLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

export function MainNav({ isAuthenticated = false, userRole = '' }) {
  const pathname = usePathname();

  const navLinks: NavLink[] = [
    { name: 'Home', href: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Market', href: '/market', icon: <ShoppingCart className="h-5 w-5" /> },
  ];

  if (isAuthenticated) {
    navLinks.push({
      name: 'Dashboard',
      href: userRole === 'FARMER' ? '/dashboard/farmer' : '/dashboard/customer',
      icon: <LayoutDashboard className="h-5 w-5" />
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              FarmConnect
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 text-sm font-medium ${
                  pathname === link.href ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
