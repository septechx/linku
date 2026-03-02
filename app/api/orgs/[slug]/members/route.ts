import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organization } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/orgs/[slug]/members - Get all organization members
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { slug } = await params;

  try {
    // Get organization with members
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: {
          with: {
            user: {
              columns: {
                id: true,
                email: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if user is a member
    const membership = org.members.find((m) => m.userId === userId);
    if (!membership) {
      return NextResponse.json(
        { error: "You don't have access to this organization" },
        { status: 403 },
      );
    }

    // Format members array with user details
    const members = org.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user,
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
