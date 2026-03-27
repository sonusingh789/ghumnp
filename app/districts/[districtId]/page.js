import { notFound } from "next/navigation";
import DistrictDetailScreen from "@/components/screens/district-detail-screen";
import { getDistrictBySlug, getDistrictListingPlacesByDistrictSlug } from "@/lib/content";
import { buildMetadata, SITE_URL } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId);
  if (!district) return {};
  const seo = district.seoContent || {};
  const description =
    district.tagline ||
    seo.intro?.slice(0, 155) ||
    `Explore ${district.name} district in Nepal on visitNepal77.`;
  return buildMetadata({
    title: `${district.name} District`,
    description,
    path: `/districts/${district.id}`,
    image: district.image,
    imageAlt: `${district.name} District - visitNepal77`,
  });
}

export default async function DistrictDetailPage({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId);

  if (!district) {
    notFound();
  }

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
      "@type": "CollectionPage",
      name: `${district.name} District`,
      description: district.tagline || `Explore places in ${district.name}, Nepal.`,
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
