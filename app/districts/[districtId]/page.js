import { notFound } from "next/navigation";
import DistrictDetailScreen from "@/components/screens/district-detail-screen";
import { getDistrictBySlug, getDistrictListingPlacesByDistrictSlug } from "@/lib/content";

export async function generateMetadata({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId);
  if (!district) return {};
  return {
    title: `${district.name} District- visitNepal77`,
    description: district.tagline || `Explore ${district.name} district in Nepal on visitNepal77.`,
    openGraph: {
      title: `${district.name} District - visitNepal77`,
      description: district.tagline || `Explore ${district.name} district in Nepal on visitNepal77.`,
      url: `https://visitnepal77.com/districts/${district.slug}`,
      siteName: "visitNepal77",
      images: [
        {
          url: district.image,
          width: 1200,
          height: 630,
          alt: `${district.name} District - visitNepal77`,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${district.name} District -  visitNepal77`,
      description: district.tagline || `Explore ${district.name} district in Nepal on visitNepal77.`,
      images: [district.image],
      site: "@visitnepal77",
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
