"use client";

import { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   REGION DEFINITIONS
───────────────────────────────────────────────────────────── */
const REGIONS = [
  { id: "all",      label: "All",        emoji: "🗺️"  },
  { id: "everest",  label: "Everest",    emoji: "🏔️"  },
  { id: "annapurna",label: "Annapurna",  emoji: "🍃"  },
  { id: "langtang", label: "Langtang",   emoji: "🌲"  },
  { id: "restricted",label: "Wilderness",emoji: "🗺️" },
];

/* ─────────────────────────────────────────────────────────────
   ALL TREKS
───────────────────────────────────────────────────────────── */
const TREKS = [
  // ── EVEREST REGION ───────────────────────────────────────
  {
    id: "ebc", region: "everest",
    name: "Everest Base Camp",
    tagline: "Walk to the foot of the world's highest peak",
    district: "Solukhumbu", days: "12–14 days", difficulty: "Hard",
    maxElevation: "5,364 m", season: "Mar–May · Sep–Nov",
    href: "/districts/solukhumbu", color: "#0369a1", lightColor: "#e0f2fe", emoji: "🏔️",
    restricted: false,
    waypoints: [
      { label: "Lukla", x:6, y:72 }, { label: "Namche", x:24, y:56 },
      { label: "Tengboche", x:42, y:48 }, { label: "Dingboche", x:58, y:40 },
      { label: "Lobuche", x:74, y:30 }, { label: "EBC", x:92, y:22 },
    ],
    mountains: [{ label: "Everest 8,849m", x:88, y:8 }],
  },
  {
    id: "gokyo", region: "everest",
    name: "Gokyo Lakes Trek",
    tagline: "Turquoise glacial lakes under Cho Oyu",
    district: "Solukhumbu", days: "12–14 days", difficulty: "Hard",
    maxElevation: "5,357 m", season: "Mar–May · Sep–Nov",
    href: "/districts/solukhumbu", color: "#0284c7", lightColor: "#e0f2fe", emoji: "🏞️",
    restricted: false,
    waypoints: [
      { label: "Lukla", x:6, y:74 }, { label: "Namche", x:24, y:58 },
      { label: "Dole", x:44, y:46 }, { label: "Machhermo", x:64, y:36 },
      { label: "Gokyo", x:82, y:26 }, { label: "Gokyo Ri", x:92, y:18 },
    ],
    mountains: [{ label: "Cho Oyu 8,188m", x:78, y:8 }],
  },
  {
    id: "three-passes", region: "everest",
    name: "Everest Three Passes",
    tagline: "Cross Renjo La, Cho La and Kongma La",
    district: "Solukhumbu", days: "18–21 days", difficulty: "Hard",
    maxElevation: "5,545 m", season: "Mar–May · Oct–Nov",
    href: "/districts/solukhumbu", color: "#075985", lightColor: "#e0f2fe", emoji: "🔺",
    restricted: false,
    waypoints: [
      { label: "Lukla", x:6, y:74 }, { label: "Namche", x:22, y:58 },
      { label: "Renjo La", x:38, y:24 }, { label: "Gokyo", x:52, y:36 },
      { label: "Cho La", x:66, y:22 }, { label: "Kongma La", x:80, y:28 },
      { label: "EBC", x:92, y:20 },
    ],
    mountains: [{ label: "Everest 8,849m", x:88, y:8 }],
  },
  {
    id: "gokyo-renjo", region: "everest",
    name: "Gokyo Renjo La Pass",
    tagline: "Scenic western Khumbu valley and pass",
    district: "Solukhumbu", days: "14–16 days", difficulty: "Hard",
    maxElevation: "5,360 m", season: "Mar–May · Oct–Nov",
    href: "/districts/solukhumbu", color: "#0369a1", lightColor: "#e0f2fe", emoji: "⛰️",
    restricted: false,
    waypoints: [
      { label: "Lukla", x:6, y:74 }, { label: "Namche", x:26, y:58 },
      { label: "Thame", x:46, y:46 }, { label: "Renjo La", x:64, y:22 },
      { label: "Gokyo", x:82, y:32 }, { label: "Namche", x:92, y:58 },
    ],
    mountains: [{ label: "Cho Oyu 8,188m", x:68, y:8 }],
  },
  {
    id: "everest-view", region: "everest",
    name: "Everest View Trek",
    tagline: "Shorter, easier alternative in lower Khumbu",
    district: "Solukhumbu", days: "5–7 days", difficulty: "Easy",
    maxElevation: "3,880 m", season: "Year-round",
    href: "/districts/solukhumbu", color: "#0ea5e9", lightColor: "#e0f2fe", emoji: "👁️",
    restricted: false,
    waypoints: [
      { label: "Lukla", x:8, y:72 }, { label: "Phakding", x:30, y:64 },
      { label: "Namche", x:54, y:50 }, { label: "Khumjung", x:74, y:40 },
      { label: "Hotel Everest View", x:92, y:32 },
    ],
    mountains: [{ label: "Everest 8,849m", x:88, y:12 }],
  },
  {
    id: "pikey-peak", region: "everest",
    name: "Pikey Peak Trek",
    tagline: "Panoramic views famed by Sir Edmund Hillary",
    district: "Solukhumbu", days: "6–8 days", difficulty: "Moderate",
    maxElevation: "4,065 m", season: "Mar–May · Oct–Dec",
    href: "/districts/solukhumbu", color: "#1d4ed8", lightColor: "#dbeafe", emoji: "🌄",
    restricted: false,
    waypoints: [
      { label: "Salleri", x:8, y:76 }, { label: "Phaplu", x:28, y:64 },
      { label: "Junbesi", x:50, y:52 }, { label: "Pikey Peak", x:76, y:28 },
      { label: "Dhap", x:92, y:50 },
    ],
    mountains: [{ label: "Pikey Peak 4,065m", x:74, y:14 }],
  },

  // ── ANNAPURNA REGION ─────────────────────────────────────
  {
    id: "annapurna-circuit", region: "annapurna",
    name: "Annapurna Circuit",
    tagline: "Nepal's most diverse and dramatic loop trek",
    district: "Kaski / Manang", days: "15–20 days", difficulty: "Hard",
    maxElevation: "5,416 m", season: "Mar–May · Oct–Nov",
    href: "/districts/kaski", color: "#7c3aed", lightColor: "#ede9fe", emoji: "🔄",
    restricted: false,
    waypoints: [
      { label: "Besisahar", x:6, y:76 }, { label: "Chame", x:24, y:60 },
      { label: "Manang", x:42, y:46 }, { label: "Thorong La", x:56, y:20 },
      { label: "Muktinath", x:70, y:38 }, { label: "Jomsom", x:82, y:50 },
      { label: "Pokhara", x:93, y:72 },
    ],
    mountains: [{ label: "Annapurna I 8,091m", x:46, y:8 }],
  },
  {
    id: "abc", region: "annapurna",
    name: "Annapurna Base Camp",
    tagline: "Into the steep Annapurna Sanctuary amphitheatre",
    district: "Kaski", days: "10–13 days", difficulty: "Moderate",
    maxElevation: "4,130 m", season: "Mar–May · Oct–Nov",
    href: "/districts/kaski", color: "#6d28d9", lightColor: "#ede9fe", emoji: "🏕️",
    restricted: false,
    waypoints: [
      { label: "Pokhara", x:6, y:76 }, { label: "Nayapul", x:22, y:68 },
      { label: "Chhomrong", x:44, y:50 }, { label: "MBC", x:68, y:34 },
      { label: "ABC", x:86, y:22 },
    ],
    mountains: [{ label: "Machhapuchhre 6,993m", x:72, y:8 }],
  },
  {
    id: "poonhill", region: "annapurna",
    name: "Ghorepani Poon Hill",
    tagline: "Best sunrise panorama over the Annapurna range",
    district: "Myagdi", days: "4–5 days", difficulty: "Easy",
    maxElevation: "3,210 m", season: "Year-round",
    href: "/districts/myagdi", color: "#d97706", lightColor: "#fef3c7", emoji: "🌅",
    restricted: false,
    waypoints: [
      { label: "Nayapul", x:8, y:80 }, { label: "Ulleri", x:28, y:58 },
      { label: "Ghorepani", x:50, y:40 }, { label: "Poon Hill", x:62, y:26 },
      { label: "Tadapani", x:76, y:44 }, { label: "Ghandruk", x:92, y:62 },
    ],
    mountains: [{ label: "Dhaulagiri 8,167m", x:40, y:10 }],
  },
  {
    id: "mardi-himal", region: "annapurna",
    name: "Mardi Himal Trek",
    tagline: "Popular ridge walk to Fishtail mountain's base",
    district: "Kaski", days: "6–8 days", difficulty: "Moderate",
    maxElevation: "4,500 m", season: "Mar–May · Oct–Nov",
    href: "/districts/kaski", color: "#a855f7", lightColor: "#f3e8ff", emoji: "🐟",
    restricted: false,
    waypoints: [
      { label: "Pokhara", x:8, y:78 }, { label: "Siding", x:28, y:62 },
      { label: "Low Camp", x:50, y:46 }, { label: "High Camp", x:70, y:30 },
      { label: "Mardi Base", x:90, y:20 },
    ],
    mountains: [{ label: "Machhapuchhre 6,993m", x:80, y:8 }],
  },
  {
    id: "khopra", region: "annapurna",
    name: "Khopra Ridge Trek",
    tagline: "Community lodge trek with massive panoramas",
    district: "Myagdi", days: "8–10 days", difficulty: "Moderate",
    maxElevation: "3,660 m", season: "Mar–May · Oct–Nov",
    href: "/districts/myagdi", color: "#c2410c", lightColor: "#ffedd5", emoji: "🏘️",
    restricted: false,
    waypoints: [
      { label: "Nayapul", x:8, y:78 }, { label: "Ghorepani", x:32, y:52 },
      { label: "Khopra", x:58, y:34 }, { label: "Khayer Lake", x:76, y:24 },
      { label: "Swanta", x:92, y:50 },
    ],
    mountains: [{ label: "Dhaulagiri 8,167m", x:52, y:8 }],
  },
  {
    id: "nar-phu", region: "annapurna",
    name: "Nar Phu Circuit",
    tagline: "Hidden Tibetan valleys with the Annapurna Circuit",
    district: "Manang", days: "18–22 days", difficulty: "Hard",
    maxElevation: "5,416 m", season: "Mar–May · Oct–Nov",
    href: "/districts/manang", color: "#7c3aed", lightColor: "#ede9fe", emoji: "🏯",
    restricted: true,
    waypoints: [
      { label: "Besisahar", x:6, y:76 }, { label: "Koto", x:24, y:60 },
      { label: "Nar", x:44, y:38 }, { label: "Phu", x:62, y:28 },
      { label: "Manang", x:78, y:46 }, { label: "Thorong La", x:92, y:20 },
    ],
    mountains: [{ label: "Annapurna III 7,555m", x:72, y:8 }],
  },
  {
    id: "sikleh", region: "annapurna",
    name: "Sikleh Tara Hill Trek",
    tagline: "Traditional Gurung village cultural trail",
    district: "Kaski", days: "5–7 days", difficulty: "Easy",
    maxElevation: "2,500 m", season: "Year-round",
    href: "/districts/kaski", color: "#65a30d", lightColor: "#ecfccb", emoji: "🏡",
    restricted: false,
    waypoints: [
      { label: "Pokhara", x:8, y:78 }, { label: "Sikleh", x:34, y:54 },
      { label: "Tara Hill", x:60, y:38 }, { label: "Ghachok", x:82, y:56 },
      { label: "Pokhara", x:92, y:78 },
    ],
    mountains: [{ label: "Machhapuchhre 6,993m", x:68, y:12 }],
  },

  // ── LANGTANG & HELAMBU ───────────────────────────────────
  {
    id: "langtang", region: "langtang",
    name: "Langtang Valley Trek",
    tagline: "The valley of glaciers, close to Kathmandu",
    district: "Rasuwa", days: "7–10 days", difficulty: "Moderate",
    maxElevation: "3,870 m", season: "Mar–May · Oct–Nov",
    href: "/districts/rasuwa", color: "#059669", lightColor: "#d1fae5", emoji: "🌿",
    restricted: false,
    waypoints: [
      { label: "Syabrubesi", x:8, y:78 }, { label: "Lama Hotel", x:28, y:62 },
      { label: "Langtang", x:52, y:44 }, { label: "Kyanjin", x:76, y:34 },
      { label: "Tsergo Ri", x:92, y:20 },
    ],
    mountains: [{ label: "Langtang Lirung 7,227m", x:70, y:8 }],
  },
  {
    id: "gosaikunda", region: "langtang",
    name: "Gosaikunda Trek",
    tagline: "Steep climb to sacred high-altitude alpine lakes",
    district: "Rasuwa", days: "7–9 days", difficulty: "Moderate",
    maxElevation: "4,380 m", season: "Mar–May · Sep–Nov",
    href: "/districts/rasuwa", color: "#0891b2", lightColor: "#cffafe", emoji: "🌊",
    restricted: false,
    waypoints: [
      { label: "Dhunche", x:8, y:76 }, { label: "Chandanbari", x:30, y:58 },
      { label: "Lauribina", x:54, y:36 }, { label: "Gosaikunda", x:74, y:24 },
      { label: "Helambu", x:92, y:52 },
    ],
    mountains: [{ label: "Gosaikunda 4,380m", x:70, y:10 }],
  },
  {
    id: "helambu", region: "langtang",
    name: "Helambu Trek",
    tagline: "Lower-altitude trail through Hyolmo culture",
    district: "Sindhupalchok", days: "5–7 days", difficulty: "Easy",
    maxElevation: "3,640 m", season: "Year-round",
    href: "/districts/sindhupalchok", color: "#16a34a", lightColor: "#dcfce7", emoji: "🏞️",
    restricted: false,
    waypoints: [
      { label: "Sundarijal", x:8, y:72 }, { label: "Chisapani", x:28, y:56 },
      { label: "Melamchi", x:52, y:46 }, { label: "Tarke Gyang", x:74, y:34 },
      { label: "Sermathang", x:92, y:44 },
    ],
    mountains: [{ label: "Dorje Lakpa 6,966m", x:60, y:10 }],
  },
  {
    id: "tamang", region: "langtang",
    name: "Tamang Heritage Trail",
    tagline: "Community-led cultural immersion in Langtang",
    district: "Rasuwa", days: "6–8 days", difficulty: "Easy",
    maxElevation: "3,200 m", season: "Year-round",
    href: "/districts/rasuwa", color: "#15803d", lightColor: "#dcfce7", emoji: "🎎",
    restricted: false,
    waypoints: [
      { label: "Syabrubesi", x:8, y:74 }, { label: "Gatlang", x:32, y:52 },
      { label: "Tatopani", x:56, y:44 }, { label: "Thuman", x:76, y:36 },
      { label: "Briddim", x:92, y:54 },
    ],
    mountains: [{ label: "Ganesh Himal 7,422m", x:50, y:10 }],
  },

  // ── RESTRICTED / WILDERNESS ──────────────────────────────
  {
    id: "manaslu", region: "restricted",
    name: "Manaslu Circuit",
    tagline: "Remote, raw Himalayan circuit — permit required",
    district: "Gorkha", days: "14–18 days", difficulty: "Hard",
    maxElevation: "5,160 m", season: "Mar–May · Sep–Nov",
    href: "/districts/gorkha", color: "#dc2626", lightColor: "#fee2e2", emoji: "🏕️",
    restricted: true,
    waypoints: [
      { label: "Arughat", x:8, y:78 }, { label: "Jagat", x:26, y:64 },
      { label: "Samagaon", x:48, y:46 }, { label: "Samdo", x:62, y:36 },
      { label: "Larkya La", x:74, y:20 }, { label: "Bimthang", x:90, y:42 },
    ],
    mountains: [{ label: "Manaslu 8,163m", x:56, y:8 }],
  },
  {
    id: "tsum", region: "restricted",
    name: "Tsum Valley Trek",
    tagline: "Deeply spiritual hidden Buddhist valley",
    district: "Gorkha", days: "18–22 days", difficulty: "Hard",
    maxElevation: "4,700 m", season: "Mar–May · Sep–Nov",
    href: "/districts/gorkha", color: "#b91c1c", lightColor: "#fee2e2", emoji: "🕉️",
    restricted: true,
    waypoints: [
      { label: "Arughat", x:8, y:78 }, { label: "Jagat", x:24, y:64 },
      { label: "Chhokangparo", x:46, y:46 }, { label: "Nile", x:66, y:32 },
      { label: "Mu Gompa", x:86, y:22 },
    ],
    mountains: [{ label: "Ganesh Himal 7,422m", x:74, y:8 }],
  },
  {
    id: "mustang", region: "restricted",
    name: "Upper Mustang Trek",
    tagline: "The forbidden kingdom beyond the Himalayas",
    district: "Mustang", days: "12–16 days", difficulty: "Moderate",
    maxElevation: "3,840 m", season: "May–Oct",
    href: "/districts/mustang", color: "#b45309", lightColor: "#fef3c7", emoji: "🏜️",
    restricted: true,
    waypoints: [
      { label: "Jomsom", x:8, y:72 }, { label: "Kagbeni", x:26, y:62 },
      { label: "Chele", x:44, y:50 }, { label: "Ghami", x:62, y:42 },
      { label: "Tsarang", x:78, y:36 }, { label: "Lo Manthang", x:92, y:30 },
    ],
    mountains: [{ label: "Nilgiri 7,061m", x:14, y:12 }],
  },
  {
    id: "dolpo", region: "restricted",
    name: "Upper Dolpo Trek",
    tagline: "Extremely remote — Phoksundo Lake & Shey Gompa",
    district: "Dolpa", days: "20–28 days", difficulty: "Hard",
    maxElevation: "5,200 m", season: "May–Oct",
    href: "/districts/dolpa", color: "#9a3412", lightColor: "#ffedd5", emoji: "🏔️",
    restricted: true,
    waypoints: [
      { label: "Juphal", x:8, y:74 }, { label: "Dunai", x:24, y:64 },
      { label: "Phoksundo Lake", x:48, y:44 }, { label: "Shey Gompa", x:70, y:30 },
      { label: "Saldang", x:90, y:38 },
    ],
    mountains: [{ label: "Kanjiroba 6,883m", x:60, y:8 }],
  },
  {
    id: "kanchenjunga", region: "restricted",
    name: "Kanchenjunga Base Camp",
    tagline: "Long expedition to Nepal's far eastern border",
    district: "Taplejung", days: "22–28 days", difficulty: "Hard",
    maxElevation: "5,143 m", season: "Mar–May · Sep–Nov",
    href: "/districts/taplejung", color: "#7f1d1d", lightColor: "#fee2e2", emoji: "🌏",
    restricted: true,
    waypoints: [
      { label: "Taplejung", x:8, y:76 }, { label: "Chirwa", x:24, y:64 },
      { label: "Ghunsa", x:46, y:46 }, { label: "Pangpema", x:72, y:24 },
      { label: "South BC", x:88, y:30 },
    ],
    mountains: [{ label: "Kanchenjunga 8,586m", x:80, y:8 }],
  },
  {
    id: "makalu", region: "restricted",
    name: "Makalu Base Camp",
    tagline: "Pristine low-traffic route in the Barun valley",
    district: "Sankhuwasabha", days: "18–22 days", difficulty: "Hard",
    maxElevation: "4,870 m", season: "Mar–May · Sep–Nov",
    href: "/districts/sankhuwasabha", color: "#991b1b", lightColor: "#fee2e2", emoji: "⛰️",
    restricted: false,
    waypoints: [
      { label: "Num", x:8, y:74 }, { label: "Seduwa", x:26, y:62 },
      { label: "Tashigaon", x:46, y:48 }, { label: "Barun Valley", x:68, y:32 },
      { label: "Makalu BC", x:90, y:20 },
    ],
    mountains: [{ label: "Makalu 8,485m", x:82, y:8 }],
  },
  {
    id: "dhaulagiri", region: "restricted",
    name: "Round Dhaulagiri Trek",
    tagline: "Technical expedition traversing massive glaciers",
    district: "Myagdi", days: "18–22 days", difficulty: "Hard",
    maxElevation: "5,360 m", season: "Mar–May · Sep–Nov",
    href: "/districts/myagdi", color: "#dc2626", lightColor: "#fee2e2", emoji: "🧊",
    restricted: false,
    waypoints: [
      { label: "Beni", x:6, y:76 }, { label: "Muri", x:22, y:62 },
      { label: "Italian BC", x:42, y:38 }, { label: "French Pass", x:60, y:22 },
      { label: "Dhaulagiri BC", x:76, y:30 }, { label: "Beni", x:92, y:76 },
    ],
    mountains: [{ label: "Dhaulagiri 8,167m", x:64, y:8 }],
  },
  {
    id: "rolwaling", region: "restricted",
    name: "Rolwaling Trek",
    tagline: "Remote valley walk under Gauri Shankar",
    district: "Dolakha", days: "16–20 days", difficulty: "Hard",
    maxElevation: "5,755 m", season: "Mar–May · Sep–Nov",
    href: "/districts/dolakha", color: "#1e3a5f", lightColor: "#dbeafe", emoji: "🌌",
    restricted: true,
    waypoints: [
      { label: "Charikot", x:8, y:76 }, { label: "Simigaun", x:28, y:60 },
      { label: "Beding", x:50, y:44 }, { label: "Tsho Rolpa", x:68, y:32 },
      { label: "Tashi Lapcha", x:84, y:20 },
    ],
    mountains: [{ label: "Gauri Shankar 7,134m", x:56, y:8 }],
  },
  {
    id: "humla", region: "restricted",
    name: "Humla Limi Valley Trek",
    tagline: "Ancient trading route on the far NW Tibetan border",
    district: "Humla", days: "18–24 days", difficulty: "Hard",
    maxElevation: "4,800 m", season: "May–Oct",
    href: "/districts/humla", color: "#7e22ce", lightColor: "#f3e8ff", emoji: "🐪",
    restricted: true,
    waypoints: [
      { label: "Simikot", x:8, y:72 }, { label: "Kermi", x:26, y:60 },
      { label: "Tumkot", x:48, y:46 }, { label: "Limi Valley", x:70, y:32 },
      { label: "Til", x:90, y:38 },
    ],
    mountains: [{ label: "Saipal 7,031m", x:34, y:10 }],
  },
];

const DIFFICULTY_STYLE = {
  Easy:     { bg: "#dcfce7", color: "#15803d" },
  Moderate: { bg: "#fef9c3", color: "#a16207" },
  Hard:     { bg: "#fee2e2", color: "#dc2626" },
};

/* ── Mini Route SVG ────────────────────────────────────── */
function MiniRoute({ trek }) {
  const pts = trek.waypoints;
  const pathD = pts.map((p, i) => {
    const px = (p.x / 100) * 280 + 10;
    const py = (p.y / 100) * 50 + 6;
    if (i === 0) return `M ${px} ${py}`;
    const prev = pts[i - 1];
    const ppx = (prev.x / 100) * 280 + 10, ppy = (prev.y / 100) * 50 + 6;
    return `C ${ppx + (px - ppx) * 0.5} ${ppy} ${ppx + (px - ppx) * 0.5} ${py} ${px} ${py}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 300 66" style={{ width: "100%", height: 66, display: "block" }} aria-hidden="true">
      <defs>
        <linearGradient id={`ms-${trek.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trek.lightColor} />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
      </defs>
      <rect width="300" height="66" fill={`url(#ms-${trek.id})`} />
      <polygon points="0,66 0,44 55,30 110,18 165,26 215,14 265,22 300,28 300,66" fill="rgba(148,163,184,0.14)" />
      <path d={pathD} fill="none" stroke={trek.color} strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      {[pts[0], pts[pts.length - 1]].map((p, i) => (
        <circle key={i} cx={(p.x / 100) * 280 + 10} cy={(p.y / 100) * 50 + 6} r="4" fill="#fff" stroke={trek.color} strokeWidth="1.5" />
      ))}
      {pts.slice(1, -1).map((p, i) => (
        <circle key={i} cx={(p.x / 100) * 280 + 10} cy={(p.y / 100) * 50 + 6} r="2.2" fill={trek.color} opacity="0.5" />
      ))}
      <text x={(pts[0].x / 100) * 280 + 10} y={62} fontSize="7.5" fill={trek.color} textAnchor="middle" fontWeight="700">{pts[0].label}</text>
      <text x={(pts[pts.length - 1].x / 100) * 280 + 10} y={62} fontSize="7.5" fill={trek.color} textAnchor="middle" fontWeight="700">{pts[pts.length - 1].label}</text>
    </svg>
  );
}

/* ── Full Route SVG (modal) ────────────────────────────── */
function FullRoute({ trek }) {
  const h = 140, pts = trek.waypoints;
  const pathD = pts.map((p, i) => {
    const px = (p.x / 100) * 280 + 10, py = (p.y / 100) * (h - 24) + 12;
    if (i === 0) return `M ${px} ${py}`;
    const prev = pts[i - 1];
    const ppx = (prev.x / 100) * 280 + 10, ppy = (prev.y / 100) * (h - 24) + 12;
    return `C ${ppx + (px - ppx) * 0.5} ${ppy} ${ppx + (px - ppx) * 0.5} ${py} ${px} ${py}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 300 ${h}`} style={{ width: "100%", height: h, display: "block" }} aria-hidden="true">
      <defs>
        <linearGradient id={`fs-${trek.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trek.lightColor} /><stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
        <linearGradient id={`fr-${trek.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={trek.color} stopOpacity="0.5" /><stop offset="100%" stopColor={trek.color} />
        </linearGradient>
      </defs>
      <rect width="300" height={h} fill={`url(#fs-${trek.id})`} />
      <polygon points={`0,${h} 0,${h*0.62} 55,${h*0.46} 110,${h*0.32} 160,${h*0.22} 205,${h*0.30} 245,${h*0.20} 280,${h*0.28} 300,${h*0.34} 300,${h}`} fill="rgba(148,163,184,0.18)" />
      <polygon points={`0,${h} 0,${h*0.70} 70,${h*0.54} 135,${h*0.40} 180,${h*0.50} 225,${h*0.38} 270,${h*0.45} 300,${h*0.52} 300,${h}`} fill="rgba(148,163,184,0.10)" />
      {trek.mountains.map(m => (
        <text key={m.label} x={(m.x / 100) * 280 + 10} y={(m.y / 100) * (h - 24) + 12} fontSize="6.5" fill={trek.color} textAnchor="middle" fontWeight="600" opacity="0.8">{m.label}</text>
      ))}
      <path d={pathD} fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="4" strokeLinecap="round" />
      <path d={pathD} fill="none" stroke={`url(#fr-${trek.id})`} strokeWidth="2.5" strokeLinecap="round" />
      {pts.map((p, i) => {
        const px = (p.x / 100) * 280 + 10, py = (p.y / 100) * (h - 24) + 12;
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

/* ── Trek Modal ────────────────────────────────────────── */
function TrekModal({ trek, onClose }) {
  const diff = DIFFICULTY_STYLE[trek.difficulty];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 101, background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e2e8f0" }} />
        </div>
        {/* Close */}
        <button onClick={onClose} aria-label="Close"
          style={{ position: "absolute", top: 14, right: 16, width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Route map */}
        <div style={{ background: trek.lightColor, margin: "4px 16px 0", borderRadius: 16, overflow: "hidden" }}>
          <FullRoute trek={trek} />
        </div>

        <div style={{ padding: "16px 20px 36px" }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 18 }}>{trek.emoji}</span>
                <h2 style={{ fontSize: 19, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>{trek.name}</h2>
              </div>
              <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{trek.tagline}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: diff.bg, color: diff.color, borderRadius: 999, padding: "4px 10px" }}>{trek.difficulty}</span>
              {trek.restricted && (
                <span style={{ fontSize: 10, fontWeight: 700, background: "#fef9c3", color: "#a16207", borderRadius: 999, padding: "3px 8px" }}>🔒 Permit Required</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "14px 0" }}>
            {[
              { icon: "🏔️", label: "Max Alt",  value: trek.maxElevation },
              { icon: "📅",  label: "Duration", value: trek.days         },
              { icon: "🌤️", label: "Season",   value: trek.season       },
            ].map(s => (
              <div key={s.label} style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                <p style={{ fontSize: 16, marginBottom: 3 }}>{s.icon}</p>
                <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{s.label}</p>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Waypoints trail */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Trail Route</p>
            <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 4 }}>
              {trek.waypoints.map((wp, i) => (
                <div key={wp.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: i === 0 || i === trek.waypoints.length - 1 ? 11 : 8, height: i === 0 || i === trek.waypoints.length - 1 ? 11 : 8, borderRadius: "50%", background: i === 0 || i === trek.waypoints.length - 1 ? trek.color : "#fff", border: `2px solid ${trek.color}` }} />
                    <span style={{ fontSize: 9, color: "#475569", fontWeight: i === 0 || i === trek.waypoints.length - 1 ? 700 : 500, whiteSpace: "nowrap" }}>{wp.label}</span>
                  </div>
                  {i < trek.waypoints.length - 1 && <div style={{ width: 20, height: 2, background: `${trek.color}35`, marginBottom: 14, flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>

          <Link href={trek.href} style={{ display: "block", textAlign: "center", background: trek.color, color: "#fff", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Explore {trek.district} District →
          </Link>
        </div>
      </div>
    </>
  );
}

/* ── Main Component ────────────────────────────────────── */
export default function TrekkingClient() {
  const [activeRegion, setActiveRegion] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = activeRegion === "all" ? TREKS : TREKS.filter(t => t.region === activeRegion);

  return (
    <div style={{ padding: "10px 0 48px" }}>

      {/* ── REGION FILTER TABS ─────────────────────────── */}
      <div style={{ overflowX: "auto", paddingBottom: 2 }}>
        <div style={{ display: "flex", gap: 8, padding: "0 20px", minWidth: "max-content" }}>
          {REGIONS.map(r => {
            const isActive = activeRegion === r.id;
            return (
              <button key={r.id} onClick={() => setActiveRegion(r.id)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 999, border: "1.5px solid", borderColor: isActive ? "#059669" : "#e2e8f0", background: isActive ? "#059669" : "#fff", color: isActive ? "#fff" : "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 13 }}>{r.emoji}</span> {r.label}
                <span style={{ fontSize: 10, background: isActive ? "rgba(255,255,255,0.25)" : "#f1f5f9", borderRadius: 99, padding: "1px 6px", marginLeft: 2 }}>
                  {r.id === "all" ? TREKS.length : TREKS.filter(t => t.region === r.id).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TREK CARDS ─────────────────────────────────── */}
      <div style={{ padding: "14px 20px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(trek => {
          const d = DIFFICULTY_STYLE[trek.difficulty];
          return (
            <button key={trek.id} onClick={() => setSelected(trek)}
              style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 18, padding: 0, overflow: "hidden", textAlign: "left", cursor: "pointer", boxShadow: "0 2px 12px rgba(15,23,42,0.06)", width: "100%" }}>
              {/* Mini route */}
              <div style={{ background: trek.lightColor, padding: "10px 12px 2px" }}>
                <MiniRoute trek={trek} />
              </div>
              {/* Info */}
              <div style={{ padding: "10px 14px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14 }}>{trek.emoji}</span>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trek.name}</p>
                    {trek.restricted && <span style={{ fontSize: 9, background: "#fef9c3", color: "#92400e", borderRadius: 99, padding: "1px 5px", fontWeight: 700, flexShrink: 0 }}>PERMIT</span>}
                  </div>
                  <p style={{ fontSize: 11, color: "#6b7280" }}>{trek.district} · {trek.days}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: d.bg, color: d.color, borderRadius: 999, padding: "3px 9px" }}>{trek.difficulty}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{trek.maxElevation}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── CTA ────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center", padding: "0 20px" }}>
        <Link href="/districts" style={{ background: "#059669", color: "#fff", borderRadius: 999, padding: "9px 18px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
          Browse Districts
        </Link>
        <Link href="/allplaces" style={{ background: "#fff", border: "1.5px solid #e2e8f0", color: "#0f172a", borderRadius: 999, padding: "9px 18px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
          All Places
        </Link>
      </div>

      {/* ── MODAL ──────────────────────────────────────── */}
      {selected && <TrekModal trek={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
