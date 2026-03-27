import Link from "next/link";
import Image from "next/image";
import AppShell from "@/components/layout/app-shell";
import DistrictCard from "@/components/cards/district-card";
import HomeSearch from "@/components/forms/home-search";
import HomeTopPlaces from "@/components/sections/home-top-places";
import { ChevronRightIcon } from "@/components/ui/icons";

export default function HomePageClient({
  featuredDistricts,
  popularDistricts = [],
  topPlaces,
  initialQuery = "",
}) {
  return (
    <AppShell showTopBar={false}>
      <header
        style={{
          padding: "8px 20px 0",
          display: "flex",
          justifyContent: "center",
        }}
        className="fade-up"
      >
        <Image src="/logo.png" alt="visitNepal77 - logo" width={200} height={50} priority />
      </header>

      <div style={{ padding: "16px 20px 0" }} className="fade-up-1">
        <HomeSearch initialQuery={initialQuery} />
      </div>

      <div style={{ padding: "24px 0 0" }}>
        <section className="fade-up-2" style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--jade)",
                  marginBottom: 2,
                }}
              >
                Popular
              </div>
              <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
                Featured Districts
              </h2>
            </div>
            <Link
              href="/districts"
              style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 13, fontWeight: 600, color: "var(--jade)" }}
            >
              All 77 <ChevronRightIcon className="size-4" />
            </Link>
          </div>
          <div className="scrollbar-hide mobile-h-scroll" style={{ display: "flex", gap: 12, padding: "4px 20px 8px" }}>
            {featuredDistricts.map((district, index) => (
              <DistrictCard key={district.id} district={district} compact imagePriority={index === 0} />
            ))}
          </div>
        </section>

        {popularDistricts.length ? (
          <section className="fade-up-3" style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: 2,
                  }}
                >
                  Trending
                </div>
                <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
                  Popular Districts
                </h2>
              </div>
              <Link
                href="/districts"
                style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 13, fontWeight: 600, color: "var(--jade)" }}
              >
                View all <ChevronRightIcon className="size-4" />
              </Link>
            </div>
            <div className="scrollbar-hide mobile-h-scroll" style={{ display: "flex", gap: 12, padding: "4px 20px 8px" }}>
              {popularDistricts.map((district, index) => (
                <DistrictCard
                  key={`popular-${district.id}`}
                  district={district}
                  compact
                  imagePriority={index === 0}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="fade-up-4" style={{ marginBottom: 32, padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: 2,
                }}
              >
                Must Visit
              </div>
              <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
                Top Places
              </h2>
            </div>
            <Link
              href="/allplaces"
              style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 13, fontWeight: 600, color: "var(--jade)" }}
            >
              View all <ChevronRightIcon className="size-4" />
            </Link>
          </div>
          <HomeTopPlaces places={topPlaces} />
        </section>
      </div>
    </AppShell>
  );
}
