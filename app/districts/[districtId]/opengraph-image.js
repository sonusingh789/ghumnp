import { ImageResponse } from "next/og";
import { getDistrictBySlug } from "@/lib/content";
import { SITE_NAME } from "@/lib/seo";

export const alt = "District travel guide — visitNepal77";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId).catch(() => null);

  const name = district?.name ?? "Nepal District";
  const province = district?.province ?? "Nepal";
  const tagline = district?.tagline ?? "Explore places, food, and hidden gems";
  const imageUrl = district?.image ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #064e35 0%, #059669 100%)",
        }}
      >
        {/* Background district image */}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.38,
            }}
          />
        ) : null}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(4,40,24,0.95) 0%, rgba(4,40,24,0.55) 55%, rgba(4,40,24,0.7) 100%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            height: "100%",
            padding: "52px 72px",
          }}
        >
          {/* Province badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 22,
            }}
          >
            <div
              style={{
                background: "rgba(5,150,105,0.85)",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                display: "flex",
              }}
            >
              {province} Province · Nepal
            </div>
          </div>

          {/* District name */}
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              marginBottom: 18,
              display: "flex",
            }}
          >
            {name}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.4,
              marginBottom: 36,
              maxWidth: 900,
              display: "flex",
            }}
          >
            {tagline}
          </div>

          {/* Branding row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#86efac",
                display: "flex",
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.35)",
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.55)",
                display: "flex",
              }}
            >
              Nepal Travel Guide · All 77 Districts
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
