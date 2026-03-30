"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, House, Plus, User } from "lucide-react";

const LEFT_ITEMS = [
  { href: "/", label: "Home", icon: House },
  { href: "/explore", label: "Explore", icon: Compass },
];

const RIGHT_ITEMS = [
  { href: "/favorites", label: "Saved", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const addActive = pathname === "/add";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full md:bottom-4 md:max-w-[620px] md:rounded-full md:shadow-[0_8px_36px_rgba(15,23,42,0.14)]"
      style={{
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(15,23,42,0.07)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: 62 }}>

        {/* Left items */}
        {LEFT_ITEMS.map(({ href, label, icon: Icon }) => (
          <NavTab key={href} href={href} label={label} active={pathname === href}>
            <Icon size={20} strokeWidth={pathname === href ? 2.5 : 2} />
          </NavTab>
        ))}

        {/* ── ADD BUTTON (center) ──────────────────────────── */}
        <div style={{ flex: "0 0 60px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Link
            href="/add"
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: addActive
                ? "linear-gradient(135deg, #047857 0%, #059669 100%)"
                : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              textDecoration: "none",
              border: "2.5px solid #fff",
              boxShadow: addActive
                ? "0 2px 10px rgba(5,150,105,0.3), 0 0 0 3px rgba(5,150,105,0.12)"
                : "0 6px 22px rgba(5,150,105,0.45), 0 0 0 3px rgba(255,255,255,0.9)",
              transform: addActive ? "scale(0.95)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
            aria-label="Add a place"
          >
            <Plus size={18} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Right items */}
        {RIGHT_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <NavTab key={href} href={href} label={label} active={active}>
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 2}
                fill={active && href === "/favorites" ? "currentColor" : "none"}
              />
            </NavTab>
          );
        })}

      </div>
    </nav>
  );
}

function NavTab({ href, label, active, children }) {
  return (
    <Link
      href={href}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        textDecoration: "none",
        color: active ? "#059669" : "#94a3b8",
        padding: "6px 2px",
        transition: "color 0.15s ease",
      }}
    >
      <span style={{
        width: 38,
        height: 28,
        borderRadius: 10,
        background: active ? "#ecfdf5" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s ease",
      }}>
        {children}
      </span>
      <span style={{
        fontSize: 10,
        fontWeight: active ? 700 : 500,
        letterSpacing: "0.01em",
        lineHeight: 1,
      }}>
        {label}
      </span>
    </Link>
  );
}
