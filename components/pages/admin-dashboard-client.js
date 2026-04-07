"use client";

import Link from "next/link";
import AdminShell from "@/components/layout/admin-shell";

const STAT_CARDS = [
  { key: "users",        label: "Total Users",     color: "#6366f1", bg: "#eef2ff" },
  { key: "reviews",      label: "Total Reviews",   color: "#0891b2", bg: "#ecfeff" },
  { key: "open_reports", label: "Open Reports",    color: "#dc2626", bg: "#fef2f2" },
];

const PLACE_CARDS = [
  { key: "total",    label: "All Places",      color: "#0f172a", bg: "#f8fafc", href: "/admin/places" },
  { key: "pending",  label: "Pending Review",  color: "#d97706", bg: "#fffbeb", href: "/admin/pending" },
  { key: "approved", label: "Approved",        color: "#059669", bg: "#ecfdf5", href: "/admin/places?status=approved" },
  { key: "rejected", label: "Rejected",        color: "#dc2626", bg: "#fef2f2", href: "/admin/places?status=rejected" },
];

const QUICK_ACTIONS = [
  { href: "/admin/pending",   label: "Review Pending Places",   desc: "Approve or reject submitted places",  color: "#d97706" },
  { href: "/admin/users",     label: "Manage Users",            desc: "View, ban, or promote users",         color: "#6366f1" },
  { href: "/admin/places",    label: "Browse All Places",       desc: "Search and filter all listings",      color: "#059669" },
  { href: "/admin/districts", label: "Featured Districts",      desc: "Choose which districts appear on home", color: "#0891b2" },
  { href: "/admin/reports",  label: "Reports & Suggestions",   desc: "Review flagged places and edit proposals", color: "#dc2626" },
];

export default function AdminDashboardClient({ stats }) {
  const places = stats.places || {};

  return (
    <AdminShell>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 4 }}>Admin</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>Overview of visitNepal77 platform</p>
      </div>

      {/* Place stats */}
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 10 }}>Places</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 24 }}>
        {PLACE_CARDS.map(({ key, label, color, bg, href }) => (
          <Link key={key} href={href} style={{ textDecoration: "none", background: bg, borderRadius: 16, padding: "16px", border: `1.5px solid ${color}22` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{places[key] ?? "—"}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginTop: 6 }}>{label}</div>
          </Link>
        ))}
      </div>

      {/* Other stats */}
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 10 }}>Community</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 32 }}>
        {STAT_CARDS.map(({ key, label, color, bg }) => (
          <div key={key} style={{ background: bg, borderRadius: 16, padding: "14px 12px", border: `1.5px solid ${color}22`, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{stats[key] ?? "—"}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginTop: 5 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 10 }}>Quick Actions</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {QUICK_ACTIONS.map(({ href, label, desc, color }) => (
          <Link key={href} href={href} style={{ textDecoration: "none", background: "#fff", borderRadius: 16, padding: "16px 18px", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 12, color: "#64748b" }}>{desc}</p>
            </div>
            <span style={{ fontSize: 18, color, fontWeight: 700, flexShrink: 0 }}>→</span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
