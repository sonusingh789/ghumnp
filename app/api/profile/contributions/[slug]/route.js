import { NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";

const categoryMap = {
  "Tourist Attraction": "attraction",
  "Local Food": "food",
  Restaurant: "restaurant",
  Hotel: "hotel",
  "Local Stay": "stay",
};

export async function PATCH(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const location = String(body?.location || "").trim();
  const description = String(body?.description || "").trim();
  const categoryInput = String(body?.category || "").trim();
  const category = categoryMap[categoryInput] || categoryInput.toLowerCase();

  if (!name || !location || !description || !category) {
    return NextResponse.json({ error: "All contribution fields are required." }, { status: 400 });
  }

  const updateResult = await query(
    `UPDATE Places
     SET name = @name,
         location_text = @location,
         description = @description,
         category = @category,
         updated_at = SYSDATETIME()
     WHERE slug = @slug AND created_by_user_id = @userId`,
    {
      slug,
      userId: Number(auth.id),
      name,
      location,
      description,
      category,
    }
  );

  if (!updateResult.rowsAffected?.[0]) {
    return NextResponse.json({ error: "Contribution not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const deleteResult = await query(
    `DELETE FROM Places
     WHERE slug = @slug AND created_by_user_id = @userId`,
    {
      slug,
      userId: Number(auth.id),
    }
  );

  if (!deleteResult.rowsAffected?.[0]) {
    return NextResponse.json({ error: "Contribution not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
