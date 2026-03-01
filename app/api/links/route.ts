import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { link, organization, organizationMember } from "@/lib/db/schema";
import { eq, inArray, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/links - List all links across all user's organizations
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all organization IDs the user is a member of
    const memberships = await db.query.organizationMember.findMany({
      where: eq(organizationMember.userId, userId),
      columns: {
        organizationId: true,
        role: true,
      },
    });

    if (memberships.length === 0) {
      return NextResponse.json({ links: [] });
    }

    const orgIds = memberships.map((m) => m.organizationId);

    // Get all organizations with their slugs and names
    const orgs = await db.query.organization.findMany({
      where: inArray(organization.id, orgIds),
      columns: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Create a map for quick lookup
    const orgMap = new Map(orgs.map((o) => [o.id, { name: o.name, slug: o.slug }]));

    // Get all links from those organizations
    const links = await db.query.link.findMany({
      where: inArray(link.organizationId, orgIds),
      orderBy: desc(link.createdAt),
    });

    // Enrich links with organization info
    const enrichedLinks = links.map((linkItem) => {
      const orgInfo = orgMap.get(linkItem.organizationId);
      return {
        ...linkItem,
        organization: orgInfo || { name: "Unknown", slug: "" },
      };
    });

    return NextResponse.json({ links: enrichedLinks });
  } catch (error) {
    console.error("Error fetching all links:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}
