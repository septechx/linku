import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invitation } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/invites/[code] - Get invite details (public)
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  try {
    // Get invite with organization and creator details
    const invite = await db.query.invitation.findFirst({
      where: eq(invitation.code, code),
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        creator: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
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

    return NextResponse.json({
      invite: {
        id: invite.id,
        code: invite.code,
        role: invite.role,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        useCount: invite.useCount,
        organization: invite.organization,
        creator: invite.creator || { name: null, email: "Unknown" },
      },
    });
  } catch (error) {
    console.error("Error fetching invite:", error);
    return NextResponse.json({ error: "Failed to fetch invite" }, { status: 500 });
  }
}
