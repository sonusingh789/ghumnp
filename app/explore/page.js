import ExplorePageClient from "@/components/pages/explore-page-client";
import { getDistrictCards, getProvinceNames } from "@/lib/content";

export const metadata = {
  title: "Explore Nepal - visitNepal77",
  description:
    "Browse all districts and provinces of Nepal. Find your next adventure with visitNepal77's explore page.",
  openGraph: {
    title: "Explore Nepal - visitNepal77",
    description:
      "Browse all districts and provinces of Nepal. Find your next adventure with visitNepal77's explore page.",
    url: "https://visitnepal77.com/explore",
    siteName: "visitNepal77",
    images: [
      {
        url: "https://visitnepal77.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Explore Nepal - visitNepal77",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Nepal - visitNepal77",
    description:
      "Browse all districts and provinces of Nepal. Find your next adventure with visitNepal77's explore page.",
    images: ["https://visitnepal77.com/og-image.jpg"],
    site: "@visitnepal77",
  },
};

export default async function ExplorePage() {
  const [districts, provinces] = await Promise.all([
    getDistrictCards(),
    getProvinceNames(),
  ]);

  return <ExplorePageClient districts={districts} provinces={provinces} />;
}
