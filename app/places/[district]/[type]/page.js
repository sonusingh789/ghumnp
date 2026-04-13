import { notFound } from "next/navigation";
import Link from "next/link";
import PlaceCard from "@/components/cards/place-card";
import AppShell from "@/components/layout/app-shell";
import { getDistrictBySlug, getDistrictCards, getDistrictListingPlacesByDistrictSlug } from "@/lib/content";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export const PLACE_TYPES = {
  attraction: { label: "Tourist Attractions", plural: "Tourist Attractions", emoji: "🏔️" },
  food:       { label: "Local Food",          plural: "Local Food Spots",    emoji: "🍜" },
  restaurant: { label: "Restaurants",         plural: "Restaurants",         emoji: "🍽️" },
  hotel:      { label: "Hotels",              plural: "Hotels",              emoji: "🏨" },
  stay:       { label: "Local Stays",         plural: "Local Stays",         emoji: "🏠" },
};

export async function generateStaticParams() {
  const districts = await getDistrictCards();
  return districts.flatMap((d) =>
    Object.keys(PLACE_TYPES).map((type) => ({
      district: d.id,
      type,
    }))
  );
}

export async function generateMetadata({ params }) {
  const { district: districtSlug, type } = await params;
  if (!PLACE_TYPES[type]) return {};
  const district = await getDistrictBySlug(districtSlug);
  if (!district) return {};
  const typeInfo = PLACE_TYPES[type];
  return buildMetadata({
    title: `Best ${typeInfo.plural} in ${district.name} — ${district.province} Province | visitNepal77`,
    description: `Discover the top-rated ${typeInfo.plural.toLowerCase()} in ${district.name} district, ${district.province} Province, Nepal. Real reviews, ratings, and local recommendations on visitNepal77.`,
    path: `/places/${districtSlug}/${type}`,
    image: district.image,
    keywords: [
      `${typeInfo.label.toLowerCase()} in ${district.name}`,
      `best ${typeInfo.label.toLowerCase()} ${district.name}`,
      `${district.name} ${typeInfo.label.toLowerCase()}`,
      `${district.name} Nepal ${type}`,
      `things to do in ${district.name}`,
      `visit ${district.name}`,
      `${district.name} travel guide`,
      `Nepal ${typeInfo.label.toLowerCase()}`,
    ],
  });
}

export default async function PlacesByTypePage({ params }) {
  const { district: districtSlug, type } = await params;

  if (!PLACE_TYPES[type]) notFound();

  const [district, allPlaces] = await Promise.all([
    getDistrictBySlug(districtSlug),
    getDistrictListingPlacesByDistrictSlug(districtSlug),
  ]);

  if (!district) notFound();

  const places = allPlaces.filter((p) => p.category === type);
  const typeInfo = PLACE_TYPES[type];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What are the best ${typeInfo.plural.toLowerCase()} in ${district.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: places.length > 0
            ? `The top-rated ${typeInfo.plural.toLowerCase()} in ${district.name} include ${places.slice(0, 3).map(p => p.name).join(", ")}. Browse all ${places.length} options on visitNepal77 with real ratings and reviews.`
            : `${district.name} is a growing destination. Be the first to add a ${typeInfo.label.toLowerCase()} on visitNepal77.`,
        },
      },
      {
        "@type": "Question",
        name: `How many ${typeInfo.plural.toLowerCase()} are in ${district.name} district?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `visitNepal77 currently lists ${places.length} ${typeInfo.plural.toLowerCase()} in ${district.name} district, ${district.province} Province, Nepal. New places are added regularly by local contributors.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${district.name} worth visiting for ${typeInfo.label.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes — ${district.name} in ${district.province} Province is known for its local culture and attractions. visitNepal77 covers all verified ${typeInfo.plural.toLowerCase()} with ratings from real visitors.`,
        },
      },
    ],
  };

  const schemaItems = [
    faqSchema,
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Best ${typeInfo.plural} in ${district.name}, Nepal`,
      description: `Top-rated ${typeInfo.plural.toLowerCase()} in ${district.name} district, ${district.province} Province, Nepal.`,
      url: `${SITE_URL}/places/${districtSlug}/${type}`,
      numberOfItems: places.length,
      itemListElement: places.slice(0, 10).map((place, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: place.name,
        url: `${SITE_URL}/place/${place.id}`,
        image: place.image || undefined,
        description: place.description?.slice(0, 120) || undefined,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",      item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Districts", item: `${SITE_URL}/districts` },
        { "@type": "ListItem", position: 3, name: district.name, item: `${SITE_URL}/districts/${districtSlug}` },
        { "@type": "ListItem", position: 4, name: typeInfo.plural, item: `${SITE_URL}/places/${districtSlug}/${type}` },
      ],
    },
  ];

  return (
    <AppShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItems) }}
      />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
          <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 6px", fontSize: 11, color: "#64748b", listStyle: "none", padding: 0, margin: 0 }}>
            <li><Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link></li>
            <li aria-hidden="true" style={{ color: "#6b7280" }}>/</li>
            <li><Link href="/districts" style={{ color: "#64748b", textDecoration: "none" }}>Districts</Link></li>
            <li aria-hidden="true" style={{ color: "#6b7280" }}>/</li>
            <li><Link href={`/districts/${districtSlug}`} style={{ color: "#64748b", textDecoration: "none" }}>{district.name}</Link></li>
            <li aria-hidden="true" style={{ color: "#6b7280" }}>/</li>
            <li style={{ fontWeight: 600, color: "#1e293b" }} aria-current="page">{typeInfo.plural}</li>
          </ol>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 6 }}>
            {district.province} Province · {district.name}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-0.025em", marginBottom: 10 }}>
            {typeInfo.emoji} Best {typeInfo.plural} in {district.name}
          </h1>
          {district.tagline ? (
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, maxWidth: 560 }}>
              {district.tagline}
            </p>
          ) : null}
        </div>

        {/* Category filter links */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          <Link
            href={`/districts/${districtSlug}`}
            style={{ fontSize: 12, fontWeight: 700, color: "#64748b", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 999, padding: "5px 12px", textDecoration: "none" }}
          >
            All Places
          </Link>
          {Object.entries(PLACE_TYPES).map(([slug, info]) => (
            <Link
              key={slug}
              href={`/places/${districtSlug}/${slug}`}
              style={{
                fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "5px 12px", textDecoration: "none",
                background: slug === type ? "#059669" : "#f1f5f9",
                color: slug === type ? "#fff" : "#64748b",
                border: slug === type ? "1px solid #047857" : "1px solid #e2e8f0",
              }}
            >
              {info.emoji} {info.label}
            </Link>
          ))}
        </div>

        {/* Results count */}
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
          {places.length > 0
            ? `${places.length} ${typeInfo.plural.toLowerCase()} found in ${district.name}`
            : `No ${typeInfo.plural.toLowerCase()} found yet in ${district.name}`}
        </p>

        {/* Place list */}
        {places.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {places.map((place, i) => (
              <PlaceCard key={place.id} place={place} layout="horizontal" imagePriority={i < 2} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "48px 16px", background: "#f8fafc", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>{typeInfo.emoji}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
              No {typeInfo.plural} yet
            </p>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
              Be the first to add a {typeInfo.label.toLowerCase()} in {district.name}!
            </p>
            <Link href="/add" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#059669", color: "#fff", borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              + Add a Place
            </Link>
          </div>
        )}

        {/* Back to district */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href={`/districts/${districtSlug}`} style={{ fontSize: 13, fontWeight: 700, color: "#059669", textDecoration: "none" }}>
            ← All places in {district.name}
          </Link>
          <Link href="/districts" style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none" }}>
            All 77 districts →
          </Link>
        </div>

      </div>
    </AppShell>
  );
}
