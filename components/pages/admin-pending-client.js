"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminShell from "@/components/layout/admin-shell";
import { BadgeIcon, CheckCircleIcon, ClockIcon, FlagIcon, MapPinIcon, XIcon } from "@/components/ui/icons";

const BADGE_STYLES = {
  explorer:    { bg: "bg-slate-100",   text: "text-slate-600" },
  contributor: { bg: "bg-blue-50",     text: "text-blue-700" },
  local_guide: { bg: "bg-emerald-50",  text: "text-emerald-700" },
  champion:    { bg: "bg-amber-50",    text: "text-amber-700" },
  pioneer:     { bg: "bg-purple-50",   text: "text-purple-700" },
};

const CATEGORY_LABELS = {
  attraction: "Tourist Attraction",
  food: "Local Food",
  restaurant: "Restaurant",
  hotel: "Hotel",
  stay: "Local Stay",
};

export default function AdminPendingClient({ initialPlaces }) {
  const [places, setPlaces] = useState(initialPlaces);
  const [loading, setLoading] = useState({});
  const [preview, setPreview] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleAction(slug, status, adminNote) {
    setLoading((prev) => ({ ...prev, [slug]: true }));
    try {
      const res = await fetch(`/api/places/${slug}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_note: adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPlaces((prev) => prev.filter((p) => p.slug !== slug));
      setPreview(null);
      showToast(status === "approved" ? "Place approved!" : "Place rejected.");
    } catch (e) {
      showToast(e.message);
    } finally {
      setLoading((prev) => ({ ...prev, [slug]: false }));
    }
  }

  function openRejectModal(place) {
    setRejectReason("");
    setRejectModal(place);
  }

  async function submitReject() {
    if (!rejectModal) return;
    await handleAction(rejectModal.slug, "rejected", rejectReason);
    setRejectModal(null);
  }

  return (
    <AdminShell>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 4 }}>Admin</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 4 }}>
          Pending Reviews
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
          {places.length} place{places.length !== 1 ? "s" : ""} waiting for review
        </p>
      </div>

      {toast ? (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 600 }}>
          {toast}
        </div>
      ) : null}

      {places.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0" }}>
          <CheckCircleIcon className="size-10 mx-auto text-emerald-500 mb-3" />
          <p style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>All caught up!</p>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>No pending places to review.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {places.map((place) => {
            const badge = BADGE_STYLES[place.badge_level] || BADGE_STYLES.explorer;
            return (
              <div key={place.slug} style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 14, padding: "14px 16px" }}>
                  {place.cover_image_url ? (
                    <div style={{ position: "relative", width: 80, height: 80, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
                      <Image src={place.cover_image_url} alt={place.name} fill sizes="80px" className="object-cover" />
                    </div>
                  ) : null}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--jade)" }}>
                        {CATEGORY_LABELS[place.category] || place.category}
                      </span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 4 }}>{place.name}</p>
                    <p style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                      <MapPinIcon className="size-3.5" />
                      {place.district_name}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {place.contributor_name ? (
                        <Link href={`/contributors/${place.contributor_id}`} style={{ fontSize: 11, color: "var(--jade)", fontWeight: 600 }}>
                          @{place.contributor_name}
                        </Link>
                      ) : null}
                      <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "2px 8px" }} className={`${badge.bg} ${badge.text}`}>
                        {place.badge_level}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--ink-faint)", display: "flex", alignItems: "center", gap: 3 }}>
                        <ClockIcon className="size-3" />
                        {new Date(place.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", padding: "10px 16px", display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setPreview(preview?.slug === place.slug ? null : place)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1.5px solid var(--border)", background: "transparent", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", cursor: "pointer" }}
                  >
                    {preview?.slug === place.slug ? "Hide" : "Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(place.slug, "approved")}
                    disabled={loading[place.slug]}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "none", background: "var(--jade)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", opacity: loading[place.slug] ? 0.6 : 1 }}
                  >
                    {loading[place.slug] ? "..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openRejectModal(place)}
                    disabled={loading[place.slug]}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "none", background: "#fee2e2", fontSize: 12, fontWeight: 700, color: "#dc2626", cursor: "pointer", opacity: loading[place.slug] ? 0.6 : 1 }}
                  >
                    Reject
                  </button>
                </div>

                {preview?.slug === place.slug ? (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px", background: "#f8fafc" }}>
                    <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7 }}>{place.description}</p>
                    <Link
                      href={`/place/${place.slug}`}
                      target="_blank"
                      style={{ display: "inline-block", marginTop: 10, fontSize: 12, fontWeight: 600, color: "var(--jade)" }}
                    >
                      Open full page ↗
                    </Link>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 400, boxShadow: "0 24px 64px rgba(15,23,42,0.22)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#dc2626", marginBottom: 4 }}>Reject Place</p>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{rejectModal.name}</h2>
              </div>
              <button type="button" onClick={() => setRejectModal(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <XIcon className="size-4" />
              </button>
            </div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
              Reason (optional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this is being rejected..."
              rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid var(--border)", fontSize: 13, color: "var(--ink)", resize: "none", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="button" onClick={submitReject} style={{ flex: 1, padding: "11px", borderRadius: 999, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Confirm Reject
              </button>
              <button type="button" onClick={() => setRejectModal(null)} style={{ flex: 1, padding: "11px", borderRadius: 999, border: "1.5px solid var(--border)", background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
