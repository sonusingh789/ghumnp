import HomePageClient from "@/components/pages/home-page-client";
import { getApprovedPlaces, getDistrictCards } from "@/lib/content";

export const metadata = {
  title: "Ghum Nepal - Explore All 77 Districts",
  description:
    "Discover Nepal's 77 districts: hidden gems, local foods, sacred places, and mountain stories. Plan your next adventure with Ghum Nepal.",
  openGraph: {
    title: "Ghum Nepal - Explore All 77 Districts",
    description:
      "Discover Nepal's 77 districts: hidden gems, local foods, sacred places, and mountain stories.",
    url: "https://ghumnepal.com/",
    siteName: "Ghum Nepal",
    images: [
      {
        url: "https://ghumnepal.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ghum Nepal - Explore All 77 Districts",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghum Nepal - Explore All 77 Districts",
    description:
      "Discover Nepal's 77 districts: hidden gems, local foods, sacred places, and mountain stories.",
    images: ["https://ghumnepal.com/og-image.jpg"],
    site: "@ghumnepal",
  },
};

export default async function HomePage() {
  const [districts, places] = await Promise.all([
    getDistrictCards(),
    getApprovedPlaces(),
  ]);

  const userProfile = {
    name: "Traveler",
    avatar: "https://i.pravatar.cc/160?img=14",
  };

  return (
    <HomePageClient
      featuredDistricts={districts.slice(0, 5)}
      allPlaces={places}
      userProfile={userProfile}
      initialAuthUser={null}
    />
  );
}
