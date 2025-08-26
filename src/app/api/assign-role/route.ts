import { NextResponse } from "next/server";
import { auth } from "@/../lib/auth";
import { Role } from "@prisma/client";
import { db } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    // Authenticate caller using Authorization: Bearer <token>
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - No session found" }, 
        { status: 401 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" }, 
        { status: 400 }
      );
    }

    // Validate role
    const role = body?.role;
    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${Object.values(Role).join(', ')}` }, 
        { status: 400 }
      );
    }

    // Check if user already has a role
    const existingRole = await db.userRole.findUnique({
      where: { userId: session.user.id },
    });

    if (existingRole) {
      // If user already has a role, only allow changing to a different one
      if (existingRole.role !== role) {
        await db.userRole.update({
          where: { userId: session.user.id },
          data: { role: role as Role },
        });
      }
    } else {
      // Create new role assignment
      await db.userRole.create({
        data: { 
          userId: session.user.id, 
          role: role as Role,
        },
      });
    }

    // Return result
    return NextResponse.json({ 
      success: true,
      role: role,
      userId: session.user.id
    });

  } catch (error) {
    console.error('Error in /api/assign-role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
