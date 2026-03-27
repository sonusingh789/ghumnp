import { notFound } from "next/navigation";
import PlaceDetailScreen from "@/components/screens/place-detail-screen";
import { getApprovedPlaceBySlug } from "@/lib/content";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { placeId } = await params;
  const place = await getApprovedPlaceBySlug(placeId);
  if (!place) return {};
  const seo = place.seoContent || {};
  const description =
    place.description ||
    seo.longDescription?.slice(0, 155) ||
    `Discover ${place.name} in Nepal on visitNepal77.`;
  return buildMetadata({
    title: place.name,
    description,
    path: `/place/${place.id}`,
    image: place.image,
    imageAlt: `${place.name} - visitNepal77`,
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

  const schemaItems = [
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      name: place.name,
      description: place.description,
      image: place.images?.length ? place.images : [place.image],
      url: `${SITE_URL}/place/${place.id}`,
      touristType: place.category,
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
