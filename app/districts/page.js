import DistrictsPageClient from "@/components/pages/districts-page-client";
import { getAllDistrictNames, getDistrictCards } from "@/lib/content";

export const metadata = {
  title: "All Districts - Ghum Nepal",
  description:
    "See all 77 districts of Nepal. Find information, places, and travel tips for every district on Ghum Nepal.",
  openGraph: {
    title: "All Districts - Ghum Nepal",
    description:
      "See all 77 districts of Nepal. Find information, places, and travel tips for every district on Ghum Nepal.",
    url: "https://ghumnepal.com/districts",
    siteName: "Ghum Nepal",
    images: [
      {
        url: "https://ghumnepal.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "All Districts - Ghum Nepal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Districts - Ghum Nepal",
    description:
      "See all 77 districts of Nepal. Find information, places, and travel tips for every district on Ghum Nepal.",
    images: ["https://ghumnepal.com/og-image.jpg"],
    site: "@ghumnepal",
  },
};

export default async function DistrictsPage() {
  const [allDistricts, districts] = await Promise.all([
    getAllDistrictNames(),
    getDistrictCards(),
  ]);

  return <DistrictsPageClient allDistricts={allDistricts} districts={districts} />;
}
