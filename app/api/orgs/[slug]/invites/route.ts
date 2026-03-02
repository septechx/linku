import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organization, organizationMember, invitation } from "@/lib/db/schema";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createInviteSchema = z.object({
  role: z.enum(["member", "admin"]).optional().default("member"),
  expiresInHours: z.number().int().positive().optional(),
  maxUses: z.number().int().positive().optional(),
});

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET /api/orgs/[slug]/invites - Get all active invites
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

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
        { error: "You don't have permission to manage invites" },
        { status: 403 },
      );
    }

    // Get all active invites
    const invites = await db.query.invitation.findMany({
      where: and(
        eq(invitation.organizationId, org.id),
        or(isNull(invitation.expiresAt), gt(invitation.expiresAt, new Date())),
        or(isNull(invitation.maxUses), sql`${invitation.useCount} < ${invitation.maxUses}`),
      ),
      with: {
        creator: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: (invitation, { desc }) => [desc(invitation.createdAt)],
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
  }
}

// POST /api/orgs/[slug]/invites - Create a new invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

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
        { error: "You don't have permission to create invites" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const result = createInviteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 },
      );
    }

    const { role, expiresInHours, maxUses } = result.data;

    // Generate unique invite code
    let code: string;
    let existingInvite: typeof invitation.$inferSelect | undefined;
    let attempts = 0;
    do {
      code = generateInviteCode();
      existingInvite = await db.query.invitation.findFirst({
        where: eq(invitation.code, code),
      });
      attempts++;
    } while (existingInvite && attempts < 10);

    if (existingInvite) {
      return NextResponse.json({ error: "Failed to generate unique invite code" }, { status: 500 });
    }

    // Calculate expiration date if provided
    const expiresAt = expiresInHours
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
      : null;

    // Create the invitation
    const newInvite = await db
      .insert(invitation)
      .values({
        organizationId: org.id,
        code,
        role,
        createdBy: session.user.id,
        expiresAt,
        maxUses: maxUses ?? null,
      })
      .returning();

    // Fetch the created invite with creator details
    const inviteWithCreator = await db.query.invitation.findFirst({
      where: eq(invitation.id, newInvite[0].id),
      with: {
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

    return NextResponse.json({ invite: inviteWithCreator }, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
