import HomePageClient from "@/components/pages/home-page-client";
import { getApprovedPlaces, getDistrictCards } from "@/lib/content";

export const metadata = {
  title: "visitNepal77 - Explore All 77 Districts",
  description:
    "Discover Nepal's 77 districts: hidden gems, local foods, sacred places, and mountain stories. Plan your next adventure with Ghum Nepal.",
  openGraph: {
    title: "visitNepal77 - Explore All 77 Districts",
    description:
      "Discover Nepal's 77 districts: hidden gems, local foods, sacred places, and mountain stories.",
    url: "https://visitnepal77.com/",
    siteName: "visitNepal77",
    images: [
      {
        url: "https://visitnepal77.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "visitNepal77 - Explore All 77 Districts",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "visitNepal77 - Explore All 77 Districts",
    description:
      "Discover Nepal's 77 districts: hidden gems, local foods, sacred places, and mountain stories.",
    images: ["https://visitnepal77.com/og-image.jpg"],
    site: "@visitnepal77",
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
