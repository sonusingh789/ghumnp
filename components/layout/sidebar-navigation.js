"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Compass, Heart, House, Map, Plus, Trophy, User } from "lucide-react";

const PRIMARY_NAV = [
  { href: "/",          label: "Home",       icon: House   },
  { href: "/explore",   label: "Explore",    icon: Compass },
  { href: "/districts", label: "Districts",  icon: Map     },
  { href: "/favorites", label: "Saved",      icon: Heart   },
];

const SECONDARY_NAV = [
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile",     label: "Profile",     icon: User   },
];

export default function SidebarNavigation() {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className="hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen w-[260px]"
      style={{
        background: "rgba(255,255,255,0.98)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(15,23,42,0.07)",
        zIndex: 40,
        boxShadow: "1px 0 12px rgba(15,23,42,0.04)",
      }}
    >
      {/* ── Logo / Brand ─────────────────────────────────────── */}
      <Link
        href="/"
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px 16px 2px",
            borderBottom: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ width: 180, height: 90, position: "relative" }}>
            <Image
              src="/logo.png"
              alt="visitNepal77"
              fill
              sizes="180px"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>
      </Link>

      {/* ── Primary navigation ───────────────────────────────── */}
      <nav style={{ flex: 1, padding: "14px 12px 0", overflowY: "auto" }}>
        <div style={{ marginBottom: 4 }}>
          <p style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#94a3b8",
            padding: "0 8px",
            marginBottom: 6,
          }}>
            Discover
          </p>
          {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <NavLink key={href} href={href} label={label} active={active}>
                <Icon
                  size={17}
                  strokeWidth={active ? 2.5 : 2}
                  fill={active && href === "/favorites" ? "currentColor" : "none"}
                />
              </NavLink>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(15,23,42,0.06)", margin: "10px 8px 14px" }} />

        <div>
          <p style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#94a3b8",
            padding: "0 8px",
            marginBottom: 6,
          }}>
            Community
          </p>
          {SECONDARY_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <NavLink key={href} href={href} label={label} active={active}>
                <Icon size={17} strokeWidth={active ? 2.5 : 2} />
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── Add a Place CTA ──────────────────────────────────── */}
      <div style={{ padding: "14px 14px 20px", borderTop: "1px solid rgba(15,23,42,0.06)" }}>
        <Link
          href="/add"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 16px",
            borderRadius: 14,
            background: pathname === "/add"
              ? "linear-gradient(135deg, #047857 0%, #059669 100%)"
              : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(5,150,105,0.35)",
            transition: "box-shadow 0.2s, transform 0.15s",
          }}
          className="hover:scale-[1.02] hover:shadow-[0_8px_26px_rgba(5,150,105,0.45)]"
        >
          <Plus size={16} strokeWidth={2.8} />
          Add a Place
        </Link>
        <p style={{
          fontSize: 10,
          color: "#94a3b8",
          textAlign: "center",
          marginTop: 8,
          lineHeight: 1.4,
          fontWeight: 500,
        }}>
          Help others discover Nepal
        </p>
      </div>
    </aside>
  );
}

function NavLink({ href, label, active, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "9px 10px",
        borderRadius: 11,
        fontWeight: active ? 700 : 500,
        fontSize: 14,
        color: active ? "#059669" : "#475569",
        background: active
          ? "linear-gradient(90deg, rgba(5,150,105,0.1) 0%, rgba(5,150,105,0.05) 100%)"
          : "transparent",
        textDecoration: "none",
        transition: "background 0.15s, color 0.15s",
        marginBottom: 2,
        position: "relative",
      }}
    >
      {active && (
        <span style={{
          position: "absolute",
          left: 0, top: "50%",
          transform: "translateY(-50%)",
          width: 3, height: 20,
          background: "#059669",
          borderRadius: "0 3px 3px 0",
        }} />
      )}
      <span style={{ marginLeft: active ? 4 : 0, transition: "margin 0.15s", display: "flex" }}>
        {children}
      </span>
      {label}
    </Link>
  );
}
