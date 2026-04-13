import AppShell from "@/components/layout/app-shell";
import Link from "next/link";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const revalidate = 86400; // about page is fully static — revalidate daily

export const metadata = buildMetadata({
  title: "About visitNepal77 — Nepal Travel Guide for All 77 Districts",
  description:
    "visitNepal77 is your complete travel guide to explore all 77 districts of Nepal — best places to visit, local food, hidden gems, district travel guides, and real reviews from travellers.",
  path: "/about",
  keywords: [
    "about visitNepal77",
    "Nepal travel guide",
    "Nepal 77 districts",
    "best places in Nepal",
    "Nepal local food",
    "Nepal hidden gems",
    "Nepal tourism",
    "visitNepal77",
  ],
});

const schemaItems = [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About visitNepal77",
    url: `${SITE_URL}/about`,
    description: "visitNepal77 is Nepal's complete travel discovery platform covering all 77 districts with travel guides, top-rated places, local food, hidden gems, and real reviews.",
    mainEntity: {
      "@type": "Organization",
      name: "visitNepal77",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: "Nepal's travel discovery platform covering all 77 districts.",
      areaServed: { "@type": "Country", name: "Nepal" },
      knowsAbout: [
        "Nepal tourism",
        "Nepal travel guides",
        "Nepal districts",
        "Nepal hidden gems",
        "Nepal local food",
      ],
      sameAs: [
        "https://twitter.com/visitnepal77",
        "https://www.facebook.com/visitnepal77",
        "https://www.instagram.com/visitnepal77",
      ],
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "p"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What are the best places to visit in Nepal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nepal's top destinations include Pashupatinath Temple, Boudhanath Stupa, and Swayambhunath in Kathmandu; Phewa Lake and the Annapurna range in Pokhara; Chitwan National Park for wildlife; Lumbini (birthplace of Buddha); and Everest Base Camp in Solukhumbu. visitNepal77 covers the best places in all 77 districts — including lesser-known gems.",
        },
      },
      {
        "@type": "Question",
        name: "How many districts does Nepal have?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nepal has 77 districts spread across 7 provinces. The provinces are Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, and Sudurpashchim. visitNepal77 covers all 77 districts with local places, ratings, and travel guides.",
        },
      },
      {
        "@type": "Question",
        name: "What is the best time to visit Nepal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "October to November (autumn) and March to May (spring) are the best times to visit Nepal — ideal for trekking and sightseeing with clear skies. Winter (December–February) suits the Terai and Kathmandu Valley. Monsoon (June–September) is lush but rainy.",
        },
      },
      {
        "@type": "Question",
        name: "Can I find local food and hidden gems on visitNepal77?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. visitNepal77 specialises in local discoveries — authentic food spots, off-the-beaten-path attractions, village homestays, and neighbourhood gems contributed by local explorers across all 77 districts of Nepal.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
    ],
  },
];

const FEATURES = [
  { icon: "🏔️", label: "77 Districts", desc: "Complete coverage of every district in Nepal" },
  { icon: "⭐", label: "Best Places", desc: "Top-rated tourist spots and must-visit sites" },
  { icon: "🍜", label: "Local Food", desc: "Authentic Nepali cuisine and food spots" },
  { icon: "🔍", label: "Hidden Gems", desc: "Off-the-beaten-path discoveries by locals" },
  { icon: "📖", label: "Travel Guides", desc: "District-by-district tips and highlights" },
  { icon: "💬", label: "Real Reviews", desc: "Honest ratings from fellow travellers" },
];

const FAQS = [
  {
    q: "What are the best places to visit in Nepal?",
    a: "Nepal's top destinations include Pashupatinath Temple, Boudhanath Stupa, and Swayambhunath in Kathmandu; Phewa Lake and the Annapurna range in Pokhara; Chitwan National Park for wildlife; Lumbini (birthplace of Buddha); and Everest Base Camp in Solukhumbu. visitNepal77 covers the best places in all 77 districts — including lesser-known gems.",
  },
  {
    q: "How many districts does Nepal have?",
    a: "Nepal has 77 districts spread across 7 provinces. The provinces are Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, and Sudurpashchim. visitNepal77 covers all 77 districts with local places, ratings, and travel guides.",
  },
  {
    q: "What is the best time to visit Nepal?",
    a: "October to November (autumn) and March to May (spring) are the best times to visit Nepal — ideal for trekking and sightseeing with clear skies. Winter (December–February) suits the Terai and Kathmandu Valley. Monsoon (June–September) is lush but rainy.",
  },
  {
    q: "Can I find local food and hidden gems on visitNepal77?",
    a: "Absolutely. visitNepal77 specialises in local discoveries — authentic food spots, off-the-beaten-path attractions, village homestays, and neighbourhood gems contributed by local explorers across all 77 districts of Nepal.",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItems) }}
      />
      <AppShell>
        <div style={{ padding: "24px 20px 0" }} className="fade-up">
          <nav aria-label="Breadcrumb" style={{ marginBottom: 16 }}>
            <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, fontSize: 12, color: "var(--ink-faint)", listStyle: "none", margin: 0, padding: 0 }}>
              <li><Link href="/" style={{ color: "inherit" }}>Home</Link></li>
              <li aria-hidden="true">/</li>
              <li style={{ color: "var(--ink-muted)", fontWeight: 500 }} aria-current="page">About</li>
            </ol>
          </nav>

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 4 }}>
            About visitNepal77
          </div>
          <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 6 }}>
            Discover Nepal&apos;s Best Places Across All 77 Districts
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.75, marginBottom: 14 }}>
            Nepal is one of the world&apos;s most extraordinary travel destinations — home to eight of the ten highest mountains on Earth, ancient temples, vibrant local cultures, and landscapes that shift from Himalayan peaks to lush Terai forests within a single journey.{" "}
            <strong style={{ color: "var(--ink)" }}>visitNepal77</strong> is your complete travel guide to explore all 77 districts of Nepal, find the best places to visit, discover local food spots, and uncover hidden gems that most tourists never reach.
          </p>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.75, marginBottom: 28 }}>
            Whether you&apos;re planning a trek to Annapurna Base Camp, searching for the best local restaurants in Pokhara, exploring the temples of Bhaktapur, or looking for a quiet village stay in the hills — visitNepal77 brings together real reviews, district travel guides, and community-contributed discoveries in one place. Every one of Nepal&apos;s 77 districts has a story. Start exploring yours.
          </p>
        </div>

        <div style={{ padding: "0 20px" }} className="fade-up-1">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 10 }}>
            What we offer
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 36 }}>
            {FEATURES.map(({ icon, label, desc }) => (
              <div
                key={label}
                style={{
                  background: "var(--bg-card)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 18,
                  padding: "12px 14px",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 10 }}>
            FAQ
          </div>
          <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 16 }}>
            Frequently Asked Questions about Nepal Travel
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                style={{
                  background: "var(--bg-card)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 16,
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{q}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7 }}>{a}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingBottom: 8 }}>
            <Link href="/districts" style={{ background: "var(--jade)", color: "#fff", borderRadius: 999, padding: "10px 20px", fontSize: 13, fontWeight: 700 }}>
              Explore All 77 Districts
            </Link>
            <Link href="/allplaces" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", color: "var(--ink)", borderRadius: 999, padding: "10px 20px", fontSize: 13, fontWeight: 700 }}>
              Browse All Places
            </Link>
          </div>
        </div>
      </AppShell>
    </>
  );
}
