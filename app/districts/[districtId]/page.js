import { notFound } from "next/navigation";
import DistrictDetailScreen from "@/components/screens/district-detail-screen";
import { getDistrictBySlug, getDistrictListingPlacesByDistrictSlug } from "@/lib/content";

export async function generateMetadata({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId);
  if (!district) return {};
  return {
    title: `${district.name} District - Ghum Nepal`,
    description: district.tagline || `Explore ${district.name} district in Nepal on Ghum Nepal.`,
    openGraph: {
      title: `${district.name} District - Ghum Nepal`,
      description: district.tagline || `Explore ${district.name} district in Nepal on Ghum Nepal.`,
      url: `https://ghumnepal.com/districts/${district.slug}`,
      siteName: "Ghum Nepal",
      images: [
        {
          url: district.image,
          width: 1200,
          height: 630,
          alt: `${district.name} District - Ghum Nepal`,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${district.name} District - Ghum Nepal`,
      description: district.tagline || `Explore ${district.name} district in Nepal on Ghum Nepal.`,
      images: [district.image],
      site: "@ghumnepal",
    },
  };
}

export default async function DistrictDetailPage({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId);

  if (!district) {
    notFound();
  }

  const districtPlaces = await getDistrictListingPlacesByDistrictSlug(districtId);

  return <DistrictDetailScreen district={district} districtPlaces={districtPlaces} />;
}
