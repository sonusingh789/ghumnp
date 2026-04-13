import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatVisitors(count) {
  if (!count && count !== 0) return "";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M visitors`;
  if (count >= 1000) return `${Math.round(count / 1000)}k visitors`;
  return `${count} visitors`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDistrictById(districts, districtId) {
  return districts.find((district) => district.id === districtId);
}

export function getPlaceById(places, placeId) {
  return places.find((place) => place.id === placeId);
}

/**
 * Generates a URL-safe slug for a contributor profile link.
 * Format: "firstname-lastname-{id}" — deterministic and collision-free.
 */
export function contributorSlug(name, id) {
  const slug = (name || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}-${id}`;
}