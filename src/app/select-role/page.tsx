"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "FARMER" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token") || "";
      const response = await fetch("/api/assign-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign role");
      }

      // Redirect to the appropriate dashboard
      router.push(`/dashboard/${selectedRole.toLowerCase()}`);
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Failed to assign role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Select Your Role</h1>
        <p className="text-gray-600 mb-6 text-center">
          Please select whether you want to use the platform as a customer or a farmer.
        </p>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={() => setSelectedRole("CUSTOMER")}
            className={`w-full p-4 border-2 rounded-lg transition-colors ${
              selectedRole === "CUSTOMER"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <h3 className="font-medium text-lg">👤 Customer</h3>
            <p className="text-sm text-gray-500 mt-1 text-left">
              Browse and purchase fresh produce from local farmers.
            </p>
          </button>
          
          <button
            onClick={() => setSelectedRole("FARMER")}
            className={`w-full p-4 border-2 rounded-lg transition-colors ${
              selectedRole === "FARMER"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <h3 className="font-medium text-lg">👨‍🌾 Farmer</h3>
            <p className="text-sm text-gray-500 mt-1 text-left">
              Sell your fresh produce directly to customers.
            </p>
          </button>
        </div>

        <Button
          onClick={handleRoleSelect}
          disabled={!selectedRole || isLoading}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
