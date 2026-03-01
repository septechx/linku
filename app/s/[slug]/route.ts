import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { link } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const linkRecord = await db.query.link.findFirst({
    where: and(eq(link.slug, slug), eq(link.isGlobal, true)),
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
