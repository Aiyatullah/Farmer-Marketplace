"use client";

import { LogOut } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const handleSignOut = async () => {
    try {
      // Clear all cookies (this will clear the session cookie too)
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // Clear local storage
      localStorage.clear();
      
      // Call the auth client sign out
      await authClient.signOut();
      
      // Force a full page reload to reset all states
      window.location.href = '/';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still redirect even if there's an error
      window.location.href = '/';
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleSignOut}
    >
      <LogOut className="mr-2 h-5 w-5" />
      Sign Out
    </Button>
  );
}
