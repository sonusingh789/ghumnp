import { redirect } from "next/navigation";

export default async function DistrictCompatPage({ params }) {
  const { districtId } = await params;
  const safeDistrictId = encodeURIComponent(String(districtId || "").trim());
  redirect(`/districts/${safeDistrictId}`);
}
