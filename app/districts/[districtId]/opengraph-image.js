import { ImageResponse } from "next/og";
import { getDistrictBySlug } from "@/lib/content";
import { SITE_NAME } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = "visitNepal77 district preview";

function clampText(value = "", maxLength = 120) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export default async function DistrictOpenGraphImage({ params }) {
  const { districtId } = await params;
  const district = await getDistrictBySlug(districtId);

  const districtName = district?.name || "Nepal District";
  const province = district?.province || "Nepal";
  const tagline = clampText(
    district?.tagline || district?.seoContent?.intro || `Explore ${districtName} with ${SITE_NAME}.`,
    150
  );
  const stats = [
    district?.rating ? `★ ${Number(district.rating).toFixed(1)} rating` : "Travel guide",
    district?.visitorsCount ? `${district.visitorsCount} visitors` : "District insights",
    province,
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 60px",
          background:
            "linear-gradient(135deg, #ecfdf5 0%, #f8fafc 38%, #eef6ff 100%)",
          color: "#0f172a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -60,
            width: 280,
            height: 280,
            borderRadius: 999,
            background: "rgba(34, 197, 94, 0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -40,
            bottom: -120,
            width: 420,
            height: 240,
            borderRadius: 999,
            background: "rgba(14, 116, 144, 0.10)",
            transform: "rotate(-8deg)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 28,
              fontWeight: 700,
              color: "#047857",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#f59e0b",
              }}
            />
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.88)",
              border: "1px solid rgba(15,23,42,0.08)",
              fontSize: 22,
              color: "#475569",
            }}
          >
            {province}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 860 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#059669",
            }}
          >
            District Guide
          </div>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {districtName}
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.42,
              color: "#334155",
              maxWidth: 840,
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {stats.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(15,23,42,0.08)",
                fontSize: 24,
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
