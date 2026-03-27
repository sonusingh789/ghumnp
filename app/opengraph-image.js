import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const alt = `${SITE_NAME} social preview`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background:
            "linear-gradient(135deg, #ecfdf5 0%, #f8fafc 35%, #eff6ff 100%)",
          color: "#0f172a",
        }}
      >
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
              gap: 16,
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
              fontSize: 22,
              color: "#475569",
            }}
          >
            {SITE_URL.replace("https://", "")}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.08,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              maxWidth: 860,
            }}
          >
            Explore Nepal&apos;s 77 districts, places, and local stories.
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "#334155",
              maxWidth: 840,
            }}
          >
            Travel guides, district pages, place details, reviews, and local discoveries in one searchable experience.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          {["77 Districts", "Local Places", "Social Sharing Ready"].map((item) => (
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
