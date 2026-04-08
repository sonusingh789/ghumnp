"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import AdminShell from "@/components/layout/admin-shell";

const STATUS_TABS = [
  { key: "all",      label: "All"      },
  { key: "pending",  label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_STYLES = {
  pending:  { bg: "#fffbeb", text: "#92400e", label: "Pending"  },
  approved: { bg: "#ecfdf5", text: "#065f46", label: "Approved" },
  rejected: { bg: "#fef2f2", text: "#991b1b", label: "Rejected" },
};

const CATEGORY_LABELS = {
  attraction: "Attraction",
  food:       "Local Food",
  restaurant: "Restaurant",
  hotel:      "Hotel",
  stay:       "Local Stay",
};

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export default function AdminPlacesClient({ initialPlaces, initialTotal, initialPages, initialStatus }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [places, setPlaces] = useState(initialPlaces);
  const [total, setTotal]   = useState(initialTotal);
  const [pages, setPages]   = useState(initialPages);
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState(initialStatus || "all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast]   = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function fetchPlaces(q, s, p) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/places?search=${encodeURIComponent(q)}&status=${s}&page=${p}`);
      const data = await res.json();
      setPlaces(data.places);
      setTotal(data.total);
      setPages(data.pages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((q, s) => fetchPlaces(q, s, 1), 400), []);

  function handleSearch(e) {
    setSearch(e.target.value);
    debouncedSearch(e.target.value, status);
  }

  function handleTabChange(s) {
    setStatus(s);
    setSearch("");
    fetchPlaces("", s, 1);
    router.replace(`/admin/places${s !== "all" ? `?status=${s}` : ""}`, { scroll: false });
  }

  async function handleStatusChange(slug, newStatus, adminNote = "") {
    setActionLoading((prev) => ({ ...prev, [slug]: true }));
    try {
      const res = await fetch(`/api/places/${slug}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, admin_note: adminNote }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed"); return; }
      setPlaces((prev) => prev.map((p) => p.slug === slug ? { ...p, status: newStatus } : p));
      showToast(newStatus === "approved" ? "Place approved!" : "Place rejected.");
    } catch {
      showToast("Error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [slug]: false }));
    }
  }

  return (
    <AdminShell>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 4 }}>Admin</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 4 }}>Places</h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>{total} place{total !== 1 ? "s" : ""} found</p>
      </div>

      {/* Status tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", background: "#f1f5f9", borderRadius: 12, padding: 4 }}>
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTabChange(key)}
            style={{ flex: 1, padding: "7px 14px", borderRadius: 9, border: "none", background: status === key ? "#fff" : "transparent", color: status === key ? "#0f172a" : "#64748b", fontSize: 13, fontWeight: status === key ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", boxShadow: status === key ? "0 1px 4px rgba(15,23,42,0.08)" : "none", transition: "all 0.15s" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={handleSearch}
        placeholder="Search by name or district..."
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", marginBottom: 16, boxSizing: "border-box", background: "#fff" }}
      />

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3].map((i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: 12, background: "#f1f5f9", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ width: "60%", height: 14, borderRadius: 6, background: "#f1f5f9" }} />
                <div style={{ width: "40%", height: 11, borderRadius: 6, background: "#f8fafc" }} />
                <div style={{ width: "25%", height: 11, borderRadius: 6, background: "#f8fafc" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {places.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", color: "#94a3b8", fontSize: 14 }}>
              No places found.
            </div>
          ) : null}
          {places.map((place) => {
            const s = STATUS_STYLES[place.status] || STATUS_STYLES.pending;
            const busy = actionLoading[place.slug];
            return (
              <div key={place.slug} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 12, padding: "12px 14px" }}>
                  {place.cover_image_url ? (
                    <div style={{ position: "relative", width: 72, height: 72, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                      <Image src={place.cover_image_url} alt={place.name} fill sizes="72px" className="object-cover" />
                    </div>
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: 12, background: "#f1f5f9", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#059669" }}>
                        {CATEGORY_LABELS[place.category] || place.category}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "1px 8px", background: s.bg, color: s.text }}>
                        {s.label}
                      </span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{place.name}</p>
                    <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{place.district_name}</p>
                    {place.contributor_name ? (
                      <Link href={`/contributors/${place.contributor_id}`} style={{ fontSize: 11, color: "#059669", fontWeight: 600, textDecoration: "none" }}>
                        @{place.contributor_name}
                      </Link>
                    ) : null}
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      {new Date(place.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 14px", display: "flex", gap: 8 }}>
                  <Link
                    href={`/place/${place.slug}`}
                    target="_blank"
                    style={{ flex: 1, padding: "8px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 12, fontWeight: 600, color: "#475569", textDecoration: "none", textAlign: "center" }}
                  >
                    View
                  </Link>
                  {place.status !== "approved" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleStatusChange(place.slug, "approved")}
                      style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: "#059669", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", opacity: busy ? 0.6 : 1 }}
                    >
                      {busy ? "..." : "Approve"}
                    </button>
                  ) : null}
                  {place.status !== "rejected" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleStatusChange(place.slug, "rejected")}
                      style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: "#fef2f2", fontSize: 12, fontWeight: 700, color: "#dc2626", cursor: "pointer", opacity: busy ? 0.6 : 1 }}
                    >
                      Reject
                    </button>
                  ) : null}
                  {place.status === "rejected" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleStatusChange(place.slug, "approved")}
                      style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: "#ecfdf5", fontSize: 12, fontWeight: 700, color: "#059669", cursor: "pointer", opacity: busy ? 0.6 : 1 }}
                    >
                      Re-approve
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast ? (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#0f172a", color: "#fff", borderRadius: 999, padding: "10px 20px", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.18)", zIndex: 9999, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      ) : null}

      {/* Pagination */}
      {pages > 1 ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => fetchPlaces(search, status, p)}
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
