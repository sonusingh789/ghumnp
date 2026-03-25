import { notFound } from "next/navigation";
import PlaceDetailScreen from "@/components/screens/place-detail-screen";
import { getApprovedPlaceBySlug } from "@/lib/content";

export async function generateMetadata({ params }) {
  const { placeId } = await params;
  const place = await getApprovedPlaceBySlug(placeId);
  if (!place) return {};
  return {
    title: `${place.name} - Ghum Nepal`,
    description: place.description || `Discover ${place.name} in Nepal on Ghum Nepal.`,
    openGraph: {
      title: `${place.name} - Ghum Nepal`,
      description: place.description || `Discover ${place.name} in Nepal on Ghum Nepal.`,
      url: `https://ghumnepal.com/place/${place.slug}`,
      siteName: "Ghum Nepal",
      images: [
        {
          url: place.image,
          width: 1200,
          height: 630,
          alt: `${place.name} - Ghum Nepal`,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${place.name} - Ghum Nepal`,
      description: place.description || `Discover ${place.name} in Nepal on Ghum Nepal.`,
      images: [place.image],
      site: "@ghumnepal",
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
