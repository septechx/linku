import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { organization, link } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; linkSlug: string }> },
) {
  const { orgSlug, linkSlug } = await params;

  const org = await db.query.organization.findFirst({
    where: eq(organization.slug, orgSlug),
  });

  if (!org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const linkRecord = await db.query.link.findFirst({
    where: and(eq(link.organizationId, org.id), eq(link.slug, linkSlug)),
  });

  if (!linkRecord) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .update(link)
    .set({
      clickCount: linkRecord.clickCount + 1,
      lastClickedAt: new Date(),
    })
    .where(eq(link.id, linkRecord.id));

  return NextResponse.redirect(linkRecord.destinationUrl, 302);
}
