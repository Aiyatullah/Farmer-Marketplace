import { admin } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:3000",
  plugins: [admin()],
  fetchOptions: {
    // Save bearer token from response header after sign-in/up
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken) {
        try {
          localStorage.setItem("bearer_token", authToken);
        } catch {}
      }
    },
    // Automatically attach Authorization header for all client requests
    auth: {
      type: "Bearer",
      token: () => {
        try {
          return localStorage.getItem("bearer_token") || "";
        } catch {
          return "";
        }
      },
    },
  },
});
