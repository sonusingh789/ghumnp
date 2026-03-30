"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",         label: "Dashboard" },
  { href: "/admin/pending", label: "Pending"   },
  { href: "/admin/places",  label: "Places"    },
  { href: "/admin/users",   label: "Users"     },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Top bar */}
      <div style={{ background: "#0f172a", padding: "0 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <Link href="/admin" style={{ color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none", letterSpacing: "-0.01em" }}>
            visitNepal77 <span style={{ color: "#34d399", fontWeight: 600 }}>Admin</span>
          </Link>
          <Link href="/" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}>
            ← Back to site
          </Link>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", overflowX: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", padding: "0 20px" }}>
          {NAV.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "14px 16px",
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#0f172a" : "#64748b",
                  textDecoration: "none",
                  borderBottom: active ? "2px solid #059669" : "2px solid transparent",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 80px" }}>
        {children}
      </div>
    </div>
  );
}
