"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import AdminShell from "@/components/layout/admin-shell";

const BADGE_STYLES = {
  explorer:    { bg: "#f1f5f9", text: "#475569" },
  contributor: { bg: "#eff6ff", text: "#1d4ed8" },
  local_guide: { bg: "#ecfdf5", text: "#065f46" },
  champion:    { bg: "#fffbeb", text: "#92400e" },
  pioneer:     { bg: "#faf5ff", text: "#6b21a8" },
};

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export default function AdminUsersClient({ initialUsers, initialTotal, initialPages }) {
  const [users, setUsers]       = useState(initialUsers);
  const [total, setTotal]       = useState(initialTotal);
  const [pages, setPages]       = useState(initialPages);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast]       = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function fetchUsers(q, p) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}&page=${p}`);
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((q) => fetchUsers(q, 1), 400), []);

  function handleSearch(e) {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  }

  async function handleAction(userId, action, label) {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed"); return; }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...data.user } : u));
      showToast(label);
    } catch {
      showToast("Error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  }

  return (
    <AdminShell>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 4 }}>Admin</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 4 }}>Users</h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>{total} registered user{total !== 1 ? "s" : ""}</p>
      </div>

      {toast ? (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 600 }}>
          {toast}
        </div>
      ) : null}

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={handleSearch}
        placeholder="Search by name or email..."
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", marginBottom: 16, boxSizing: "border-box", background: "#fff" }}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 14 }}>Loading...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((user) => {
            const badge = BADGE_STYLES[user.badge_level] || BADGE_STYLES.explorer;
            const busy = actionLoading[user.id];
            return (
              <div key={user.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{user.name}</p>
                      {user.role === "admin" && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: "#0f172a", color: "#34d399", borderRadius: 999, padding: "2px 8px", letterSpacing: "0.08em" }}>ADMIN</span>
                      )}
                      {!user.is_active && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: "#fef2f2", color: "#dc2626", borderRadius: 999, padding: "2px 8px" }}>BANNED</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{user.email}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "3px 10px", background: badge.bg, color: badge.text, flexShrink: 0 }}>
                    {user.badge_level}
                  </span>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  {[
                    { label: "Submitted", val: user.places_submitted },
                    { label: "Approved",  val: user.places_approved  },
                    { label: "Reviews",   val: user.total_reviews    },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>{val}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link
                    href={`/contributors/${user.id}`}
                    target="_blank"
                    style={{ fontSize: 12, fontWeight: 600, color: "#059669", padding: "6px 12px", borderRadius: 999, border: "1.5px solid #bbf7d0", background: "#f0fdf4", textDecoration: "none" }}
                  >
                    View Profile
                  </Link>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleAction(user.id, "toggle_active", user.is_active ? "User banned" : "User restored")}
                    style={{ fontSize: 12, fontWeight: 600, color: user.is_active ? "#dc2626" : "#059669", padding: "6px 12px", borderRadius: 999, border: `1.5px solid ${user.is_active ? "#fecaca" : "#bbf7d0"}`, background: user.is_active ? "#fef2f2" : "#f0fdf4", cursor: "pointer", opacity: busy ? 0.6 : 1 }}
                  >
                    {busy ? "..." : user.is_active ? "Ban User" : "Restore"}
                  </button>
                  {user.role !== "admin" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction(user.id, "make_admin", "User promoted to admin")}
                      style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", padding: "6px 12px", borderRadius: 999, border: "1.5px solid #c7d2fe", background: "#eef2ff", cursor: "pointer", opacity: busy ? 0.6 : 1 }}
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction(user.id, "remove_admin", "Admin role removed")}
                      style={{ fontSize: 12, fontWeight: 600, color: "#64748b", padding: "6px 12px", borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", opacity: busy ? 0.6 : 1 }}
                    >
                      Remove Admin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => fetchUsers(search, p)}
              style={{ width: 36, height: 36, borderRadius: 999, border: p === page ? "none" : "1.5px solid #e2e8f0", background: p === page ? "#0f172a" : "#fff", color: p === page ? "#fff" : "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              {p}
            </button>
          ))}
        </div>
      ) : null}
    </AdminShell>
  );
}
