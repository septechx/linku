import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { link, organization, organizationMember } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createLinkSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Slug must be URL-safe (letters, numbers, hyphens, underscores only)",
    ),
  destinationUrl: z.string().url("Invalid URL"),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  isGlobal: z.boolean().optional(),
});

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

    // Check if user is a member
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

    // Get all links for the organization
    const links = await db.query.link.findMany({
      where: eq(link.organizationId, org.id),
      orderBy: (link, { desc }) => [desc(link.createdAt)],
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

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

    // Check if user is a member
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

    const body = await request.json();
    const result = createLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 },
      );
    }

    const { slug: linkSlug, destinationUrl, title, description, isGlobal } = result.data;

    // Check if slug already exists in this organization
    const existingLink = await db.query.link.findFirst({
      where: and(eq(link.organizationId, org.id), eq(link.slug, linkSlug)),
    });

    if (existingLink) {
      return NextResponse.json(
        { error: "A link with this slug already exists in this organization" },
        { status: 409 },
      );
    }

    // If global, check that the slug doesn't already exist in any global link
    if (isGlobal) {
      const existingGlobalLink = await db.query.link.findFirst({
        where: eq(link.globalSlug, linkSlug),
      });

      if (existingGlobalLink) {
        return NextResponse.json(
          { error: "A global link with this slug already exists" },
          { status: 409 },
        );
      }
    }

    // Create the link
    const newLink = await db
      .insert(link)
      .values({
        organizationId: org.id,
        slug: linkSlug,
        destinationUrl,
        title: title || null,
        description: description || null,
        isGlobal: isGlobal ?? false,
      })
      .returning();

    return NextResponse.json({ link: newLink[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
