import { notFound } from "next/navigation";
import DistrictDetailScreen from "@/components/screens/district-detail-screen";
import { getDistrictBySlug, getDistrictListingPlacesByDistrictSlug } from "@/lib/content";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId);
  if (!district) return {};
  const seo = district.seoContent || {};
  const descriptionSource =
    seo.intro ||
    district.tagline ||
    `Explore ${district.name} district in Nepal on visitNepal77.`;
  const description =
    `${district.name} district travel guide — best places to visit, local food, things to do, how to reach, and hidden gems in ${district.name}, ${district.province} Province, Nepal. ${descriptionSource}`
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 158);
  return buildMetadata({
    title: `${district.name} District Travel Guide — Best Places, Things To Do & Tips | visitNepal77`,
    description,
    path: `/districts/${district.id}`,
    type: "article",
    keywords: [
      `${district.name} district`,
      `${district.name} Nepal`,
      `${district.name} travel guide`,
      `best places to visit in ${district.name}`,
      `things to do in ${district.name}`,
      `${district.name} tourist attractions`,
      `${district.name} local food`,
      `${district.name} hidden gems`,
      `visit ${district.name}`,
      `${district.name} trip`,
      `how to reach ${district.name}`,
      `best time to visit ${district.name}`,
      `${district.province} province Nepal`,
      `${district.province} Nepal travel`,
      `Nepal 77 districts`,
      `visitNepal77 ${district.name}`,
    ],
  });
}

export default async function DistrictDetailPage({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId);

  if (!district) {
    notFound();
  }

  const seo = district.seoContent || {};
  const districtPlaces = await getDistrictListingPlacesByDistrictSlug(districtId);
  const faqItems = (district.seoContent?.faqs || [])
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
      name: `${district.name} District`,
      description:
        seo.intro || district.tagline || `Travel guide for ${district.name}, Nepal.`,
      url: `${SITE_URL}/districts/${district.id}`,
      image: district.image,
      touristType: "District travel guide",
      address: {
        "@type": "PostalAddress",
        addressRegion: district.province,
        addressCountry: "NP",
      },
      ...(district.rating > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: district.rating.toFixed(1),
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${district.name} District`,
      description:
        seo.intro || district.tagline || `Explore places in ${district.name}, Nepal.`,
      url: `${SITE_URL}/districts/${district.id}`,
      image: district.image,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: districtPlaces.slice(0, 10).map((place, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: place.name,
          url: `${SITE_URL}/place/${place.id}`,
        })),
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
          name: district.name,
          item: `${SITE_URL}/districts/${district.id}`,
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
      <DistrictDetailScreen district={district} districtPlaces={districtPlaces} />
    </>
  );
}
