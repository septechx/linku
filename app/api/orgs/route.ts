import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organization, organizationMember } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/orgs - List organizations for current user
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Get organizations with member count and user's role
    const memberships = await db.query.organizationMember.findMany({
      where: eq(organizationMember.userId, userId),
      with: {
        organization: {
          with: {
            members: true,
          },
        },
      },
      orderBy: desc(organizationMember.joinedAt),
    });

    const organizations = memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      description: membership.organization.description,
      role: membership.role,
      memberCount: membership.organization.members.length,
      joinedAt: membership.joinedAt,
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 },
    );
  }
}

// POST /api/orgs - Create new organization
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Slug can only contain lowercase letters, numbers, and hyphens",
        },
        { status: 400 },
      );
    }

    // Check if slug is already taken
    const existingOrg = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization slug is already taken" },
        { status: 409 },
      );
    }

    // Create organization and membership in a transaction
    const result = await db.transaction(async (tx) => {
      // Create the organization
      const [newOrg] = await tx
        .insert(organization)
        .values({
          name,
          slug,
          description: description || null,
        })
        .returning();

      // Add creator as owner
      await tx.insert(organizationMember).values({
        organizationId: newOrg.id,
        userId,
        role: "owner",
      });

      return newOrg;
    });

    return NextResponse.json({ organization: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
