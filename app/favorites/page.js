import { redirect } from "next/navigation";
import FavoritesPageClient from "@/components/pages/favorites-page-client";
import { getApprovedPlacesBySlugs, getCurrentUser, getFavoriteCollections } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { buildLoginHref } from "@/utils/navigation";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "My Favorites",
  description:
    "View your favorite places and districts on visitNepal77 and organize your Nepal travel wishlist.",
  path: "/favorites",
  noIndex: true,
});

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginHref("/favorites"));
  }

  const [favoriteCollections, suggestions] = await Promise.all([
    getFavoriteCollections(),
    getApprovedPlacesBySlugs(["pashupatinath", "boudhanath", "phewa-lake"]),
  ]);

  return (
    <FavoritesPageClient
      initialFavoritePlaces={favoriteCollections.favoritePlaces}
      initialFavoriteDistricts={favoriteCollections.favoriteDistricts}
      initialSuggestions={suggestions}
    />
  );
}
