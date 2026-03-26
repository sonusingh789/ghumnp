import { notFound } from "next/navigation";
import PlaceDetailScreen from "@/components/screens/place-detail-screen";
import { getApprovedPlaceBySlug } from "@/lib/content";

export async function generateMetadata({ params }) {
  const { placeId } = await params;
  const place = await getApprovedPlaceBySlug(placeId);
  if (!place) return {};
  return {
    title: `${place.name} - visitNepal77`,
    description: place.description || `Discover ${place.name} in Nepal on visitNepal77.`,
    openGraph: {
      title: `${place.name} - visitNepal77`,
      description: place.description || `Discover ${place.name} in Nepal on visitNepal77.`,
      url: `https://visitnepal77.com/place/${place.slug}`,
      siteName: "visitNepal77",
      images: [
        {
          url: place.image,
          width: 1200,
          height: 630,
          alt: `${place.name} - visitNepal77`,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${place.name} - visitNepal77`,
      description: place.description || `Discover ${place.name} in Nepal on visitNepal77.`,
      images: [place.image],
      site: "@visitnepal77",
    },
  };
}

export default async function PlaceDetailPage({ params }) {
  const { placeId } = await params;
  const place = await getApprovedPlaceBySlug(placeId);

  if (!place) {
    notFound();
  }

  return <PlaceDetailScreen place={place} />;
}
