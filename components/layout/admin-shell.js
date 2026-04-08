"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",           label: "Dashboard",  icon: "⊞",  exact: true  },
  { href: "/admin/pending",   label: "Pending",    icon: "⏳", exact: false },
  { href: "/admin/places",    label: "Places",     icon: "🏛️", exact: false },
  { href: "/admin/districts", label: "Districts",  icon: "🗺️", exact: false },
  { href: "/admin/users",     label: "Users",      icon: "👤", exact: false },
  { href: "/admin/reports",   label: "Reports",    icon: "🚩", exact: false },
];

function isActive(pathname, href, exact) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminShell({ children }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <header style={{ background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#059669,#047857)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🏔️</div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "-0.01em" }}>
              visitNepal77
            </span>
            <span style={{ color: "#34d399", fontWeight: 700, fontSize: 11, background: "rgba(52,211,153,0.12)", borderRadius: 5, padding: "2px 7px", border: "1px solid rgba(52,211,153,0.2)" }}>
              Admin
            </span>
          </div>
          <Link href="/" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
            ← Live site
          </Link>
        </div>
      </header>

      {/* ── MOBILE TAB NAV ──────────────────────────────────── */}
      <div className="admin-mobile-nav" style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", overflowX: "auto", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", minWidth: "max-content", padding: "0 8px" }}>
          {NAV.map(({ href, label, icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link key={href} href={href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 12px", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "#059669" : "#64748b", textDecoration: "none", borderBottom: active ? "2px solid #059669" : "2px solid transparent", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── LAYOUT ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "flex-start" }}>

        {/* ── SIDEBAR (desktop) ─────────────────────────────── */}
        <aside className="admin-sidebar" style={{ width: 220, flexShrink: 0, padding: "28px 0 40px", position: "sticky", top: 54, height: "calc(100vh - 54px)", overflowY: "auto" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" }}>
            {NAV.map(({ href, label, icon, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#0f172a" : "#64748b", background: active ? "#fff" : "transparent", textDecoration: "none", boxShadow: active ? "0 1px 4px rgba(15,23,42,0.08), 0 0 0 1px #e2e8f0" : "none", borderLeft: `3px solid ${active ? "#059669" : "transparent"}`, transition: "all 0.15s" }}>
                  <span style={{ fontSize: 15, width: 20, textAlign: "center", lineHeight: 1 }}>{icon}</span>
                  {label}
                  {active && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#059669", flexShrink: 0 }} />}
                </Link>
              );
            })}
          </nav>
          <div style={{ padding: "24px 12px 0" }}>
            <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.1)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#059669", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>visitNepal77</p>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>Admin console</p>
            </div>
          </div>
        </aside>

        {/* Divider */}
        <div className="admin-sidebar-divider" style={{ width: 1, background: "#e2e8f0", alignSelf: "stretch", flexShrink: 0 }} />

        {/* ── MAIN CONTENT ────────────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0, padding: "28px 28px 80px" }}>
          {children}
        </main>
      </div>

      <style>{`
        .admin-sidebar { display: none; }
        .admin-sidebar-divider { display: none; }
        .admin-mobile-nav { display: block; }
        @media (min-width: 768px) {
          .admin-sidebar { display: flex !important; flex-direction: column; }
          .admin-sidebar-divider { display: block !important; }
          .admin-mobile-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
