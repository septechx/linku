import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organization, organizationMember, invitation } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// DELETE /api/orgs/[slug]/invites/[id] - Delete an invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, id } = await params;

    // Find organization
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if user is owner or admin
    const membership = await db.query.organizationMember.findFirst({
      where: and(
        eq(organizationMember.organizationId, org.id),
        eq(organizationMember.userId, session.user.id),
      ),
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You don't have access to this organization" },
        { status: 403 },
      );
    }

    if (membership.role !== "owner" && membership.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to delete invites" },
        { status: 403 },
      );
    }

    // Find the invite
    const invite = await db.query.invitation.findFirst({
      where: and(eq(invitation.id, id), eq(invitation.organizationId, org.id)),
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Delete the invite
    await db.delete(invitation).where(eq(invitation.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invite:", error);
    return NextResponse.json({ error: "Failed to delete invite" }, { status: 500 });
  }
}
