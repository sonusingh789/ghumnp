"use client";

import { useState } from "react";
import Link from "next/link";

const TREKS = [
  {
    id: "ebc",
    name: "Everest Base Camp",
    tagline: "Walk in the shadow of the world's highest peak",
    district: "Solukhumbu",
    days: "12–14 days",
    difficulty: "Hard",
    maxElevation: "5,364 m",
    startPoint: "Lukla",
    endPoint: "EBC",
    season: "Mar–May · Sep–Nov",
    href: "/districts/solukhumbu",
    color: "#0369a1",
    lightColor: "#e0f2fe",
    emoji: "🏔️",
    waypoints: [
      { label: "Lukla",      x: 8,  y: 72 },
      { label: "Namche",     x: 24, y: 58 },
      { label: "Tengboche",  x: 40, y: 52 },
      { label: "Dingboche",  x: 56, y: 45 },
      { label: "Lobuche",    x: 72, y: 36 },
      { label: "Gorak Shep", x: 84, y: 28 },
      { label: "EBC",        x: 92, y: 22 },
    ],
    mountains: [
      { label: "Everest 8,849m", x: 88, y: 8 },
      { label: "Lhotse 8,516m",  x: 74, y: 14 },
    ],
  },
  {
    id: "annapurna",
    name: "Annapurna Circuit",
    tagline: "Nepal's most diverse and dramatic loop trek",
    district: "Kaski / Manang",
    days: "15–20 days",
    difficulty: "Hard",
    maxElevation: "5,416 m",
    startPoint: "Besisahar",
    endPoint: "Pokhara",
    season: "Mar–May · Oct–Nov",
    href: "/districts/kaski",
    color: "#7c3aed",
    lightColor: "#ede9fe",
    emoji: "🔄",
    waypoints: [
      { label: "Besisahar",  x: 8,  y: 75 },
      { label: "Chame",      x: 24, y: 60 },
      { label: "Manang",     x: 40, y: 48 },
      { label: "Thorong La", x: 55, y: 22 },
      { label: "Muktinath",  x: 70, y: 38 },
      { label: "Jomsom",     x: 82, y: 50 },
      { label: "Pokhara",    x: 93, y: 72 },
    ],
    mountains: [
      { label: "Annapurna I 8,091m", x: 46, y: 8 },
      { label: "Thorong La 5,416m",  x: 55, y: 14 },
    ],
  },
  {
    id: "langtang",
    name: "Langtang Valley",
    tagline: "The valley of glaciers, close to Kathmandu",
    district: "Rasuwa",
    days: "7–10 days",
    difficulty: "Moderate",
    maxElevation: "3,870 m",
    startPoint: "Syabrubesi",
    endPoint: "Kyanjin Gompa",
    season: "Mar–May · Oct–Nov",
    href: "/districts/rasuwa",
    color: "#059669",
    lightColor: "#d1fae5",
    emoji: "🌿",
    waypoints: [
      { label: "Syabrubesi", x: 8,  y: 78 },
      { label: "Lama Hotel", x: 28, y: 62 },
      { label: "Langtang",   x: 52, y: 44 },
      { label: "Kyanjin",    x: 76, y: 35 },
      { label: "Tsergo Ri",  x: 90, y: 22 },
    ],
    mountains: [
      { label: "Langtang Lirung 7,227m", x: 70, y: 10 },
    ],
  },
  {
    id: "poonhill",
    name: "Ghorepani Poon Hill",
    tagline: "Best sunrise panorama over the Annapurna range",
    district: "Myagdi",
    days: "4–5 days",
    difficulty: "Easy",
    maxElevation: "3,210 m",
    startPoint: "Nayapul",
    endPoint: "Ghandruk",
    season: "Year-round",
    href: "/districts/myagdi",
    color: "#d97706",
    lightColor: "#fef3c7",
    emoji: "🌅",
    waypoints: [
      { label: "Nayapul",   x: 8,  y: 80 },
      { label: "Ulleri",    x: 28, y: 58 },
      { label: "Ghorepani", x: 50, y: 40 },
      { label: "Poon Hill", x: 60, y: 28 },
      { label: "Tadapani",  x: 75, y: 45 },
      { label: "Ghandruk",  x: 92, y: 62 },
    ],
    mountains: [
      { label: "Dhaulagiri 8,167m",    x: 40, y: 10 },
      { label: "Machhapuchhre 6,993m", x: 72, y: 12 },
    ],
  },
  {
    id: "manaslu",
    name: "Manaslu Circuit",
    tagline: "Remote, raw and rarely crowded Himalayan circuit",
    district: "Gorkha",
    days: "14–18 days",
    difficulty: "Hard",
    maxElevation: "5,160 m",
    startPoint: "Arughat",
    endPoint: "Bimthang",
    season: "Mar–May · Sep–Nov",
    href: "/districts/gorkha",
    color: "#dc2626",
    lightColor: "#fee2e2",
    emoji: "🏕️",
    waypoints: [
      { label: "Arughat",   x: 8,  y: 78 },
      { label: "Jagat",     x: 26, y: 65 },
      { label: "Samagaon",  x: 48, y: 48 },
      { label: "Samdo",     x: 60, y: 38 },
      { label: "Larkya La", x: 72, y: 22 },
      { label: "Bimthang",  x: 88, y: 42 },
    ],
    mountains: [
      { label: "Manaslu 8,163m", x: 55, y: 8 },
    ],
  },
  {
    id: "mustang",
    name: "Upper Mustang",
    tagline: "The forbidden kingdom beyond the Himalayas",
    district: "Mustang",
    days: "12–16 days",
    difficulty: "Moderate",
    maxElevation: "3,840 m",
    startPoint: "Jomsom",
    endPoint: "Lo Manthang",
    season: "May–Oct",
    href: "/districts/mustang",
    color: "#b45309",
    lightColor: "#fef3c7",
    emoji: "🏜️",
    waypoints: [
      { label: "Jomsom",      x: 8,  y: 72 },
      { label: "Kagbeni",     x: 24, y: 62 },
      { label: "Chele",       x: 42, y: 50 },
      { label: "Ghami",       x: 60, y: 44 },
      { label: "Tsarang",     x: 76, y: 38 },
      { label: "Lo Manthang", x: 90, y: 32 },
    ],
    mountains: [
      { label: "Nilgiri 7,061m", x: 14, y: 12 },
    ],
  },
];

const DIFFICULTY_STYLE = {
  Easy:     { bg: "#dcfce7", color: "#15803d" },
  Moderate: { bg: "#fef9c3", color: "#a16207" },
  Hard:     { bg: "#fee2e2", color: "#dc2626" },
};

/* ── SVG Route Map ─────────────────────────────────────── */
function RouteMap({ trek }) {
  const h = 140;
  const pts = trek.waypoints;

  const path = pts.map((p, i) => {
    const px = (p.x / 100) * 280 + 10;
    const py = (p.y / 100) * (h - 24) + 12;
    if (i === 0) return `M ${px} ${py}`;
    const prev = pts[i - 1];
    const ppx = (prev.x / 100) * 280 + 10;
    const ppy = (prev.y / 100) * (h - 24) + 12;
    const cx1 = ppx + (px - ppx) * 0.5; const cy1 = ppy;
    const cx2 = ppx + (px - ppx) * 0.5; const cy2 = py;
    return `C ${cx1} ${cy1} ${cx2} ${cy2} ${px} ${py}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 300 ${h}`} style={{ width: "100%", height: h, display: "block" }} aria-hidden="true">
      <defs>
        <linearGradient id={`sky-${trek.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trek.lightColor} />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
        <linearGradient id={`route-${trek.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={trek.color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={trek.color} />
        </linearGradient>
      </defs>
      <rect width="300" height={h} fill={`url(#sky-${trek.id})`} />
      <polygon points={`0,${h} 0,${h*0.65} 50,${h*0.48} 100,${h*0.35} 150,${h*0.22} 195,${h*0.30} 235,${h*0.20} 270,${h*0.28} 300,${h*0.35} 300,${h}`} fill="rgba(148,163,184,0.18)" />
      <polygon points={`0,${h} 0,${h*0.72} 70,${h*0.55} 130,${h*0.40} 175,${h*0.50} 220,${h*0.38} 265,${h*0.45} 300,${h*0.52} 300,${h}`} fill="rgba(148,163,184,0.10)" />

      {/* Mountain labels */}
      {trek.mountains.map(m => (
        <text key={m.label} x={(m.x/100)*280+10} y={(m.y/100)*(h-24)+12} fontSize="6.5" fill={trek.color} textAnchor="middle" fontWeight="600" opacity="0.75">{m.label}</text>
      ))}

      {/* Route shadow + route */}
      <path d={path} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="4" strokeLinecap="round" />
      <path d={path} fill="none" stroke={`url(#route-${trek.id})`} strokeWidth="2.5" strokeLinecap="round" />

      {/* Waypoints */}
      {pts.map((p, i) => {
        const px = (p.x / 100) * 280 + 10;
        const py = (p.y / 100) * (h - 24) + 12;
        const isEnd = i === 0 || i === pts.length - 1;
        const labelY = py > h * 0.58 ? py - 9 : py + 14;
        return (
          <g key={p.label}>
            <circle cx={px} cy={py} r={isEnd ? 5.5 : 3.5} fill="#fff" stroke={trek.color} strokeWidth="1.8" />
            {isEnd && <circle cx={px} cy={py} r={2.2} fill={trek.color} />}
            <text x={px} y={labelY} fontSize="7" fill="#1e293b" textAnchor="middle" fontWeight={isEnd ? "700" : "500"}>{p.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Trek Detail Modal ─────────────────────────────────── */
function TrekModal({ trek, onClose }) {
  const diff = DIFFICULTY_STYLE[trek.difficulty];
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100, backdropFilter: "blur(3px)" }}
      />

      {/* Sheet — slides up from bottom */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 101,
        background: "#fff", borderRadius: "24px 24px 0 0",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
      }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e2e8f0" }} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: "absolute", top: 14, right: 16, width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Route map */}
        <div style={{ background: trek.lightColor, margin: "4px 16px 0", borderRadius: 16, overflow: "hidden" }}>
          <RouteMap trek={trek} />
        </div>

        {/* Content */}
        <div style={{ padding: "16px 20px 32px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 3 }}>
                {trek.name}
              </h2>
              <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{trek.tagline}</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, background: diff.bg, color: diff.color, borderRadius: 999, padding: "4px 10px", flexShrink: 0, marginTop: 2 }}>
              {trek.difficulty}
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "14px 0" }}>
            {[
              { icon: "🏔️", label: "Max Alt",   value: trek.maxElevation },
              { icon: "📅",  label: "Duration",  value: trek.days         },
              { icon: "🌤️", label: "Season",    value: trek.season       },
            ].map(s => (
              <div key={s.label} style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                <p style={{ fontSize: 16, marginBottom: 3 }}>{s.icon}</p>
                <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{s.label}</p>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Route waypoints */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Trail Route</p>
            <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 4, gap: 0 }}>
              {trek.waypoints.map((wp, i) => (
                <div key={wp.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: i === 0 || i === trek.waypoints.length - 1 ? 11 : 8,
                      height: i === 0 || i === trek.waypoints.length - 1 ? 11 : 8,
                      borderRadius: "50%",
                      background: i === 0 || i === trek.waypoints.length - 1 ? trek.color : "#fff",
                      border: `2px solid ${trek.color}`,
                    }} />
                    <span style={{ fontSize: 9, color: "#475569", fontWeight: i === 0 || i === trek.waypoints.length - 1 ? 700 : 500, whiteSpace: "nowrap" }}>
                      {wp.label}
                    </span>
                  </div>
                  {i < trek.waypoints.length - 1 && (
                    <div style={{ width: 20, height: 2, background: `${trek.color}35`, marginBottom: 14, flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            href={trek.href}
            style={{ display: "block", textAlign: "center", background: trek.color, color: "#fff", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
          >
            Explore {trek.district} District →
          </Link>
        </div>
      </div>
    </>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function TrekkingClient() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ padding: "10px 0 48px" }}>

      {/* ── TREK CARDS GRID ───────────────────────────── */}
      <div style={{ padding: "0 20px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 12 }}>
          Tap a trek to explore
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TREKS.map(trek => {
            const d = DIFFICULTY_STYLE[trek.difficulty];
            return (
              <button
                key={trek.id}
                onClick={() => setSelected(trek)}
                style={{
                  background: "#fff",
                  border: "1.5px solid #f1f5f9",
                  borderRadius: 18,
                  padding: 0,
                  overflow: "hidden",
                  textAlign: "left",
                  cursor: "pointer",
                  boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
                  width: "100%",
                }}
              >
                {/* Mini route preview */}
                <div style={{ background: trek.lightColor, padding: "10px 12px 4px" }}>
                  <svg viewBox="0 0 300 70" style={{ width: "100%", height: 70, display: "block" }} aria-hidden="true">
                    <defs>
                      <linearGradient id={`mini-sky-${trek.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={trek.lightColor} />
                        <stop offset="100%" stopColor="#f8fafc" />
                      </linearGradient>
                    </defs>
                    <rect width="300" height="70" fill={`url(#mini-sky-${trek.id})`} />
                    <polygon points="0,70 0,45 60,30 120,18 170,25 220,14 270,22 300,28 300,70" fill="rgba(148,163,184,0.15)" />

                    {/* Route path */}
                    <path
                      d={trek.waypoints.map((p, i) => {
                        const px = (p.x / 100) * 280 + 10;
                        const py = (p.y / 100) * 50 + 8;
                        if (i === 0) return `M ${px} ${py}`;
                        const prev = trek.waypoints[i-1];
                        const ppx = (prev.x/100)*280+10, ppy = (prev.y/100)*50+8;
                        return `C ${ppx+(px-ppx)*0.5} ${ppy} ${ppx+(px-ppx)*0.5} ${py} ${px} ${py}`;
                      }).join(" ")}
                      fill="none" stroke={trek.color} strokeWidth="2" strokeLinecap="round" opacity="0.8"
                    />
                    {/* Start/end dots */}
                    {[trek.waypoints[0], trek.waypoints[trek.waypoints.length-1]].map((p, i) => (
                      <circle key={i} cx={(p.x/100)*280+10} cy={(p.y/100)*50+8} r="4" fill="#fff" stroke={trek.color} strokeWidth="1.5" />
                    ))}
                    {/* Intermediate dots */}
                    {trek.waypoints.slice(1,-1).map((p, i) => (
                      <circle key={i} cx={(p.x/100)*280+10} cy={(p.y/100)*50+8} r="2.5" fill={trek.color} opacity="0.5" />
                    ))}
                    {/* Start / End labels */}
                    <text x={(trek.waypoints[0].x/100)*280+10} y={66} fontSize="7.5" fill={trek.color} textAnchor="middle" fontWeight="700">{trek.waypoints[0].label}</text>
                    <text x={(trek.waypoints[trek.waypoints.length-1].x/100)*280+10} y={66} fontSize="7.5" fill={trek.color} textAnchor="middle" fontWeight="700">{trek.waypoints[trek.waypoints.length-1].label}</text>
                  </svg>
                </div>

                {/* Card info */}
                <div style={{ padding: "10px 14px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 15 }}>{trek.emoji}</span>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trek.name}</p>
                    </div>
                    <p style={{ fontSize: 11, color: "#6b7280" }}>{trek.district} · {trek.days}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: d.bg, color: d.color, borderRadius: 999, padding: "3px 9px" }}>
                      {trek.difficulty}
                    </span>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{trek.maxElevation}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
          <Link href="/districts" style={{ background: "#059669", color: "#fff", borderRadius: 999, padding: "9px 18px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            Browse Districts
          </Link>
          <Link href="/allplaces" style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#0f172a", borderRadius: 999, padding: "9px 18px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            All Places
          </Link>
        </div>
      </div>

      {/* ── MODAL ─────────────────────────────────────── */}
      {selected && <TrekModal trek={selected} onClose={() => setSelected(null)} />}

    </div>
  );
}
