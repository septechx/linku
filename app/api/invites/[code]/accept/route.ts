import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invitation, organizationMember } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// POST /api/invites/[code]/accept - Accept an invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { code } = await params;

  try {
    // Get invite with organization details
    const invite = await db.query.invitation.findFirst({
      where: eq(invitation.code, code),
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Check if expired
    const isExpired = invite.expiresAt ? new Date() > invite.expiresAt : false;

    // Check if max uses reached
    const isMaxUsesReached = invite.maxUses !== null && invite.useCount >= invite.maxUses;

    if (isExpired || isMaxUsesReached) {
      return NextResponse.json(
        { error: "Invite has expired or reached maximum uses" },
        { status: 410 },
      );
    }

    // Check if user is already a member
    const existingMembership = await db.query.organizationMember.findFirst({
      where: and(
        eq(organizationMember.organizationId, invite.organizationId),
        eq(organizationMember.userId, userId),
      ),
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this organization" },
        { status: 409 },
      );
    }

    // Increment invite useCount
    await db
      .update(invitation)
      .set({
        useCount: invite.useCount + 1,
      })
      .where(eq(invitation.id, invite.id));

    // Create organization member with the invited role
    await db.insert(organizationMember).values({
      organizationId: invite.organizationId,
      userId,
      role: invite.role,
    });

    return NextResponse.json({
      success: true,
      organization: invite.organization,
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}
