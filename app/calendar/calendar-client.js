"use client";

import { useState, useMemo } from "react";

/* ─────────────────────────────────────────────────────────────
   BS MONTH LENGTH TABLE  (extracted from nepali-date-converter)
   Epoch: BS 2070 Baisakh 1 = AD April 13, 2013
───────────────────────────────────────────────────────────── */
const EPOCH_AD = new Date(2013, 3, 14); // April 14, 2013 (BS 2070 Baisakh 1)
const EPOCH_BS_YEAR = 2070;

const BS_DATA = {
  2070:[31,31,31,32,31,31,29,30,30,29,30,30],
  2071:[31,31,32,31,31,31,30,29,30,29,30,30],
  2072:[31,32,31,32,31,30,30,29,30,29,30,30],
  2073:[31,32,31,32,31,30,30,30,29,29,30,31],
  2074:[31,31,31,32,31,31,30,29,30,29,30,30],
  2075:[31,31,32,31,31,31,30,29,30,29,30,30],
  2076:[31,32,31,32,31,30,30,30,29,29,30,30],
  2077:[31,32,31,32,31,30,30,30,29,30,29,31],
  2078:[31,31,31,32,31,31,30,29,30,29,30,30],
  2079:[31,31,32,31,31,31,30,29,30,29,30,30],
  2080:[31,32,31,32,31,30,30,30,29,29,30,30],
  2081:[31,32,31,32,31,30,30,30,29,30,29,31],
  2082:[31,31,32,31,31,31,30,29,30,29,30,30],
  2083:[31,31,32,31,31,31,30,29,30,29,30,30],
  2084:[31,32,31,32,31,30,30,30,29,29,30,31],
  2085:[30,32,31,32,31,30,30,30,29,30,29,31],
  2086:[31,31,32,31,31,31,30,29,30,29,30,30],
  2087:[31,31,32,31,31,31,30,30,29,30,30,30],
  2088:[30,31,32,32,30,31,30,30,29,30,30,30],
  2089:[30,32,31,32,31,30,30,30,29,30,30,30],
  2090:[30,32,31,32,31,30,30,30,29,30,30,30],
};

const MIN_BS_YEAR = 2070;
const MAX_BS_YEAR = 2089; // 2090 Chaitra needs year 2091 data we don't have

/* ─────────────────────────────────────────────────────────────
   STATIC LABELS
───────────────────────────────────────────────────────────── */
const BS_MONTHS = [
  "Baisakh","Jestha","Ashadh","Shrawan",
  "Bhadra","Ashwin","Kartik","Mangsir",
  "Poush","Magh","Falgun","Chaitra",
];
const BS_MONTHS_NP = [
  "बैशाख","जेठ","असार","साउन",
  "भदौ","असोज","कार्तिक","मंसिर",
  "पुष","माघ","फाल्गुन","चैत",
];
const AD_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/* ─────────────────────────────────────────────────────────────
   NEPAL PUBLIC HOLIDAYS  (keyed by AD date YYYY-MM-DD)
───────────────────────────────────────────────────────────── */
const HOLIDAYS = {
  // ── BS 2082 (2025) ───────────────────────────────────────
  "2025-04-14": { name: "Nepali New Year (2082 BS)",        emoji: "🎆", type: "public"   },
  "2025-05-01": { name: "International Labour Day",         emoji: "⚒️", type: "public"  },
  "2025-05-12": { name: "Buddha Jayanti",                   emoji: "☸️", type: "public"   },
  "2025-05-29": { name: "Republic Day",                     emoji: "🇳🇵", type: "public"  },
  "2025-07-28": { name: "Janai Purnima / Raksha Bandhan",   emoji: "🪢", type: "festival" },
  "2025-08-16": { name: "Haritalika Teej",                  emoji: "💃", type: "festival" },
  "2025-09-07": { name: "Indra Jatra",                      emoji: "🎪", type: "festival" },
  "2025-09-19": { name: "Constitution Day",                 emoji: "📜", type: "public"   },
  "2025-10-02": { name: "Ghatasthapana (Dashain begins)",   emoji: "🪔", type: "public"   },
  "2025-10-12": { name: "Vijaya Dashami (Dashain)",         emoji: "🎊", type: "public"   },
  "2025-10-20": { name: "Dhanteras",                        emoji: "✨", type: "festival" },
  "2025-10-22": { name: "Laxmi Puja (Tihar)",               emoji: "🪔", type: "public"   },
  "2025-10-24": { name: "Bhai Tika",                        emoji: "🌺", type: "public"   },
  "2025-10-28": { name: "Chhath Puja",                      emoji: "🌅", type: "festival" },
  "2026-01-01": { name: "New Year (AD 2026)",               emoji: "🎉", type: "festival" },
  "2026-01-11": { name: "Prithvi Narayan Shah Jayanti",     emoji: "👑", type: "public"   },
  "2026-01-14": { name: "Maghe Sankranti",                  emoji: "🌞", type: "festival" },
  "2026-02-18": { name: "Maha Shivaratri",                  emoji: "🕉️", type: "public"  },
  "2026-02-19": { name: "Democracy Day",                    emoji: "🗳️", type: "public"  },
  "2026-03-03": { name: "Holi (Hills)",                     emoji: "🌈", type: "festival" },
  "2026-03-04": { name: "Fagu Purnima / Holi (Terai)",      emoji: "🌈", type: "public"   },
  "2026-03-29": { name: "Ram Navami",                       emoji: "🪔", type: "festival" },
  // ── BS 2083 (Apr 2026 – Apr 2027) ────────────────────────
  "2026-04-14": { name: "Nepali New Year (2083 BS)",        emoji: "🎆", type: "public"   },
  "2026-05-01": { name: "International Labour Day",         emoji: "⚒️", type: "public"  },
  "2026-05-27": { name: "Buddha Jayanti",                   emoji: "☸️", type: "public"   },
  "2026-05-29": { name: "Republic Day",                     emoji: "🇳🇵", type: "public"  },
  "2026-08-09": { name: "Janai Purnima / Raksha Bandhan",   emoji: "🪢", type: "festival" },
  "2026-09-04": { name: "Haritalika Teej",                  emoji: "💃", type: "festival" },
  "2026-09-08": { name: "Indra Jatra",                      emoji: "🎪", type: "festival" },
  "2026-09-19": { name: "Constitution Day",                 emoji: "📜", type: "public"   },
  "2026-09-21": { name: "Ghatasthapana (Dashain begins)",   emoji: "🪔", type: "public"   },
  "2026-10-01": { name: "Vijaya Dashami (Dashain)",         emoji: "🎊", type: "public"   },
  "2026-10-09": { name: "Dhanteras",                        emoji: "✨", type: "festival" },
  "2026-10-11": { name: "Laxmi Puja (Tihar)",               emoji: "🪔", type: "public"   },
  "2026-10-13": { name: "Bhai Tika",                        emoji: "🌺", type: "public"   },
  "2026-10-17": { name: "Chhath Puja",                      emoji: "🌅", type: "festival" },
  "2027-01-01": { name: "New Year (AD 2027)",               emoji: "🎉", type: "festival" },
  "2027-01-11": { name: "Prithvi Narayan Shah Jayanti",     emoji: "👑", type: "public"   },
  "2027-01-14": { name: "Maghe Sankranti",                  emoji: "🌞", type: "festival" },
  "2027-02-06": { name: "Maha Shivaratri",                  emoji: "🕉️", type: "public"  },
  "2027-02-19": { name: "Democracy Day",                    emoji: "🗳️", type: "public"  },
  "2027-03-22": { name: "Holi (Hills)",                     emoji: "🌈", type: "festival" },
  "2027-03-23": { name: "Fagu Purnima / Holi (Terai)",      emoji: "🌈", type: "public"   },
  "2027-04-06": { name: "Ram Navami",                       emoji: "🪔", type: "festival" },
  "2027-04-14": { name: "Nepali New Year (2084 BS)",        emoji: "🎆", type: "public"   },
};

const HOLIDAY_STYLE = {
  public:   { bg: "#fee2e2", border: "#fca5a5", dot: "#ef4444", badge: "#b91c1c" },
  festival: { bg: "#fef9c3", border: "#fde047", dot: "#eab308", badge: "#854d0e" },
};

/* ─────────────────────────────────────────────────────────────
   PURE-JS CONVERTERS  (no external library)
───────────────────────────────────────────────────────────── */
function daysInBSMonth(year, month) {
  return (BS_DATA[year] || BS_DATA[MAX_BS_YEAR])[month] || 30;
}

// BS (year, month 0-based, day) → JS Date
function bsToAD(bsYear, bsMonth0, bsDay) {
  let days = 0;
  for (let y = EPOCH_BS_YEAR; y < bsYear; y++) {
    const row = BS_DATA[y];
    if (!row) break;
    days += row.reduce((a, b) => a + b, 0);
  }
  const row = BS_DATA[bsYear];
  if (row) {
    for (let m = 0; m < bsMonth0; m++) days += row[m];
  }
  days += bsDay - 1;
  const d = new Date(EPOCH_AD);
  d.setDate(EPOCH_AD.getDate() + days);
  return d;
}

// JS Date → { year, month (0-based), day }
function adToBS(jsDate) {
  const ms   = new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate()).getTime();
  const base = new Date(EPOCH_AD.getFullYear(), EPOCH_AD.getMonth(), EPOCH_AD.getDate()).getTime();
  let diff   = Math.round((ms - base) / 86400000);

  let year = EPOCH_BS_YEAR, month = 0;
  const years = Object.keys(BS_DATA).map(Number).sort((a, b) => a - b);
  for (const y of years) {
    const total = BS_DATA[y].reduce((a, b) => a + b, 0);
    if (diff < total) { year = y; break; }
    diff -= total;
  }
  const row = BS_DATA[year];
  for (let m = 0; m < 12; m++) {
    if (diff < row[m]) { month = m; break; }
    diff -= row[m];
  }
  return { year, month, day: diff + 1 };
}

function getTodayBS() {
  return adToBS(new Date());
}

// Convert ASCII digits to Nepali (Devanagari) digits
function np(n) {
  return String(n).replace(/[0-9]/g, d => "०१२३४५६७८९"[d]);
}

function adKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function buildCells(bsYear, bsMonth0) {
  const total   = daysInBSMonth(bsYear, bsMonth0);
  const firstAD = bsToAD(bsYear, bsMonth0, 1);
  const startDow = firstAD.getDay();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= total; d++) {
    const ad = new Date(firstAD);
    ad.setDate(firstAD.getDate() + d - 1);
    cells.push({ bsDay: d, ad });
  }
  return cells;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function CalendarClient() {
  const todayBS = useMemo(() => getTodayBS(), []);

  const [bsYear,  setBsYear]  = useState(todayBS.year);
  const [bsMonth, setBsMonth] = useState(todayBS.month);
  const [view,    setView]    = useState("bs");

  const cells = useMemo(() => buildCells(bsYear, bsMonth), [bsYear, bsMonth]);

  const firstAD = useMemo(() => bsToAD(bsYear, bsMonth, 1), [bsYear, bsMonth]);
  const lastAD  = useMemo(() => {
    const d = new Date(firstAD);
    d.setDate(firstAD.getDate() + daysInBSMonth(bsYear, bsMonth) - 1);
    return d;
  }, [bsYear, bsMonth, firstAD]);

  const adLabel =
    firstAD.getMonth() === lastAD.getMonth()
      ? `${AD_MONTHS[firstAD.getMonth()]} ${firstAD.getFullYear()}`
      : `${AD_MONTHS[firstAD.getMonth()]} – ${AD_MONTHS[lastAD.getMonth()]} ${firstAD.getFullYear()}${firstAD.getFullYear() !== lastAD.getFullYear() ? ` / ${lastAD.getFullYear()}` : ""}`;

  const monthHolidays = useMemo(
    () => cells.filter(Boolean).map(c => ({ cell: c, holiday: HOLIDAYS[adKey(c.ad)] })).filter(x => x.holiday),
    [cells]
  );

  function prevMonth() {
    if (bsMonth === 0) {
      if (bsYear <= MIN_BS_YEAR) return;
      setBsYear(y => y - 1); setBsMonth(11);
    } else setBsMonth(m => m - 1);
  }
  function nextMonth() {
    if (bsMonth === 11) {
      if (bsYear >= MAX_BS_YEAR) return;
      setBsYear(y => y + 1); setBsMonth(0);
    } else if (bsYear >= MAX_BS_YEAR && bsMonth >= 10) {
      return;
    } else setBsMonth(m => m + 1);
  }
  function goToday() { setBsYear(todayBS.year); setBsMonth(todayBS.month); }

  const isToday = (cell) =>
    cell.bsDay === todayBS.day && bsMonth === todayBS.month && bsYear === todayBS.year;

  return (
    <div style={{ paddingBottom: 48 }}>

      {/* ── CONTROLS ──────────────────────────────────────── */}
      <div style={{ padding: "16px 20px 0", display: "flex", flexDirection: "column", gap: 12 }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button onClick={prevMonth} aria-label="Previous month"
            style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(15,23,42,0.06)", flexShrink: 0 }}>
            ‹
          </button>

          <div style={{ textAlign: "center", flex: 1 }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {BS_MONTHS[bsMonth]} {np(bsYear)}
            </p>
            <p style={{ fontSize: 11, color: "#6b7280", marginTop: 3, fontWeight: 500 }}>
              {BS_MONTHS_NP[bsMonth]} &middot; {adLabel}
            </p>
          </div>

          <button onClick={nextMonth} aria-label="Next month"
            style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(15,23,42,0.06)", flexShrink: 0 }}>
            ›
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={goToday}
            style={{ flex: 1, height: 34, borderRadius: 10, border: "1.5px solid #d1fae5", background: "#ecfdf5", fontSize: 12, fontWeight: 700, color: "#059669", cursor: "pointer" }}>
            Today — {BS_MONTHS[todayBS.month]} {np(todayBS.day)}, {np(todayBS.year)} BS
          </button>
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 3, gap: 2, flexShrink: 0 }}>
            {["bs","ad"].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "5px 14px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: view === v ? "#fff" : "transparent", color: view === v ? "#0f172a" : "#94a3b8", boxShadow: view === v ? "0 1px 4px rgba(15,23,42,0.1)" : "none", transition: "all 0.15s" }}>
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── GRID ──────────────────────────────────────────── */}
      <div style={{ padding: "14px 10px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 3 }}>
          {WEEKDAYS.map((d, i) => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", padding: "5px 0", color: i === 6 ? "#dc2626" : i === 0 ? "#ea580c" : "#64748b" }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {cells.map((cell, idx) => {
            if (!cell) return <div key={`e-${idx}`} style={{ minHeight: 54 }} />;

            const dow     = cell.ad.getDay();
            const isSat   = dow === 6;
            const isSun   = dow === 0;
            const today   = isToday(cell);
            const key     = adKey(cell.ad);
            const holiday = HOLIDAYS[key];
            const hs      = holiday ? HOLIDAY_STYLE[holiday.type] : null;

            // Only TODAY gets a full background; holidays use a small dot only
            const bg     = today ? "#059669" : isSat ? "#fff1f2" : isSun ? "#fff7ed" : "#fff";
            const border = today ? "1.5px solid #047857" : isSat ? "1.5px solid #fecdd3" : isSun ? "1.5px solid #fed7aa" : "1.5px solid #f1f5f9";
            const primaryColor   = today ? "#fff" : isSat ? "#dc2626" : isSun ? "#ea580c" : "#0f172a";
            const secondaryColor = today ? "rgba(255,255,255,0.75)" : "#94a3b8";

            const primary   = view === "bs" ? np(cell.bsDay) : cell.ad.getDate();
            const secondary = view === "bs"
              ? `${AD_MONTHS[cell.ad.getMonth()].slice(0,3)} ${cell.ad.getDate()}`
              : `${BS_MONTHS[bsMonth].slice(0,3)} ${np(cell.bsDay)}`;

            return (
              <div key={key} style={{ background: bg, border, borderRadius: 10, padding: "6px 3px 5px", minHeight: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 1, position: "relative" }}>
                <span style={{ fontSize: 16, fontWeight: 900, lineHeight: 1, color: primaryColor }}>{primary}</span>
                <span style={{ fontSize: 9, fontWeight: 500, lineHeight: 1, color: secondaryColor, textAlign: "center" }}>{secondary}</span>
                {holiday && !today && (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: hs.dot, marginTop: 3, flexShrink: 0 }} />
                )}
                {today && (
                  <span style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: "0.05em", marginTop: 1 }}>TODAY</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LEGEND ────────────────────────────────────────── */}
      <div style={{ padding: "14px 20px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { color: "#059669", label: "Today"             },
          { color: "#ef4444", label: "Public Holiday"     },
          { color: "#eab308", label: "Festival"           },
          { color: "#dc2626", label: "Saturday (day off)" },
          { color: "#ea580c", label: "Sunday"             },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── THIS MONTH'S HOLIDAYS ─────────────────────────── */}
      {monthHolidays.length > 0 && (
        <div style={{ padding: "20px 20px 0" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2563eb", marginBottom: 10 }}>
            This Month
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {monthHolidays.map(({ cell, holiday }) => {
              const hs = HOLIDAY_STYLE[holiday.type];
              return (
                <div key={adKey(cell.ad)} style={{ background: hs.bg, border: `1.5px solid ${hs.border}`, borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{holiday.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{holiday.name}</p>
                    <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {BS_MONTHS[bsMonth]} {np(cell.bsDay)}, {np(bsYear)} BS &middot; {AD_MONTHS[cell.ad.getMonth()]} {cell.ad.getDate()}, {cell.ad.getFullYear()} AD
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: hs.badge, background: "#fff", borderRadius: 999, padding: "3px 8px", border: `1px solid ${hs.border}`, flexShrink: 0 }}>
                    {holiday.type === "public" ? "Holiday" : "Festival"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MONTH JUMP ────────────────────────────────────── */}
      <div style={{ padding: "20px 20px 0" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6b7280", marginBottom: 8 }}>
          Jump to Month
        </p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {BS_MONTHS.map((name, i) => {
            const disabled = bsYear >= MAX_BS_YEAR && i > 10;
            return (
              <button key={name} onClick={() => !disabled && setBsMonth(i)} disabled={disabled}
                style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid", borderColor: bsMonth === i ? "#059669" : "#e2e8f0", background: bsMonth === i ? "#059669" : disabled ? "#f8fafc" : "#fff", color: bsMonth === i ? "#fff" : disabled ? "#cbd5e1" : "#334155", fontSize: 11, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer" }}>
                {name}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
          {Array.from({ length: 10 }, (_, i) => todayBS.year - 2 + i)
            .filter(y => y >= MIN_BS_YEAR && y <= MAX_BS_YEAR)
            .map(y => (
              <button key={y} onClick={() => setBsYear(y)}
                style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid", borderColor: bsYear === y ? "#2563eb" : "#e2e8f0", background: bsYear === y ? "#2563eb" : "#fff", color: bsYear === y ? "#fff" : "#334155", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {np(y)}
              </button>
            ))}
        </div>
      </div>

    </div>
  );
}
