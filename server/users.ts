"use server";

import { auth } from "@/../lib/auth";
import { db } from "../lib/db";

export const signIn = async (email: string, password: string) => {
  return await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
};



export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: "CUSTOMER" | "FARMER" | "ADMIN",
) => {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  if (result.user?.id) {
    await db.userRole.create({
      data: {
        userId: result.user.id,
        role: role,
      },
    });
  }

  return result;
};



// Google sign in
export const signInWithGoogle = async () => {
  return await auth.api.signInSocial(
    {  
      body: {
      provider: "google",
    },
});
};

