import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import ContributorProfileClient from "@/components/pages/contributor-profile-client";

export async function generateMetadata({ params }) {
  const { userId } = await params;
  const numericId = parseInt(userId.split('-').pop(), 10);
  const result = await query(
    `SELECT name, bio FROM Users WHERE id = @userId AND is_active = 1`,
    { userId: numericId }
  );
  const user = result.recordset[0];
  if (!user) return {};
  return buildMetadata({
    title: `${user.name} — Nepal Travel Contributor | visitNepal77`,
    description: user.bio || `${user.name} is a travel contributor on visitNepal77, sharing Nepal's best places across all 77 districts.`,
    path: `/contributors/${userId}`,
  });
}

export default async function ContributorProfilePage({ params }) {
  const { userId } = await params;
  const numericId = parseInt(userId.split('-').pop(), 10);

  const [userResult, placesResult] = await Promise.all([
    query(
      `SELECT id, name, avatar_url, bio, created_at FROM Users WHERE id = @userId AND is_active = 1`,
      { userId: numericId }
    ),
    query(
      `SELECT p.slug, p.name, p.category, p.cover_image_url, p.rating,
              p.review_count, p.location_text, d.name AS district_name
       FROM Places p
       LEFT JOIN Districts d ON d.id = p.district_id
       WHERE p.created_by_user_id = @userId AND p.status = 'approved'
       ORDER BY p.created_at DESC`,
      { userId: numericId }
    ),
  ]);

  const user = userResult.recordset[0];
  if (!user) notFound();

  const [districtsResult, districtsListResult] = await Promise.all([
    query(
      `SELECT COUNT(DISTINCT p.district_id) AS cnt
       FROM Places p WHERE p.created_by_user_id = @userId AND p.status = 'approved'`,
      { userId: numericId }
    ),
    query(
      `SELECT DISTINCT d.id, d.name, d.slug
       FROM Districts d
       INNER JOIN Places p ON p.district_id = d.id
       WHERE p.created_by_user_id = @userId AND p.status = 'approved'
       ORDER BY d.name`,
      { userId: numericId }
    ),
  ]);

  const placesApproved = placesResult.recordset.length;
  const stats = {
    places_submitted: placesApproved,
    places_approved: placesApproved,
    total_reviews: 0,
    badge_level: placesApproved >= 30 ? "pioneer" : placesApproved >= 15 ? "champion" : placesApproved >= 5 ? "local_guide" : placesApproved >= 1 ? "contributor" : "explorer",
  };

  const schemaItems = [{
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${user.name} — visitNepal77 Contributor`,
    url: `${SITE_URL}/contributors/${userId}`,
    mainEntity: {
      "@type": "Person",
      name: user.name,
      description: user.bio || "",
      url: `${SITE_URL}/contributors/${userId}`,
    },
  }];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItems) }} />
      <ContributorProfileClient
        contributor={{
          id: user.id,
          name: user.name,
          avatar: user.avatar_url,
          bio: user.bio,
          joined: user.created_at,
          badge: stats.badge_level,
          stats: {
            places_submitted: stats.places_submitted,
            places_approved: stats.places_approved,
            total_reviews: stats.total_reviews,
            districts_covered: districtsResult.recordset[0]?.cnt || 0,
          },
          places: placesResult.recordset,
          districts: districtsListResult.recordset,
        }}
      />
    </>
  );
}
