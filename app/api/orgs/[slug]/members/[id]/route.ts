import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organization, organizationMember } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// DELETE /api/orgs/[slug]/members/[id] - Remove a member from organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { slug, id } = await params;

  try {
    // Get organization with members
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if current user is owner or admin
    const currentMembership = org.members.find((m) => m.userId === userId);
    if (!currentMembership) {
      return NextResponse.json(
        { error: "You don't have access to this organization" },
        { status: 403 },
      );
    }

    if (currentMembership.role !== "owner" && currentMembership.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to remove members" },
        { status: 403 },
      );
    }

    // Get target member
    const targetMember = org.members.find((m) => m.id === id);
    if (!targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent removing the last owner
    if (targetMember.role === "owner") {
      const ownerCount = org.members.filter((m) => m.role === "owner").length;
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last owner of the organization" },
          { status: 403 },
        );
      }
    }

    // Prevent admins from removing owners
    if (currentMembership.role === "admin" && targetMember.role === "owner") {
      return NextResponse.json({ error: "Admins cannot remove owners" }, { status: 403 });
    }

    // Prevent admins from removing other admins
    if (currentMembership.role === "admin" && targetMember.role === "admin") {
      return NextResponse.json({ error: "Admins cannot remove other admins" }, { status: 403 });
    }

    // Delete the membership
    await db.delete(organizationMember).where(eq(organizationMember.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}

// PATCH /api/orgs/[slug]/members/[id] - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { slug, id } = await params;

  try {
    const body = await request.json();
    const { role } = body;

    if (!role || !["owner", "admin", "member"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

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

    // Check if current user is owner or admin
    const currentMembership = org.members.find((m) => m.userId === userId);
    if (!currentMembership) {
      return NextResponse.json(
        { error: "You don't have access to this organization" },
        { status: 403 },
      );
    }

    if (currentMembership.role !== "owner" && currentMembership.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to update member roles" },
        { status: 403 },
      );
    }

    // Get target member
    const targetMember = org.members.find((m) => m.id === id);
    if (!targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Only owners can promote to owner or admin
    if (role === "owner" && currentMembership.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can promote members to owner" },
        { status: 403 },
      );
    }

    if (role === "admin" && currentMembership.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can promote members to admin" },
        { status: 403 },
      );
    }

    // Prevent demoting the last owner
    if (targetMember.role === "owner" && role !== "owner") {
      const ownerCount = org.members.filter((m) => m.role === "owner").length;
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot change the role of the last owner" },
          { status: 403 },
        );
      }
    }

    // Prevent admins from changing owner roles
    if (currentMembership.role === "admin" && targetMember.role === "owner") {
      return NextResponse.json({ error: "Admins cannot change owner roles" }, { status: 403 });
    }

    // Prevent admins from changing other admin roles
    if (currentMembership.role === "admin" && targetMember.role === "admin") {
      return NextResponse.json(
        { error: "Admins cannot change other admin roles" },
        { status: 403 },
      );
    }

    // Update the role
    await db.update(organizationMember).set({ role }).where(eq(organizationMember.id, id));

    // Fetch updated member
    const updatedMember = await db.query.organizationMember.findFirst({
      where: eq(organizationMember.id, id),
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
    });

    return NextResponse.json({
      member: {
        id: updatedMember!.id,
        userId: updatedMember!.userId,
        role: updatedMember!.role,
        joinedAt: updatedMember!.joinedAt,
        user: updatedMember!.user,
      },
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}
