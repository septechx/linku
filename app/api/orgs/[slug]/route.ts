import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organization } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/orgs/[slug] - Get organization details
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
                name: true,
                email: true,
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

    return NextResponse.json({
      organization: {
        ...org,
        role: membership.role,
      },
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
  }
}

// PATCH /api/orgs/[slug] - Update organization
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { slug } = await params;

  try {
    const body = await request.json();
    const { name, description } = body;

    // Get organization and check membership
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const membership = org.members.find((m) => m.userId === userId);
    if (!membership) {
      return NextResponse.json(
        { error: "You don't have access to this organization" },
        { status: 403 },
      );
    }

    // Only owner and admin can update
    if (membership.role !== "owner" && membership.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to update this organization" },
        { status: 403 },
      );
    }

    // Update organization
    await db
      .update(organization)
      .set({
        name: name || org.name,
        description: description !== undefined ? description : org.description,
        updatedAt: new Date(),
      })
      .where(eq(organization.id, org.id));

    // Fetch updated organization with members
    const result = await db.query.organization.findFirst({
      where: eq(organization.id, org.id),
      with: {
        members: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      organization: {
        ...result,
        role: membership.role,
      },
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
  }
}

// DELETE /api/orgs/[slug] - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { slug } = await params;

  try {
    // Get organization and check membership
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const membership = org.members.find((m) => m.userId === userId);
    if (!membership) {
      return NextResponse.json(
        { error: "You don't have access to this organization" },
        { status: 403 },
      );
    }

    // Only owner can delete
    if (membership.role !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can delete this organization" },
        { status: 403 },
      );
    }

    // Delete organization (cascade will handle members and links)
    await db.delete(organization).where(eq(organization.id, org.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 });
  }
}
