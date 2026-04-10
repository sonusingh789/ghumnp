"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/layout/admin-shell";

// Tags we allow through — everything else is stripped (content kept)
const ALLOWED_TAGS = new Set([
  "p","br","b","strong","em","i","u","s","ul","ol","li",
  "h1","h2","h3","h4","h5","h6","blockquote","span","div",
]);

/**
 * Sanitize HTML: keep only safe tags + remove all event/style/class attrs.
 * Runs in the browser via DOM so it's fast and correct.
 */
function sanitize(html) {
  if (typeof document === "undefined") return html;
  const root = document.createElement("div");
  root.innerHTML = html;

  function clean(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.cloneNode();
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tag = node.tagName.toLowerCase();
    // Strip script/style entirely (no content)
    if (tag === "script" || tag === "style") return null;

    const out = ALLOWED_TAGS.has(tag)
      ? document.createElement(tag)
      : document.createElement("span"); // unknown tag → inline span

    // Only keep href on <a> (we don't allow <a> but future-proof)
    for (const attr of node.attributes) {
      if (attr.name === "href" && tag === "a") out.setAttribute("href", attr.value);
      // strip everything else (class, style, on*, data-*)
    }

    for (const child of node.childNodes) {
      const cleaned = clean(child);
      if (cleaned) out.appendChild(cleaned);
    }
    return out;
  }

  const out = document.createElement("div");
  for (const child of root.childNodes) {
    const cleaned = clean(child);
    if (cleaned) out.appendChild(cleaned);
  }
  return out.innerHTML;
}

/**
 * RichTextArea — contenteditable div styled as a textarea.
 * Paste from Word / Docs / ChatGPT / websites preserves bold, headings,
 * bullets etc. We store sanitized innerHTML so formatting round-trips.
 */
function RichTextArea({ value, onChange, rows = 4, placeholder, style }) {
  const ref = useRef(null);
  const isComposing = useRef(false);

  // Mount once — load existing value as HTML (or plain text fallback)
  useEffect(() => {
    if (!ref.current) return;
    const looksLikeHtml = /<[a-z][\s\S]*>/i.test(value || "");
    if (looksLikeHtml) {
      ref.current.innerHTML = value || "";
    } else {
      // Old plain-text content — convert newlines to <br> for display
      ref.current.innerHTML = (value || "")
        .split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("") || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function extract() {
    return sanitize(ref.current?.innerHTML || "");
  }

  function handleInput() {
    if (!isComposing.current) onChange(extract());
  }

  function handlePaste() {
    // Browser inserts rich HTML natively; extract after it commits
    requestAnimationFrame(() => onChange(extract()));
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      onCompositionStart={() => { isComposing.current = true; }}
      onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
      data-placeholder={placeholder}
      className="rich-editor"
      style={{
        ...style,
        minHeight: rows * 24,
        wordBreak: "break-word",
        cursor: "text",
        outline: "none",
        whiteSpace: "normal",
      }}
    />
  );
}

const PROVINCE_COLORS = {
  "Koshi":         { color: "#0891b2", bg: "#ecfeff" },
  "Madhesh":       { color: "#d97706", bg: "#fffbeb" },
  "Bagmati":       { color: "#059669", bg: "#ecfdf5" },
  "Gandaki":       { color: "#7c3aed", bg: "#f5f3ff" },
  "Lumbini":       { color: "#db2777", bg: "#fdf2f8" },
  "Karnali":       { color: "#dc2626", bg: "#fef2f2" },
  "Sudurpashchim": { color: "#ea580c", bg: "#fff7ed" },
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1.5px solid #e2e8f0",
  fontSize: 13,
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  background: "#f8fafc",
  fontFamily: "inherit",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  lineHeight: 1.6,
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#64748b",
  marginBottom: 6,
};

export default function AdminDistrictEditClient({ district }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", ok: true });

  // Basic info state
  const [name, setName] = useState(district.name || "");
  const [tagline, setTagline] = useState(district.tagline || "");

  // SEO state
  const [intro, setIntro] = useState(district.seo?.intro || "");
  const [bestTime, setBestTime] = useState(district.seo?.bestTimeToVisit || "");
  const [howToReach, setHowToReach] = useState(district.seo?.howToReach || "");
  const [localFoods, setLocalFoods] = useState(district.seo?.localFoodsCulture || "");

  const [things, setThings] = useState(district.seo?.topThingsToDo?.length ? district.seo.topThingsToDo : [""]);
  const [faqs, setFaqs] = useState(district.seo?.faqs?.length ? district.seo.faqs.map((f) => {
    const [q, ...rest] = f.split("::");
    return { q: q?.trim() || "", a: rest.join("::").trim() };
  }) : [{ q: "", a: "" }]);

  function showToast(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3500);
  }

  // Things to do helpers
  function addThing() { setThings((t) => [...t, ""]); }
  function removeThing(i) { setThings((t) => t.filter((_, idx) => idx !== i)); }
  function updateThing(i, val) { setThings((t) => t.map((v, idx) => idx === i ? val : v)); }

  // FAQ helpers
  function addFaq() { setFaqs((f) => [...f, { q: "", a: "" }]); }
  function removeFaq(i) { setFaqs((f) => f.filter((_, idx) => idx !== i)); }
  function updateFaq(i, field, val) { setFaqs((f) => f.map((v, idx) => idx === i ? { ...v, [field]: val } : v)); }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {};

      if (activeTab === "basic") {
        payload.name = name;
        payload.tagline = tagline;
      } else {
        payload.seo = {
          intro,
          bestTimeToVisit: bestTime,
          howToReach,
          localFoodsCulture: localFoods,
          topThingsToDo: things.map((t) => t.trim()).filter(Boolean),
          faqs: faqs
            .filter((f) => f.q.trim())
            .map((f) => f.a.trim() ? `${f.q.trim()}::${f.a.trim()}` : f.q.trim()),
        };
      }

      const res = await fetch(`/api/admin/districts/${district.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed.");
      showToast("Saved successfully!");
    } catch (err) {
      showToast(err.message || "Save failed.", false);
    } finally {
      setSaving(false);
    }
  }

  const pStyle = PROVINCE_COLORS[district.province_name] || { color: "#475569", bg: "#f1f5f9" };

  return (
    <AdminShell>
      {/* Back + header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/districts"
          style={{ fontSize: 12, color: "#64748b", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 12 }}
        >
          ← Back to Districts
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 4 }}>
              Edit District
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 6 }}>
              {district.name}
            </h1>
            <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "3px 10px", background: pStyle.bg, color: pStyle.color }}>
              {district.province_name}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href={`/districts/${district.slug}`}
              target="_blank"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "9px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              Preview →
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "9px 20px", borderRadius: 12, border: "none", background: saving ? "#94a3b8" : "#059669", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 4px 14px rgba(5,150,105,0.3)" }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#f1f5f9", borderRadius: 12, padding: 4 }}>
        {[
          { id: "basic", label: "Basic Info" },
          { id: "guide", label: "Travel Guide" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "8px 16px", borderRadius: 10, border: "none",
              background: activeTab === tab.id ? "#fff" : "transparent",
              color: activeTab === tab.id ? "#0f172a" : "#64748b",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: activeTab === tab.id ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── BASIC INFO TAB ── */}
      {activeTab === "basic" && (
        <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>District Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="e.g. Kaski"
            />
          </div>
          <div>
            <label style={labelStyle}>Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              style={inputStyle}
              placeholder="Short description shown under the district name"
              maxLength={300}
            />
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{tagline.length} / 300 characters</p>
          </div>
        </div>
      )}

      {/* ── TRAVEL GUIDE TAB ── */}
      {activeTab === "guide" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* About */}
          <section style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", padding: "24px 20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>About</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>Introductory paragraphs shown at the top of the travel guide. Separate paragraphs with a blank line.</p>
            <label style={labelStyle}>Intro Text</label>
            <RichTextArea
              value={intro}
              onChange={setIntro}
              rows={6}
              style={textareaStyle}
              placeholder="Write an engaging introduction about this district…"
            />
          </section>

          {/* Quick info */}
          <section style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", padding: "24px 20px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Quick Info Cards</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Shown as horizontal scrollable cards in the guide.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>🌤️ Best Time to Visit</label>
                <RichTextArea value={bestTime} onChange={setBestTime} rows={3} style={textareaStyle} placeholder="e.g. October to December for clear skies and trekking…" />
              </div>
              <div>
                <label style={labelStyle}>🚌 How to Reach</label>
                <RichTextArea value={howToReach} onChange={setHowToReach} rows={3} style={textareaStyle} placeholder="e.g. Fly into Pokhara Airport, then take a taxi or bus…" />
              </div>
              <div>
                <label style={labelStyle}>🍜 Local Food &amp; Culture</label>
                <RichTextArea value={localFoods} onChange={setLocalFoods} rows={3} style={textareaStyle} placeholder="e.g. Dal Bhat, Newari cuisine, Teej festival…" />
              </div>
            </div>
          </section>

          {/* Top things to do */}
          <section style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", padding: "24px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>⭐ Top Things To Do</h2>
              <button
                type="button"
                onClick={addThing}
                style={{ fontSize: 12, fontWeight: 700, color: "#059669", background: "#ecfdf5", border: "1px solid #d1fae5", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}
              >
                + Add
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Each item becomes a numbered tile in the horizontal scroll strip.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {things.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateThing(i, e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder={`Activity ${i + 1}`}
                  />
                  {things.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeThing(i)}
                      style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid #fca5a5", background: "#fef2f2", color: "#dc2626", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", padding: "24px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>❓ FAQs</h2>
              <button
                type="button"
                onClick={addFaq}
                style={{ fontSize: 12, fontWeight: 700, color: "#d97706", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}
              >
                + Add FAQ
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Shown as a Q&amp;A list. Answer is optional.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ background: "#f8fafc", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "12px 14px", position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.1em" }}>FAQ {i + 1}</span>
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFaq(i)}
                        style={{ width: 24, height: 24, borderRadius: "50%", border: "1.5px solid #fca5a5", background: "#fef2f2", color: "#dc2626", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div>
                      <label style={labelStyle}>Question</label>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => updateFaq(i, "q", e.target.value)}
                        style={inputStyle}
                        placeholder="e.g. Is Kaski safe for solo travelers?"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Answer <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                      <textarea
                        value={faq.a}
                        onChange={(e) => updateFaq(i, "a", e.target.value)}
                        rows={2}
                        style={textareaStyle}
                        placeholder="e.g. Yes, it is generally very safe…"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* Sticky save bar (bottom) */}
      <div style={{ position: "sticky", bottom: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #e2e8f0", padding: "14px 0", marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <p style={{ fontSize: 12, color: "#94a3b8" }}>Changes saved to <strong style={{ color: "#0f172a" }}>{district.name}</strong> and live immediately.</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: saving ? "#94a3b8" : "#059669", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 4px 14px rgba(5,150,105,0.3)" }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Toast */}
      {toast.msg ? (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: toast.ok ? "#059669" : "#dc2626", color: "#fff", borderRadius: 999, padding: "10px 20px", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.18)", zIndex: 9999, whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      ) : null}
    </AdminShell>
  );
}
