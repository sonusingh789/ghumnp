import { notFound } from "next/navigation";
import PlaceDetailScreen from "@/components/screens/place-detail-screen";
import { getApprovedPlaceBySlug, getRecentPlaces } from "@/lib/content";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const places = await getRecentPlaces(); // lightweight single-query, no enrichment
  return places.map((p) => ({ placeId: p.id }));
}

export async function generateMetadata({ params }) {
  const { placeId } = await params;
  const place = await getApprovedPlaceBySlug(placeId);
  if (!place) return {};
  const seo = place.seoContent || {};
  const baseDesc =
    place.description ||
    seo.longDescription?.slice(0, 120) ||
    `Discover ${place.name} in Nepal.`;
  const description =
    `${place.name} — ${place.category} in ${place.location}, ${place.districtId} District, Nepal. ${baseDesc}`
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 158);
  return buildMetadata({
    title: `${place.name} — ${place.category} in ${place.location} | visitNepal77`,
    description,
    path: `/place/${place.id}`,
    image: place.image,
    imageAlt: `${place.name}, ${place.location}, ${place.districtId} District Nepal — visitNepal77`,
    type: "article",
    keywords: [
      place.name,
      `${place.name} Nepal`,
      `${place.name} ${place.districtId}`,
      `${place.category} in ${place.location}`,
      `${place.category} in ${place.districtId}`,
      `best ${place.category.toLowerCase()} in ${place.districtId}`,
      `things to do in ${place.districtId}`,
      `places to visit in ${place.districtId}`,
      `${place.location} Nepal`,
      `${place.districtId} district travel`,
      `visit ${place.name}`,
      `Nepal tourism`,
      `visitNepal77 ${place.name}`,
    ],
  });
}

export default async function PlaceDetailPage({ params }) {
  const { placeId } = await params;
  const place = await getApprovedPlaceBySlug(placeId);

  if (!place) {
    notFound();
  }

  const faqItems = (place.seoContent?.faqs || [])
    .map((item) => {
      const [question, ...rest] = item.split("::");
      const answer = rest.join("::").trim();
      if (!question?.trim() || !answer) return null;
      return {
        "@type": "Question",
        name: question.trim(),
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      };
    })
    .filter(Boolean);

  const SCHEMA_TYPE_MAP = {
    attraction: "TouristAttraction",
    food:       "FoodEstablishment",
    restaurant: "Restaurant",
    hotel:      "Hotel",
    stay:       "LodgingBusiness",
  };
  const schemaType = SCHEMA_TYPE_MAP[place.category] || "TouristAttraction";

  const dateModified = place.updatedAt
    ? new Date(place.updatedAt).toISOString().split("T")[0]
    : undefined;

  const schemaItems = [
    {
      "@context": "https://schema.org",
      "@type": schemaType,
      name: place.name,
      description: place.description,
      image: place.images?.length ? place.images : [place.image],
      url: `${SITE_URL}/place/${place.id}`,
      touristType: place.category,
      ...(dateModified ? { dateModified } : {}),
      address: {
        "@type": "PostalAddress",
        addressLocality: place.location,
        addressRegion: place.districtId,
        addressCountry: "NP",
      },
      ...(place.rating > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: place.rating.toFixed(1),
              reviewCount: place.reviews?.length || 1,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
      ...(place.reviews?.length
        ? {
            review: place.reviews.slice(0, 5).map((r) => ({
              "@type": "Review",
              reviewRating: {
                "@type": "Rating",
                ratingValue: r.rating,
                bestRating: 5,
                worstRating: 1,
              },
              author: {
                "@type": "Person",
                name: r.author || "Visitor",
              },
              reviewBody: r.comment || "",
              datePublished: r.date
                ? new Date(r.date).toISOString().split("T")[0]
                : undefined,
            })),
          }
        : {}),
      // ReviewAction enables "Write a Review" sitelink in Google SERP
      potentialAction: {
        "@type": "WriteAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/place/${place.id}#reviews`,
          actionPlatform: [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform",
          ],
        },
        result: {
          "@type": "Review",
          reviewAspect: "overall experience",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Districts",
          item: `${SITE_URL}/districts`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${place.districtId} District`,
          item: `${SITE_URL}/districts/${place.districtId}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: place.name,
          item: `${SITE_URL}/place/${place.id}`,
        },
      ],
    },
  ];

  if (faqItems.length) {
    schemaItems.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems,
    });
  }

  // Speakable: marks which CSS selectors contain voice-search-worthy content
  schemaItems.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${place.name} — ${place.category} in ${place.location}`,
    url: `${SITE_URL}/place/${place.id}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".place-description", ".place-meta"],
    },
  });

  return (
    <>
      {schemaItems.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItems) }}
        />
      ) : null}
      <PlaceDetailScreen place={place} />
    </>
  );
}
