import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { link, organizationMember } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const updateLinkSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Slug must be URL-safe (letters, numbers, hyphens, underscores only)",
    )
    .optional(),
  destinationUrl: z.string().url("Invalid URL").optional(),
  title: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
});

async function checkAdminPermission(userId: string, organizationId: string) {
  const membership = await db.query.organizationMember.findFirst({
    where: and(
      eq(organizationMember.organizationId, organizationId),
      eq(organizationMember.userId, userId),
    ),
  });

  return (
    membership && (membership.role === "owner" || membership.role === "admin")
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the link with organization
    const existingLink = await db.query.link.findFirst({
      where: eq(link.id, id),
      with: {
        organization: true,
      },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Check if user is a member of the organization
    const membership = await db.query.organizationMember.findFirst({
      where: and(
        eq(organizationMember.organizationId, existingLink.organizationId),
        eq(organizationMember.userId, session.user.id),
      ),
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You don't have access to this link" },
        { status: 403 },
      );
    }

    return NextResponse.json({ link: existingLink });
  } catch (error) {
    console.error("Error fetching link:", error);
    return NextResponse.json(
      { error: "Failed to fetch link" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the existing link
    const existingLink = await db.query.link.findFirst({
      where: eq(link.id, id),
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Check if user has admin/owner permissions
    const hasPermission = await checkAdminPermission(
      session.user.id,
      existingLink.organizationId,
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to update this link" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const result = updateLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 },
      );
    }

    const updates = result.data;

    // If slug is being changed, check for conflicts
    if (updates.slug && updates.slug !== existingLink.slug) {
      const conflictingLink = await db.query.link.findFirst({
        where: and(
          eq(link.organizationId, existingLink.organizationId),
          eq(link.slug, updates.slug),
        ),
      });

      if (conflictingLink) {
        return NextResponse.json(
          {
            error: "A link with this slug already exists in this organization",
          },
          { status: 409 },
        );
      }
    }

    // Update the link
    const updatedLink = await db
      .update(link)
      .set({
        ...(updates.slug && { slug: updates.slug }),
        ...(updates.destinationUrl && {
          destinationUrl: updates.destinationUrl,
        }),
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && {
          description: updates.description,
        }),
        updatedAt: new Date(),
      })
      .where(eq(link.id, id))
      .returning();

    return NextResponse.json({ link: updatedLink[0] });
  } catch (error) {
    console.error("Error updating link:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the existing link
    const existingLink = await db.query.link.findFirst({
      where: eq(link.id, id),
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Check if user has admin/owner permissions
    const hasPermission = await checkAdminPermission(
      session.user.id,
      existingLink.organizationId,
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to delete this link" },
        { status: 403 },
      );
    }

    // Delete the link
    await db.delete(link).where(eq(link.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 },
    );
  }
}
