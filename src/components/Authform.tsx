// src/components/AuthForm.tsx (or your preferred path)
"use client";

import { useState } from "react";
import { authClient } from "@/../lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// You can keep this simple SVG component for the Google icon
const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.84-5.08 1.84-4.3 0-7.8-3.5-7.8-7.8s3.5-7.8 7.8-7.8c2.4 0 3.82.92 4.72 1.84l2.5-2.5C18.97 3.58 16.2 2 12.48 2 5.88 2 1 7.2 1 13s4.88 11 11.48 11c6.5 0 10.74-4.4 10.74-10.74 0-.74-.06-1.48-.18-2.22H12.48z"
    />
  </svg>
);

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"CUSTOMER" | "FARMER">("CUSTOMER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.email({ email, password });
      // after sign in redirect to "/" url (token saved by client onSuccess)
      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Create account
      await authClient.signUp.email({ email, password, name });
      // Sign in after successful signup (saves token via auth client onSuccess)
      await authClient.signIn.email({ email, password });
      // Assign role now that the token is present
      try {
        const token = (() => {
          try { return localStorage.getItem("bearer_token") || ""; } catch { return ""; }
        })();
        await fetch("/api/assign-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ role }),
        });
      } catch {}
      // redirect to "/" url after sign in
      window.location.href = "/";
      
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create account. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.social({ provider: "google" });
      if (result?.url) {
        window.location.href = result.url;
      } else {
        setError("Could not sign in with Google.");
        setIsLoading(false);
      }
    } catch (e) {
      setError("Could not sign in with Google."+e);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Tabs defaultValue="sign-in" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>

        {/* Sign In Tab */}
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your account to continue.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignInSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email</Label>
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin">Password</Label>
                  <Input
                    id="password-signin"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <br />
              <CardFooter className="flex flex-col items-start">
                {error && (
                  <p className="text-sm text-destructive mb-4">{error}</p>
                )}
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Sign Up Tab */}
        <TabsContent value="sign-up">
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>
                Enter your details to create a new account.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignUpSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-signup">Name</Label>
                  <Input
                    id="name-signup"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>I want to:</Label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="user-role"
                        value="CUSTOMER"
                        checked={role === "CUSTOMER"}
                        onChange={(e) => setRole(e.target.value as "CUSTOMER" | "FARMER")}
                        className="h-4 w-4 text-primary focus:ring-primary"
                        disabled={isSubmitting}
                      />
                      <span className="ml-2">Shop for fresh produce</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="user-role"
                        value="FARMER"
                        checked={role === "FARMER"}
                        onChange={(e) => setRole(e.target.value as "CUSTOMER" | "FARMER")}
                        className="h-4 w-4 text-primary focus:ring-primary"
                        disabled={isSubmitting}
                      />
                      <span className="ml-2">Sell my farm products</span>
                    </label>
                  </div>
                </div>
              </CardContent>
              <br />

              <CardFooter className="flex flex-col items-start">
                {error && (
                  <p className="text-sm text-destructive mb-4">{error}</p>
                )}
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Account
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Universal Social Login */}
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full mt-6"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Google
        </Button>
      </Tabs>
    </div>
  );
}
