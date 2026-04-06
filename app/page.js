import HomePageClient from "@/components/pages/home-page-client";
import { getDistrictCards, getFeaturedDistricts, getHomePageCollections } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { query } from "@/lib/db";

export const metadata = buildMetadata({
  title: "Best Places to Visit in Nepal — Explore All 77 Districts | visitNepal77",
  description:
    "Discover the best places to visit in Nepal. Explore all 77 districts with travel guides, top-rated tourist spots, local food, hidden gems, and real reviews — only on visitNepal77.",
  path: "/",
  keywords: [
    "best places to visit in Nepal",
    "visit Nepal",
    "Nepal travel guide",
    "Nepal 77 districts",
    "Nepal tourism",
    "places to visit in Nepal",
    "Nepal travel destinations",
    "Nepal hidden gems",
    "Nepal districts guide",
    "visitNepal77",
    "Nepal tourist spots",
    "best tourist places in Nepal",
    "Nepal travel 2026",
    "Nepal travel 2027",
    "Nepal trip planning",
    "things to do in Nepal",
  ],
});

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialQuery =
    typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q.trim() : "";
  const [districts, featuredDistricts, homeCollections, topContributorsResult] = await Promise.all([
    getDistrictCards(),
    getFeaturedDistricts(),
    getHomePageCollections(),
    query(
      `SELECT TOP 3
         u.id, u.name, u.avatar_url,
         COUNT(p.id) AS contributions
       FROM Users u
       INNER JOIN Places p ON p.created_by_user_id = u.id AND p.status = 'approved'
       WHERE u.is_active = 1
       GROUP BY u.id, u.name, u.avatar_url
       ORDER BY contributions DESC`
    ).catch(() => ({ recordset: [] })),
  ]);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What are the best places to visit in Nepal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nepal has countless incredible destinations. Top places to visit include Pashupatinath Temple and Boudhanath Stupa in Kathmandu, Phewa Lake in Pokhara, Chitwan National Park, Lumbini (birthplace of Buddha), Annapurna Base Camp, and Everest Base Camp. visitNepal77 covers the best places across all 77 districts so you can discover both famous sites and hidden local gems.",
        },
      },
      {
        "@type": "Question",
        name: "How many districts does Nepal have?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nepal has exactly 77 districts spread across 7 provinces — from the high Himalayan regions of Koshi and Gandaki in the north to the fertile Terai plains of Madhesh and Lumbini in the south. visitNepal77 covers all 77 districts with local places, ratings, reviews, and travel guides.",
        },
      },
      {
        "@type": "Question",
        name: "What is visitNepal77?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "visitNepal77 is a Nepal travel discovery platform that covers all 77 districts of Nepal. It helps travelers find the best places to visit, local food spots, hidden gems, hotels, and cultural attractions. Users can browse by district or province, read real reviews, and contribute their own discoveries.",
        },
      },
      {
        "@type": "Question",
        name: "What is the best time to visit Nepal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The best time to visit Nepal is October–November (autumn) and March–May (spring). These seasons offer clear skies, ideal trekking weather, and comfortable temperatures across most districts. Winter (December–February) is great for lower Terai districts and cultural tours. Monsoon season (June–September) brings lush green landscapes but heavy rainfall.",
        },
      },
      {
        "@type": "Question",
        name: "Can I find hidden gems and local food in Nepal on visitNepal77?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! visitNepal77 specialises in local discoveries — not just famous tourist sites. You can find authentic local food spots, off-the-beaten-path attractions, community homestays, and neighbourhood gems contributed by local explorers across all 77 districts of Nepal.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePageClient
        featuredDistricts={featuredDistricts}
        allDistricts={districts}
        popularDistricts={homeCollections.popularDistricts}
        topContributors={topContributorsResult.recordset}
        topPlaces={homeCollections.topPlaces}
        initialQuery={initialQuery}
      />
    </>
  );
}
