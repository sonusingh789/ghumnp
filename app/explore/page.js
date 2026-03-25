import ExplorePageClient from "@/components/pages/explore-page-client";
import { getDistrictCards, getProvinceNames } from "@/lib/content";

export const metadata = {
  title: "Explore Nepal - Ghum Nepal",
  description:
    "Browse all districts and provinces of Nepal. Find your next adventure with Ghum Nepal's explore page.",
  openGraph: {
    title: "Explore Nepal - Ghum Nepal",
    description:
      "Browse all districts and provinces of Nepal. Find your next adventure with Ghum Nepal's explore page.",
    url: "https://ghumnepal.com/explore",
    siteName: "Ghum Nepal",
    images: [
      {
        url: "https://ghumnepal.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Explore Nepal - Ghum Nepal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Nepal - Ghum Nepal",
    description:
      "Browse all districts and provinces of Nepal. Find your next adventure with Ghum Nepal's explore page.",
    images: ["https://ghumnepal.com/og-image.jpg"],
    site: "@ghumnepal",
  },
};

export default async function ExplorePage() {
  const [districts, provinces] = await Promise.all([
    getDistrictCards(),
    getProvinceNames(),
  ]);

  return <ExplorePageClient districts={districts} provinces={provinces} />;
}
