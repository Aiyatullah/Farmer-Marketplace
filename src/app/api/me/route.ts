import { NextResponse } from "next/server";
import { auth } from "@/../lib/auth";
import { Role } from "@prisma/client";
import { db } from "../../../../lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ session: null }, { status: 401 });
    }

    // Find the user's role
    const userRole = await db.userRole.findUnique({
      where: { userId: session.user.id },
    });

    // If no role is found, return null for the role
    // We'll handle role assignment in a separate endpoint
    if (!userRole) {
      return NextResponse.json({ 
        session: {
          ...session,
          user: {
            ...session.user,
            role: null
          }
        }, 
        role: null 
      });
    }

    // Return the session with the user's role
    return NextResponse.json({ 
      session: {
        ...session,
        user: {
          ...session.user,
          role: userRole.role
        }
      }, 
      role: userRole.role 
    });

  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
