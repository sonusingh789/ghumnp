import { NextResponse } from "next/server";
import { getApprovedPlacesBySlugs, getProfileData } from "@/lib/content";
import { getAuthFromRequest } from "@/lib/auth-request";
import { query } from "@/lib/db";

export async function GET() {
  const auth = await getAuthFromRequest();
  const profile = await getProfileData();

  if (!auth) {
    return NextResponse.json({
      ...profile,
      favoritePlaces: [],
      authenticated: false,
    });
  }

  const favoritesResult = await query(
    `SELECT pl.slug
     FROM UserFavorites uf
     INNER JOIN Places pl ON pl.id = uf.place_id
     WHERE uf.user_id = @userId
     ORDER BY uf.created_at DESC`,
    { userId: auth.id }
  );

  const favoritePlaces = await getApprovedPlacesBySlugs(
    favoritesResult.recordset.map((row) => row.slug)
  );

  return NextResponse.json({
    ...profile,
    favoritePlaces,
    authenticated: true,
  });
}

export async function POST(request) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const bio = String(body?.bio || "").trim();
  const avatarUrl = String(body?.avatarUrl || "").trim();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await query(
      `UPDATE Users
       SET name = @name,
           email = @email,
           bio = @bio,
           avatar_url = @avatarUrl,
           updated_at = SYSDATETIME()
       WHERE id = @id`,
      {
        id: auth.id,
        name,
        email,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
      }
    );

    const profile = await getProfileData();
    const favoritesResult = await query(
      `SELECT pl.slug
       FROM UserFavorites uf
       INNER JOIN Places pl ON pl.id = uf.place_id
       WHERE uf.user_id = @userId
       ORDER BY uf.created_at DESC`,
      { userId: auth.id }
    );
    const favoritePlaces = await getApprovedPlacesBySlugs(
      favoritesResult.recordset.map((row) => row.slug)
    );

    return NextResponse.json({
      ...profile,
      favoritePlaces,
      authenticated: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("UQ_Users_Email")) {
      return NextResponse.json(
        { error: "That email is already being used by another account." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Unable to update profile." }, { status: 500 });
  }
}
