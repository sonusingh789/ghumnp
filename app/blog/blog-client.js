"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const CATEGORIES = [
  { id: "general",     label: "General",     emoji: "✍️",  color: "#6b7280", bg: "#f3f4f6",  light: "#f9fafb" },
  { id: "trekking",    label: "Trekking",    emoji: "🏔️", color: "#0369a1", bg: "#dbeafe",  light: "#eff6ff" },
  { id: "food",        label: "Food",         emoji: "🍜", color: "#b45309", bg: "#fde68a",  light: "#fffbeb" },
  { id: "culture",     label: "Culture",      emoji: "🏛️", color: "#7c3aed", bg: "#ede9fe",  light: "#f5f3ff" },
  { id: "hidden-gems", label: "Hidden Gems",  emoji: "💎", color: "#0891b2", bg: "#cffafe",  light: "#ecfeff" },
  { id: "heritage",    label: "Heritage",     emoji: "🕌", color: "#92400e", bg: "#fef3c7",  light: "#fffbeb" },
  { id: "photography", label: "Photography",  emoji: "📸", color: "#be185d", bg: "#fce7f3",  light: "#fdf2f8" },
];
const AVATAR_PALETTE = ["#0369a1","#7c3aed","#059669","#dc2626","#d97706","#0891b2","#be185d","#6d28d9"];

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function getCat(id) { return CATEGORIES.find(c => c.id === id) || CATEGORIES[0]; }

function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60)      return "just now";
  if (s < 3600)    return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)   return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" });
}

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function initials(name) { return (name || "?").trim()[0].toUpperCase(); }

function readTime(text) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function wordCount(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function canEdit(user, blog) {
  if (!user || !blog) return false;
  return String(user.id) === String(blog.author_id) || user.role === "admin";
}

/* ══════════════════════════════════════════════════════════════
   MARKDOWN RENDERER
══════════════════════════════════════════════════════════════ */
function escHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function safeUrl(raw) {
  const u = (raw || "").trim();
  return /^https?:\/\//i.test(u) ? u : "#";
}
function inlineMd(text) {
  let s = escHtml(text);
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) =>
    `<img src="${safeUrl(url)}" alt="${escHtml(alt)}" style="max-width:100%;border-radius:12px;margin:10px 0;display:block">${
      alt ? `<span style="display:block;text-align:center;font-size:11px;color:#94a3b8;margin-top:4px;font-style:italic">${escHtml(alt)}</span>` : ""
    }`
  );
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, url) =>
    `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer" style="color:#ea580c;text-decoration:underline;font-weight:600">${escHtml(t)}</a>`
  );
  s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  s = s.replace(/`([^`\n]+)`/g, `<code style="background:#f1f5f9;border-radius:4px;padding:1px 6px;font-size:0.88em;font-family:monospace;color:#0f172a">$1</code>`);
  return s;
}
function renderMarkdown(raw) {
  if (!raw) return "";
  const lines = raw.split("\n");
  let html = "", inUl = false;
  for (const line of lines) {
    if (/^## /.test(line)) {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<h2 style="font-size:19px;font-weight:800;color:#0f172a;margin:24px 0 10px;letter-spacing:-0.01em;padding-bottom:7px;border-bottom:2px solid #f1f5f9">${inlineMd(line.slice(3))}</h2>`;
    } else if (/^### /.test(line)) {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:18px 0 7px">${inlineMd(line.slice(4))}</h3>`;
    } else if (/^> /.test(line)) {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<blockquote style="border-left:3px solid #ea580c;padding:10px 16px;margin:14px 0;color:#78716c;font-style:italic;background:#fff7ed;border-radius:0 12px 12px 0;font-size:14px">${inlineMd(line.slice(2))}</blockquote>`;
    } else if (/^[-*] /.test(line)) {
      if (!inUl) { html += '<ul style="padding-left:20px;margin:12px 0;list-style:disc">'; inUl = true; }
      html += `<li style="margin:6px 0;line-height:1.8;color:#374151">${inlineMd(line.slice(2))}</li>`;
    } else if (line === "---") {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += '<hr style="border:none;border-top:1.5px solid #f1f5f9;margin:20px 0">';
    } else if (line.trim() === "") {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += "<br>";
    } else {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<p style="margin:0 0 12px;line-height:1.9;color:#374151;font-size:14.5px">${inlineMd(line)}</p>`;
    }
  }
  if (inUl) html += "</ul>";
  return html;
}

/* ══════════════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════════════ */
function Avatar({ name, src, size = 32 }) {
  const color = avatarColor(name);
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 800, color: "#fff", flexShrink: 0, letterSpacing: "-0.02em" }}>
      {initials(name)}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RICH EDITOR
══════════════════════════════════════════════════════════════ */
function RichEditor({ value, onChange, disabled }) {
  const [preview, setPreview]       = useState(false);
  const [imgUploading, setImgUp]    = useState(false);
  const [imgError, setImgErr]       = useState("");
  const taRef   = useRef(null);
  const fileRef = useRef(null);

  function insert(before, after = "", placeholder = "") {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = value.slice(s, e) || placeholder;
    onChange(value.slice(0, s) + before + sel + after + value.slice(e));
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + sel.length); });
  }

  function prefixLine(prefix) {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart;
    const ls = value.lastIndexOf("\n", s - 1) + 1;
    const already = value.slice(ls, ls + prefix.length) === prefix;
    if (already) {
      onChange(value.slice(0, ls) + value.slice(ls + prefix.length));
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s - prefix.length, s - prefix.length); });
    } else {
      onChange(value.slice(0, ls) + prefix + value.slice(ls));
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + prefix.length, s + prefix.length); });
    }
  }

  async function handleImage(file) {
    if (!file) return;
    setImgErr(""); setImgUp(true);
    try {
      const dataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
      const resp = await fetch("/api/uploads/imagekit", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ file: dataUrl, fileName: file.name, mimeType: file.type, folderHint: "blog", folderType: "blog" }) });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Upload failed");
      insert("![", `](${data.url})`, "Image caption");
      fileRef.current.value = "";
    } catch (err) { setImgErr(err.message || "Upload failed."); }
    finally { setImgUp(false); }
  }

  const groups = [
    [
      { icon: "B",   title: "Bold",      style: { fontWeight: 900 },               fn: () => insert("**", "**", "bold") },
      { icon: "I",   title: "Italic",    style: { fontStyle: "italic" },            fn: () => insert("*", "*", "italic") },
      { icon: "H2",  title: "Heading 2", style: { fontSize: 10, fontWeight: 900 },  fn: () => prefixLine("## ") },
      { icon: "H3",  title: "Heading 3", style: { fontSize: 10, fontWeight: 700 },  fn: () => prefixLine("### ") },
    ],
    [
      { icon: "•",  title: "Bullet list",   style: { fontSize: 16 },  fn: () => prefixLine("- ") },
      { icon: "❝",  title: "Blockquote",    style: { fontSize: 14 },  fn: () => prefixLine("> ") },
      { icon: "—",  title: "Divider",       style: {},                fn: () => insert("\n---\n") },
    ],
    [
      { icon: "🔗",  title: "Insert link",  style: {},  fn: () => insert("[", "](https://)", "link text") },
      { icon: imgUploading ? "⏳" : "📷",  title: "Insert image",  style: { opacity: imgUploading ? 0.5 : 1, cursor: imgUploading ? "wait" : "pointer" },  fn: () => !imgUploading && fileRef.current?.click() },
    ],
  ];

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "7px 10px", background: "#f8fafc", borderRadius: "12px 12px 0 0", border: "1.5px solid #e2e8f0", borderBottom: "none", flexWrap: "wrap" }}>
        {groups.map((grp, gi) => (
          <div key={gi} style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {gi > 0 && <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 4px" }} />}
            {grp.map(t => (
              <button key={t.title} type="button" title={t.title} onClick={t.fn}
                style={{ padding: "5px 8px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#475569", minWidth: 28, lineHeight: 1, ...t.style }}
                onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                {t.icon}
              </button>
            ))}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <button type="button" onClick={() => setPreview(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 8, border: `1.5px solid ${preview ? "#ea580c" : "#e2e8f0"}`, background: preview ? "#ea580c" : "#fff", color: preview ? "#fff" : "#475569", fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          {preview
            ? <><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Edit</>
            : <><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M1 8C2.5 4.5 5 2.5 8 2.5S13.5 4.5 15 8c-1.5 3.5-4 5.5-7 5.5S2.5 11.5 1 8z" stroke="currentColor" strokeWidth="1.5"/></svg> Preview</>
          }
        </button>
      </div>

      {/* Content area */}
      {preview ? (
        <div
          style={{ border: "1.5px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "16px 18px", minHeight: 200, background: "#fafafa", overflowWrap: "break-word" }}
          dangerouslySetInnerHTML={{ __html: value ? renderMarkdown(value) : '<p style="color:#94a3b8;font-style:italic;font-size:13px">Nothing to preview yet…</p>' }}
        />
      ) : (
        <textarea
          ref={taRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={9}
          disabled={disabled}
          placeholder={"Write your Nepal story here…\n\nFormatting:\n**bold**  *italic*  ## Heading  ### Sub-heading\n- bullet item\n> blockquote\n![caption](image-url)  [link text](url)"}
          style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "14px 16px", fontSize: 13, color: "#0f172a", fontFamily: "ui-monospace,SFMono-Regular,monospace", outline: "none", resize: "vertical", lineHeight: 1.8, background: "#fff" }}
        />
      )}

      {/* Footer row: word count + image error */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
        {imgError
          ? <p style={{ fontSize: 11, color: "#dc2626" }}>📷 {imgError}</p>
          : <span />
        }
        <p style={{ fontSize: 10, color: "#cbd5e1" }}>{wordCount(value).toLocaleString()} words</p>
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={e => handleImage(e.target.files?.[0])} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WRITE / EDIT MODAL
══════════════════════════════════════════════════════════════ */
function WriteModal({ editBlog, onClose, onSaved }) {
  const isEdit = Boolean(editBlog);
  const [title,    setTitle]    = useState(editBlog?.title    || "");
  const [content,  setContent]  = useState(editBlog?.content  || "");
  const [category, setCategory] = useState(editBlog?.category || "general");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim())   { setError("Title is required.");   return; }
    if (!content.trim()) { setError("Story is required.");   return; }
    setBusy(true); setError("");
    try {
      const res  = await fetch(isEdit ? `/api/blogs/${editBlog.id}` : "/api/blogs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ title, content, category }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save."); return; }
      onSaved(data.blog, isEdit);
      onClose();
    } catch { setError("Network error. Please try again."); }
    finally { setBusy(false); }
  }

  const cat = getCat(category);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201, background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "94vh", overflowY: "auto", boxShadow: "0 -12px 50px rgba(0,0,0,0.22)" }}>

        {/* Handle + header */}
        <div style={{ padding: "14px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: "#e2e8f0" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#ea580c", marginBottom: 2 }}>
                {isEdit ? "Edit Post" : "New Post"}
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
                {isEdit ? "Edit Blog" : "Write a Blog"}
              </h2>
            </div>
            <button onClick={onClose} aria-label="Close"
              style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="#475569" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "0 20px 48px" }}>

          {/* Category */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 9 }}>Category</p>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {CATEGORIES.map(c => (
                <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 999, border: `1.5px solid ${category === c.id ? c.color : "#e2e8f0"}`, background: category === c.id ? c.bg : "#fff", color: category === c.id ? c.color : "#94a3b8", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
                  <span style={{ fontSize: 13 }}>{c.emoji}</span>{c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7 }}>Title *</p>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. My 3-day Langtang Valley trek…"
              maxLength={300}
              style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 13, padding: "13px 16px", fontSize: 15, fontWeight: 600, color: "#0f172a", outline: "none", fontFamily: "inherit", background: title ? "#fff" : "#fafafa" }}
              onFocus={e => { e.target.style.borderColor = "#ea580c"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: title.length > 270 ? "#ea580c" : "#cbd5e1" }}>{title.length}/300</span>
            </div>
          </div>

          {/* Rich editor */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7 }}>Story *</p>
            <RichEditor value={content} onChange={setContent} disabled={busy} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "11px 15px", marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={busy}
            style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: busy ? "#94a3b8" : cat.color, color: "#fff", fontSize: 14, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, letterSpacing: "-0.01em" }}>
            {busy
              ? <><span style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />{isEdit ? "Saving…" : "Publishing…"}</>
              : <>{cat.emoji} {isEdit ? "Save Changes" : "Publish Story"}</>
            }
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   READ MODAL
══════════════════════════════════════════════════════════════ */
function ReadModal({ blog: initial, onClose }) {
  const [blog,    setBlog]    = useState(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blogs/${initial.id}`, { credentials: "same-origin" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.blog) setBlog(d.blog); })
      .finally(() => setLoading(false));
  }, [initial.id]);

  const cat = getCat(blog.category);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201, background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "93vh", overflowY: "auto", boxShadow: "0 -12px 50px rgba(0,0,0,0.22)", display: "flex", flexDirection: "column" }}>

        {/* Sticky top bar */}
        <div style={{ position: "sticky", top: 0, zIndex: 1, background: "#fff", borderRadius: "24px 24px 0 0", padding: "14px 20px 10px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: "#e2e8f0", margin: "0 auto" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cat.bg, color: cat.color, borderRadius: 999, padding: "4px 10px", fontSize: 10, fontWeight: 700 }}>
              {cat.emoji} {cat.label}
            </span>
            {!loading && (
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{readTime(blog.content || "")}</span>
            )}
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="#475569" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: "20px 22px 56px", flex: 1 }}>

          {/* Title */}
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", lineHeight: 1.25, letterSpacing: "-0.025em", marginBottom: 16 }}>
            {blog.title}
          </h2>

          {/* Cover image */}
          {blog.cover_image_url && (
            <img src={blog.cover_image_url} alt={blog.title} style={{ width: "100%", borderRadius: 16, marginBottom: 18, objectFit: "cover", maxHeight: 240 }} />
          )}

          {/* Author bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", marginBottom: 22 }}>
            <Avatar name={blog.author_name} src={blog.author_avatar} size={38} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{blog.author_name}</p>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>
                {timeAgo(blog.created_at)}
                {blog.updated_at && blog.updated_at !== blog.created_at && (
                  <span style={{ marginLeft: 5, background: "#f1f5f9", borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 600, color: "#64748b" }}>edited</span>
                )}
              </p>
            </div>
          </div>

          {/* Content */}
          {loading
            ? <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[90, 75, 85, 60, 80, 70, 50].map((w, i) => (
                  <div key={i} style={{ height: i % 3 === 0 ? 10 : 13, background: "#f1f5f9", borderRadius: 99, width: `${w}%`, animation: "pulse 1.5s ease-in-out infinite" }} />
                ))}
              </div>
            : <div
                style={{ fontSize: 14.5, lineHeight: 1.9, overflowWrap: "break-word", color: "#374151" }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content || blog.excerpt || "") }}
              />
          }
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   DELETE CONFIRM
══════════════════════════════════════════════════════════════ */
function DeleteConfirm({ blog, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setBusy(true);
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, { method: "DELETE", credentials: "same-origin" });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      onDeleted(blog.id); onClose();
    } catch { setError("Network error."); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", left: 16, right: 16, bottom: 40, zIndex: 301, background: "#fff", borderRadius: 22, padding: "24px 22px", boxShadow: "0 10px 50px rgba(0,0,0,0.25)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>
          🗑️
        </div>
        <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Delete this story?</p>
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 20 }}>
          &ldquo;{blog.title}&rdquo; will be permanently removed. This cannot be undone.
        </p>
        {error && <p style={{ fontSize: 11, color: "#dc2626", marginBottom: 10, fontWeight: 600 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#475569" }}>
            Cancel
          </button>
          <button onClick={confirm} disabled={busy}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: busy ? "#94a3b8" : "#dc2626", color: "#fff", fontSize: 13, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer" }}>
            {busy ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   BLOG CARD
══════════════════════════════════════════════════════════════ */
function BlogCard({ blog, user, onRead, onEdit, onDelete, featured }) {
  const cat   = getCat(blog.category);
  const owner = canEdit(user, blog);

  return (
    <div style={{
      background: "#fff",
      border: "1.5px solid #f1f5f9",
      borderLeft: `4px solid ${cat.color}`,
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: featured ? "0 4px 24px rgba(15,23,42,0.10)" : "0 2px 10px rgba(15,23,42,0.05)",
    }}>
      <div style={{ padding: featured ? "16px 16px 16px 14px" : "14px 15px 14px 13px" }}>

        {/* Top meta row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: featured ? 10 : 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cat.bg, color: cat.color, borderRadius: 999, padding: "3px 9px", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
              {cat.emoji} {cat.label}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#cbd5e1", flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>{readTime(blog.excerpt || "")}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#cbd5e1", flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>{timeAgo(blog.created_at)}</span>
          </div>

          {/* Edit / Delete */}
          {owner && (
            <div style={{ display: "flex", gap: 5, flexShrink: 0, marginLeft: 8 }}>
              <button onClick={e => { e.stopPropagation(); onEdit(blog); }} title="Edit"
                style={{ width: 30, height: 30, borderRadius: 9, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M11 2.5l2.5 2.5-8 8H3v-2.5l8-8z" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </button>
              <button onClick={e => { e.stopPropagation(); onDelete(blog); }} title="Delete"
                style={{ width: 30, height: 30, borderRadius: 9, border: "1px solid #fecaca", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                <svg width="12" height="13" viewBox="0 0 14 15" fill="none">
                  <path d="M1 3.5h12M5 3.5V2h4v1.5M2.5 3.5l1 10h7l1-10" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <button onClick={() => onRead(blog)} style={{ display: "block", width: "100%", background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}>
          <p style={{ fontSize: featured ? 16 : 14, fontWeight: 800, color: "#0f172a", lineHeight: 1.35, marginBottom: 7, letterSpacing: "-0.01em" }}>
            {blog.title}
          </p>
        </button>

        {/* Excerpt */}
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.65, marginBottom: 12,
          display: "-webkit-box", WebkitLineClamp: featured ? 3 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {blog.excerpt || ""}
        </p>

        {/* Author + Read button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Avatar name={blog.author_name} src={blog.author_avatar} size={26} />
            <span style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>{blog.author_name}</span>
          </div>
          <button onClick={() => onRead(blog)}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 999, border: "none", background: cat.light, color: cat.color, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            Read
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SKELETON CARD
══════════════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderLeft: "4px solid #e2e8f0", borderRadius: 18, padding: "16px 15px 14px 13px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 70, height: 20, background: "#f1f5f9", borderRadius: 99 }} />
        <div style={{ width: 50, height: 20, background: "#f8fafc", borderRadius: 99 }} />
      </div>
      <div style={{ width: "88%", height: 15, background: "#e2e8f0", borderRadius: 99, marginBottom: 8 }} />
      <div style={{ width: "70%", height: 12, background: "#f1f5f9", borderRadius: 99, marginBottom: 4 }} />
      <div style={{ width: "82%", height: 12, background: "#f1f5f9", borderRadius: 99, marginBottom: 14 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#e2e8f0" }} />
          <div style={{ width: 70, height: 10, background: "#f1f5f9", borderRadius: 99 }} />
        </div>
        <div style={{ width: 52, height: 26, background: "#f8fafc", borderRadius: 99 }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function BlogClient() {
  const [user,       setUser]       = useState(null);
  const [blogs,      setBlogs]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ,    setSearchQ]    = useState("");
  const [writeOpen,  setWriteOpen]  = useState(false);
  const [editBlog,   setEditBlog]   = useState(null);
  const [readBlog,   setReadBlog]   = useState(null);
  const [delBlog,    setDelBlog]    = useState(null);
  const searchRef = useRef(null);

  /* auth */
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setUser(d?.user || false))
      .catch(() => setUser(false));
  }, []);

  /* fetch */
  const fetchBlogs = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(q ? `/api/blogs?q=${encodeURIComponent(q)}` : "/api/blogs", { credentials: "same-origin" });
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch { setBlogs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  /* search debounce */
  useEffect(() => {
    const t = setTimeout(() => fetchBlogs(searchQ), 380);
    return () => clearTimeout(t);
  }, [searchQ, fetchBlogs]);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const filtered = activeTab === "all" ? blogs : blogs.filter(b => b.category === activeTab);

  function handleSaved(saved, isEdit) {
    if (isEdit) setBlogs(bs => bs.map(b => b.id === saved?.id ? { ...b, ...saved } : b));
    else fetchBlogs();
  }

  function handleDeleted(id) { setBlogs(bs => bs.filter(b => b.id !== id)); }

  /* counts per tab */
  function tabCount(id) { return id === "all" ? blogs.length : blogs.filter(b => b.category === id).length; }

  return (
    <div style={{ paddingBottom: 48 }}>

      {/* ── TOOLBAR ──────────────────────────────────────── */}
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: searchOpen ? 12 : 14 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em" }}>
              Stories
            </p>
            {!loading && (
              <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
                {filtered.length} post{filtered.length !== 1 ? "s" : ""}
                {activeTab !== "all" && ` in ${getCat(activeTab).label}`}
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Search */}
            <button
              onClick={() => { setSearchOpen(v => !v); if (searchOpen) { setSearchQ(""); setActiveTab("all"); } }}
              aria-label="Search"
              style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${searchOpen ? "#ea580c" : "#e2e8f0"}`, background: searchOpen ? "#fff7ed" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              {searchOpen
                ? <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round"/></svg>
                : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#64748b" strokeWidth="1.6"/><path d="M10.5 10.5L14 14" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/></svg>
              }
            </button>

            {/* Write */}
            {user && (
              <button onClick={() => { setEditBlog(null); setWriteOpen(true); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, border: "none", background: "#ea580c", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", flexShrink: 0, letterSpacing: "-0.01em" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
                Write
              </button>
            )}
            {user === false && (
              <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 14px", borderRadius: 12, border: "1.5px solid #fed7aa", background: "#fff7ed", color: "#ea580c", fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                ✍️ Write
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#94a3b8" strokeWidth="1.6"/><path d="M10.5 10.5L14 14" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <input ref={searchRef} type="search" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search stories, authors, topics…"
                style={{ width: "100%", boxSizing: "border-box", paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11, border: "1.5px solid #fed7aa", borderRadius: 12, fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", background: "#fffbf7" }}
              />
            </div>
            {searchQ && !loading && (
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                {blogs.length} result{blogs.length !== 1 ? "s" : ""} for &ldquo;{searchQ}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── CATEGORY TABS ────────────────────────────────── */}
      {!searchOpen && (
        <div style={{ overflowX: "auto", paddingBottom: 2, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 7, padding: "0 20px", minWidth: "max-content" }}>
            {[{ id: "all", label: "All", emoji: "📚" }, ...CATEGORIES].map(tab => {
              const isActive = activeTab === tab.id;
              const count = tabCount(tab.id);
              if (!loading && tab.id !== "all" && count === 0) return null;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 999, border: `1.5px solid ${isActive ? (tab.id === "all" ? "#ea580c" : getCat(tab.id).color) : "#e2e8f0"}`, background: isActive ? (tab.id === "all" ? "#ea580c" : getCat(tab.id).bg) : "#fff", color: isActive ? (tab.id === "all" ? "#fff" : getCat(tab.id).color) : "#64748b", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 12 }}>{tab.emoji}</span>
                  {tab.label}
                  <span style={{ fontSize: 10, background: isActive ? "rgba(255,255,255,0.25)" : "#f1f5f9", color: isActive ? "inherit" : "#94a3b8", borderRadius: 99, padding: "1px 5px" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BLOG LIST ────────────────────────────────────── */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 11 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length === 0
            ? (
              <div style={{ textAlign: "center", padding: "44px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 14px" }}>
                  {searchQ ? "🔍" : activeTab !== "all" ? getCat(activeTab).emoji : "✍️"}
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 5 }}>
                  {searchQ ? "No stories found" : activeTab !== "all" ? `No ${getCat(activeTab).label} posts yet` : "No blogs yet"}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, maxWidth: 240, margin: "0 auto 18px" }}>
                  {searchQ ? `Try a different keyword` : user ? "Be the first to share your Nepal story!" : "Log in to write the first blog post."}
                </p>
                {!searchQ && activeTab !== "all" && (
                  <button onClick={() => setActiveTab("all")} style={{ padding: "9px 18px", borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#475569", marginBottom: 10 }}>
                    View all posts
                  </button>
                )}
                {!searchQ && user && (
                  <button onClick={() => setWriteOpen(true)} style={{ display: "block", margin: "0 auto", padding: "10px 22px", borderRadius: 999, border: "none", background: "#ea580c", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    ✍️ Write Now
                  </button>
                )}
                {!searchQ && user === false && (
                  <Link href="/login" style={{ display: "inline-block", padding: "10px 22px", borderRadius: 999, background: "#ea580c", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    Log In to Write
                  </Link>
                )}
              </div>
            )
            : filtered.map((blog, i) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                user={user}
                featured={i === 0 && activeTab === "all" && !searchQ}
                onRead={setReadBlog}
                onEdit={b => { setEditBlog(b); setWriteOpen(true); }}
                onDelete={setDelBlog}
              />
            ))
        }
      </div>

      {/* Guest CTA */}
      {!loading && user === false && filtered.length > 0 && (
        <div style={{ margin: "20px 20px 0", background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1.5px solid #fed7aa", borderRadius: 18, padding: "18px 18px", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✍️</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#7c2d12", marginBottom: 2 }}>Share your Nepal story</p>
            <p style={{ fontSize: 11, color: "#9a3412", lineHeight: 1.5 }}>Log in to publish your travel blog.</p>
          </div>
          <Link href="/login" style={{ padding: "9px 16px", borderRadius: 999, background: "#ea580c", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>Log In</Link>
        </div>
      )}

      {/* Modals */}
      {writeOpen  && <WriteModal editBlog={editBlog} onClose={() => { setWriteOpen(false); setEditBlog(null); }} onSaved={handleSaved} />}
      {readBlog   && <ReadModal  blog={readBlog}  onClose={() => setReadBlog(null)} />}
      {delBlog    && <DeleteConfirm blog={delBlog} onClose={() => setDelBlog(null)} onDeleted={handleDeleted} />}
    </div>
  );
}
