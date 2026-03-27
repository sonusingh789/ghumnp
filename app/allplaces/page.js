import AllPlacesPageClient from "@/components/pages/all-places-page-client";
import { getRecentPlaces } from "@/lib/content";

export const revalidate = 300;

export const metadata = {
  title: "All Places - visitNepal77",
  description:
    "Browse recent approved places added across Nepal. Search attractions, food spots, stays, and hidden corners on visitNepal77.",
  alternates: {
    canonical: "https://visitnepal77.com/allplaces",
  },
  openGraph: {
    title: "All Places - visitNepal77",
    description:
      "Browse recent approved places added across Nepal.",
    url: "https://visitnepal77.com/allplaces",
    siteName: "visitNepal77",
    images: [
      {
        url: "https://visitnepal77.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "All Places - visitNepal77",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Places - visitNepal77",
    description:
      "Browse recent approved places added across Nepal.",
    images: ["https://visitnepal77.com/og-image.jpg"],
    site: "@visitnepal77",
  },
};

export default async function AllPlacesPage() {
  const places = await getRecentPlaces();

  return <AllPlacesPageClient places={places} />;
}
