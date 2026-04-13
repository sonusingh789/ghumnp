import { notFound } from "next/navigation";
import Link from "next/link";
import DistrictCard from "@/components/cards/district-card";
import AppShell from "@/components/layout/app-shell";
import { getDistrictCards } from "@/lib/content";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const revalidate = 300;

/** Convert province name → URL slug: "Bagmati Province" → "bagmati-province" */
function provinceToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Reverse: find province name from slug */
function findProvince(provinces, slug) {
  return provinces.find((p) => provinceToSlug(p) === slug) || null;
}

export async function generateStaticParams() {
  const districts = await getDistrictCards();
  const provinces = Array.from(new Set(districts.map((d) => d.province).filter(Boolean)));
  return provinces.map((p) => ({ province: provinceToSlug(p) }));
}

export async function generateMetadata({ params }) {
  const { province: provinceSlug } = await params;
  const districts = await getDistrictCards();
  const provinces = Array.from(new Set(districts.map((d) => d.province).filter(Boolean)));
  const provinceName = findProvince(provinces, provinceSlug);
  if (!provinceName) return {};
  const provinceDistricts = districts.filter((d) => d.province === provinceName);

  return buildMetadata({
    title: `${provinceName} Province Nepal — Districts, Places & Travel Guide | visitNepal77`,
    description: `Explore ${provinceName} Province, Nepal. Discover all ${provinceDistricts.length} districts, top tourist attractions, local food, hotels, and hidden gems. Complete travel guide on visitNepal77.`,
    path: `/explore/${provinceSlug}`,
    keywords: [
      `${provinceName} Province Nepal`,
      `${provinceName} Nepal travel`,
      `districts in ${provinceName}`,
      `${provinceName} tourism`,
      `best places in ${provinceName}`,
      `${provinceName} travel guide`,
      `visit ${provinceName} Nepal`,
      `${provinceName} Province districts`,
      "Nepal provinces",
      "Nepal travel guide",
    ],
  });
}

export default async function ProvincePage({ params }) {
  const { province: provinceSlug } = await params;
  const districts = await getDistrictCards();
  const provinces = Array.from(new Set(districts.map((d) => d.province).filter(Boolean)));
  const provinceName = findProvince(provinces, provinceSlug);

  if (!provinceName) notFound();

  const provinceDistricts = districts.filter((d) => d.province === provinceName);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What are the best places to visit in ${provinceName} Province, Nepal?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${provinceName} Province has ${provinceDistricts.length} districts with diverse attractions. Top destinations include ${provinceDistricts.slice(0, 3).map(d => d.name).join(", ")} — each with unique landscapes, local cuisine, and cultural heritage. Browse all places on visitNepal77.`,
        },
      },
      {
        "@type": "Question",
        name: `How many districts are in ${provinceName} Province?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${provinceName} Province has ${provinceDistricts.length} districts. visitNepal77 covers all of them with local travel guides, top-rated places, and real reviews from local contributors.`,
        },
      },
      {
        "@type": "Question",
        name: `What is ${provinceName} Province known for?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${provinceName} Province is one of Nepal's seven provinces and is known for its geographic diversity, cultural heritage, and natural beauty. Explore all ${provinceDistricts.length} districts on visitNepal77 to discover local food, tourist attractions, hotels, and hidden gems.`,
        },
      },
    ],
  };

  const schemaItems = [
    faqSchema,
    {
      "@context": "https://schema.org",
      "@type": "TouristicRegion",
      name: `${provinceName}, Nepal`,
      description: `${provinceName} is one of Nepal's 7 provinces, covering ${provinceDistricts.length} districts with diverse landscapes, cultural heritage, and natural attractions.`,
      url: `${SITE_URL}/explore/${provinceSlug}`,
      containedInPlace: {
        "@type": "Country",
        name: "Nepal",
        identifier: "NP",
      },
      image: provinceDistricts[0]?.image || undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Districts of ${provinceName}, Nepal`,
      description: `All ${provinceDistricts.length} districts in ${provinceName} Province with travel guides and local places.`,
      url: `${SITE_URL}/explore/${provinceSlug}`,
      numberOfItems: provinceDistricts.length,
      itemListElement: provinceDistricts.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${d.name} District`,
        url: `${SITE_URL}/districts/${d.id}`,
        image: d.image || undefined,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",    item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Explore", item: `${SITE_URL}/explore` },
        { "@type": "ListItem", position: 3, name: provinceName, item: `${SITE_URL}/explore/${provinceSlug}` },
      ],
    },
  ];

  return (
    <AppShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItems) }}
      />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
          <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 6px", fontSize: 11, color: "#64748b", listStyle: "none", padding: 0, margin: 0 }}>
            <li><Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link></li>
            <li aria-hidden="true" style={{ color: "#6b7280" }}>/</li>
            <li><Link href="/explore" style={{ color: "#64748b", textDecoration: "none" }}>Explore</Link></li>
            <li aria-hidden="true" style={{ color: "#6b7280" }}>/</li>
            <li style={{ fontWeight: 600, color: "#1e293b" }} aria-current="page">{provinceName}</li>
          </ol>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 6 }}>
            Nepal · Province
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-0.025em", marginBottom: 10 }}>
            🗺️ {provinceName}
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, maxWidth: 600 }}>
            Explore all {provinceDistricts.length} districts of {provinceName} Province, Nepal —
            from mountain peaks to cultural heritage sites, local food, and hidden gems.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
          {[
            { icon: "📍", value: String(provinceDistricts.length), label: "Districts" },
            { icon: "🏔️", value: "Nepal", label: "Country" },
          ].map(({ icon, value, label }) => (
            <div key={label} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#059669", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* District grid */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>
          Districts in {provinceName}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {provinceDistricts.map((d, i) => (
            <DistrictCard key={d.id} district={d} imagePriority={i < 3} />
          ))}
        </div>

        {/* Back link */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
          <Link href="/explore" style={{ fontSize: 13, fontWeight: 700, color: "#059669", textDecoration: "none" }}>
            ← All Provinces
          </Link>
          <Link href="/districts" style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none" }}>
            All 77 Districts →
          </Link>
        </div>

      </div>
    </AppShell>
  );
}
