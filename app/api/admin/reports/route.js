import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";

async function requireAdmin() {
  const auth = await getAuthFromRequest();
  if (!auth || auth.role !== "admin") return null;
  return auth;
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "open";

  const result = await query(
    `SELECT r.id, r.reason, r.status, r.created_at,
            p.slug AS place_slug, p.name AS place_name,
            u.name AS reporter_name, u.email AS reporter_email
     FROM Reports r
     INNER JOIN Places p ON p.id = r.place_id
     LEFT JOIN Users u ON u.id = r.reporter_id
     WHERE r.status = @status
     ORDER BY r.created_at DESC`,
    { status }
  );

  return NextResponse.json({ reports: result.recordset });
}

export async function PATCH(request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const reportId = Number(body?.reportId);
  const status = body?.status;

  if (!reportId || !["resolved", "dismissed", "open"].includes(status)) {
    return NextResponse.json({ error: "reportId and valid status required." }, { status: 400 });
  }

  await query(
    `UPDATE Reports SET status = @status WHERE id = @reportId`,
    { reportId, status }
  );

  return NextResponse.json({ ok: true });
}
