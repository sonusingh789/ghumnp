import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const entityType = String(body?.entityType || "").trim().toLowerCase();
  const slug = String(body?.slug || "").trim();

  if (!slug) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }

  if (entityType !== "district") {
    return NextResponse.json({ error: "Unsupported visit type." }, { status: 400 });
  }

  const result = await query(
    `UPDATE Districts
     SET visitors_count = visitors_count + 1
     OUTPUT INSERTED.visitors_count
     WHERE slug = @slug`,
    { slug }
  );

  const row = result.recordset?.[0];
  if (!row) {
    return NextResponse.json({ error: "District not found." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/districts");
  revalidatePath(`/districts/${slug}`);

  return NextResponse.json({
    ok: true,
    visitorsCount: Number(row.visitors_count || 0),
  });
}
