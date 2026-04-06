import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";

async function requireAdmin() {
  const auth = await getAuthFromRequest();
  if (!auth || auth.role !== "admin") return null;
  return auth;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await query(
    `SELECT d.id, d.slug, d.name, d.image_url, d.is_featured,
            p.name AS province_name
     FROM Districts d
     INNER JOIN Provinces p ON p.id = d.province_id
     ORDER BY d.name`
  );

  return NextResponse.json({ districts: result.recordset });
}

export async function PATCH(request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const districtId = Number(body?.districtId);
  const isFeatured = Boolean(body?.isFeatured);

  if (!districtId) {
    return NextResponse.json({ error: "districtId is required." }, { status: 400 });
  }

  const result = await query(
    `UPDATE Districts SET is_featured = @isFeatured WHERE id = @districtId`,
    { districtId, isFeatured: isFeatured ? 1 : 0 }
  );

  if (!result.rowsAffected?.[0]) {
    return NextResponse.json({ error: "District not found." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/districts");

  return NextResponse.json({ ok: true });
}
