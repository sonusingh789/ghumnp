"use client";

import { useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/layout/admin-shell";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          style={{
            padding: "8px 16px", borderRadius: 999, border: "1.5px solid",
            borderColor: active === t.key ? "#059669" : "#e2e8f0",
            background: active === t.key ? "#059669" : "#fff",
            color: active === t.key ? "#fff" : "#64748b",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          {t.label}
          {t.count > 0 && (
            <span style={{
              marginLeft: 6, background: active === t.key ? "rgba(255,255,255,0.3)" : "#fee2e2",
              color: active === t.key ? "#fff" : "#dc2626",
              borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 800,
            }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function AdminReportsClient({ initialReports, initialSuggestions }) {
  const [tab, setTab] = useState("reports");
  const [reports, setReports] = useState(initialReports);
  const [suggestions, setSuggestions] = useState(
    initialSuggestions.map((s) => {
      let changes = {};
      try { changes = JSON.parse(s.suggested_changes); } catch { /* ignore */ }
      return { ...s, changes };
    })
  );
  const [acting, setActing] = useState({});
  const [toast, setToast] = useState({ msg: "", ok: true });

  function showToast(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  }

  async function handleReport(reportId, status) {
    setActing((p) => ({ ...p, [reportId]: true }));
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status }),
      });
      if (!res.ok) throw new Error("Failed.");
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      showToast(status === "resolved" ? "Marked as resolved" : "Report dismissed");
    } catch {
      showToast("Action failed.", false);
    } finally {
      setActing((p) => ({ ...p, [reportId]: false }));
    }
  }

  async function handleSuggestion(suggestionId, action) {
    setActing((p) => ({ ...p, [suggestionId]: true }));
    try {
      const res = await fetch("/api/admin/suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId, action }),
      });
      if (!res.ok) throw new Error("Failed.");
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
      showToast(action === "apply" ? "Changes applied to place" : "Suggestion rejected");
    } catch {
      showToast("Action failed.", false);
    } finally {
      setActing((p) => ({ ...p, [suggestionId]: false }));
    }
  }

  const tabs = [
    { key: "reports", label: "Reports", count: reports.length },
    { key: "suggestions", label: "Suggestions", count: suggestions.length },
  ];

  return (
    <AdminShell>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin" style={{ fontSize: 12, color: "#64748b", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
          ← Dashboard
        </Link>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#dc2626", marginBottom: 4 }}>Admin</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 4 }}>Reports & Suggestions</h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>Review user-submitted reports and edit suggestions.</p>
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {/* REPORTS */}
      {tab === "reports" && (
        <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
          {reports.length === 0 ? (
            <div style={{ padding: "40px 18px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
              No open reports.
            </div>
          ) : (
            reports.map((r, i) => (
              <div
                key={r.id}
                style={{
                  padding: "16px 18px",
                  borderBottom: i < reports.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                {/* Place + meta */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <Link
                      href={`/place/${r.place_slug}`}
                      target="_blank"
                      style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", textDecoration: "none" }}
                    >
                      {r.place_name}
                    </Link>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      Reported by <strong>{r.reporter_name || "Guest"}</strong>
                      {r.reporter_email ? ` (${r.reporter_email})` : ""} · {timeAgo(r.created_at)}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "3px 9px", background: "#fef2f2", color: "#dc2626", flexShrink: 0 }}>
                    Open
                  </span>
                </div>

                {/* Reason */}
                <div style={{ background: "#fef2f2", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#7f1d1d", lineHeight: 1.5 }}>
                  {r.reason}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    disabled={acting[r.id]}
                    onClick={() => handleReport(r.id, "resolved")}
                    style={{
                      padding: "7px 16px", borderRadius: 999, border: "none",
                      background: "#059669", color: "#fff", fontSize: 12, fontWeight: 700,
                      cursor: acting[r.id] ? "not-allowed" : "pointer", opacity: acting[r.id] ? 0.6 : 1,
                    }}
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    disabled={acting[r.id]}
                    onClick={() => handleReport(r.id, "dismissed")}
                    style={{
                      padding: "7px 16px", borderRadius: 999, border: "1.5px solid #e2e8f0",
                      background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 700,
                      cursor: acting[r.id] ? "not-allowed" : "pointer", opacity: acting[r.id] ? 0.6 : 1,
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUGGESTIONS */}
      {tab === "suggestions" && (
        <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
          {suggestions.length === 0 ? (
            <div style={{ padding: "40px 18px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
              No pending suggestions.
            </div>
          ) : (
            suggestions.map((s, i) => (
              <div
                key={s.id}
                style={{
                  padding: "16px 18px",
                  borderBottom: i < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                {/* Place + meta */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <Link
                      href={`/place/${s.place_slug}`}
                      target="_blank"
                      style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", textDecoration: "none" }}
                    >
                      {s.place_name}
                    </Link>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      Suggested by <strong>{s.suggester_name || "Guest"}</strong>
                      {s.suggester_email ? ` (${s.suggester_email})` : ""} · {timeAgo(s.created_at)}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "3px 9px", background: "#fffbeb", color: "#d97706", flexShrink: 0 }}>
                    Pending
                  </span>
                </div>

                {/* Suggested changes */}
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                  {Object.entries(s.changes).map(([field, value]) => {
                    if (field === "suggested_images" && Array.isArray(value)) {
                      return (
                        <div key={field} style={{ marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Suggested Photos:</span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {value.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noreferrer">
                                <img src={url} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1.5px solid #e2e8f0" }} />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={field} style={{ marginBottom: 6, fontSize: 13 }}>
                        <span style={{ fontWeight: 700, color: "#475569", textTransform: "capitalize" }}>{field}: </span>
                        <span style={{ color: "#0f172a" }}>{String(value)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    disabled={acting[s.id]}
                    onClick={() => handleSuggestion(s.id, "apply")}
                    style={{
                      padding: "7px 16px", borderRadius: 999, border: "none",
                      background: "#059669", color: "#fff", fontSize: 12, fontWeight: 700,
                      cursor: acting[s.id] ? "not-allowed" : "pointer", opacity: acting[s.id] ? 0.6 : 1,
                    }}
                  >
                    Apply Changes
                  </button>
                  <button
                    type="button"
                    disabled={acting[s.id]}
                    onClick={() => handleSuggestion(s.id, "reject")}
                    style={{
                      padding: "7px 16px", borderRadius: 999, border: "1.5px solid #fecaca",
                      background: "#fff5f5", color: "#dc2626", fontSize: 12, fontWeight: 700,
                      cursor: acting[s.id] ? "not-allowed" : "pointer", opacity: acting[s.id] ? 0.6 : 1,
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Toast */}
      {toast.msg && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: toast.ok ? "#059669" : "#dc2626", color: "#fff",
          borderRadius: 999, padding: "10px 20px", fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)", zIndex: 9999, whiteSpace: "nowrap",
        }}>
          {toast.msg}
        </div>
      )}
    </AdminShell>
  );
}
