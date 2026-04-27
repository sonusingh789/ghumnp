"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const CATEGORIES = [
  { id: "general",     label: "General",     emoji: "✍️",  color: "#6b7280", bg: "#f3f4f6" },
  { id: "trekking",    label: "Trekking",    emoji: "🏔️", color: "#0369a1", bg: "#e0f2fe" },
  { id: "food",        label: "Food",         emoji: "🍜", color: "#b45309", bg: "#fef3c7" },
  { id: "culture",     label: "Culture",      emoji: "🏛️", color: "#7c3aed", bg: "#ede9fe" },
  { id: "hidden-gems", label: "Hidden Gems",  emoji: "💎", color: "#0891b2", bg: "#cffafe" },
  { id: "heritage",    label: "Heritage",     emoji: "🕌", color: "#92400e", bg: "#fde68a" },
  { id: "photography", label: "Photography",  emoji: "📸", color: "#be185d", bg: "#fce7f3" },
];
const AVATAR_COLORS = ["#0369a1","#7c3aed","#059669","#dc2626","#d97706","#0891b2","#be185d","#6d28d9"];

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
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initial(name) { return (name || "?").trim()[0].toUpperCase(); }

function canEdit(user, blog) {
  if (!user || !blog) return false;
  return String(user.id) === String(blog.author_id) || user.role === "admin";
}

/* ══════════════════════════════════════════════════════════════
   MARKDOWN RENDERER (safe, no external lib)
══════════════════════════════════════════════════════════════ */
function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeUrl(raw) {
  const u = (raw || "").trim();
  return /^https?:\/\//i.test(u) ? u : "#";
}

function inlineMd(text) {
  let s = escHtml(text);
  // images before links
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const u = safeUrl(url);
    return `<img src="${u}" alt="${escHtml(alt)}" style="max-width:100%;border-radius:10px;margin:8px 0;display:block">${
      alt ? `<span style="display:block;text-align:center;font-size:11px;color:#94a3b8;margin-top:3px;font-style:italic">${escHtml(alt)}</span>` : ""
    }`;
  });
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, url) =>
    `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer" style="color:#ea580c;text-decoration:underline">${escHtml(txt)}</a>`
  );
  s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  s = s.replace(/`([^`\n]+)`/g, `<code style="background:#f1f5f9;border-radius:4px;padding:1px 5px;font-size:0.9em;font-family:monospace">$1</code>`);
  return s;
}

function renderMarkdown(raw) {
  if (!raw) return "";
  const lines = raw.split("\n");
  let html = "";
  let inUl = false;

  for (const line of lines) {
    if (/^## /.test(line)) {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<h2 style="font-size:18px;font-weight:800;color:#0f172a;margin:22px 0 8px;letter-spacing:-0.01em;border-bottom:2px solid #f1f5f9;padding-bottom:6px">${inlineMd(line.slice(3))}</h2>`;
    } else if (/^### /.test(line)) {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<h3 style="font-size:15px;font-weight:700;color:#0f172a;margin:16px 0 6px">${inlineMd(line.slice(4))}</h3>`;
    } else if (/^> /.test(line)) {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<blockquote style="border-left:3px solid #ea580c;padding:8px 14px;margin:12px 0;color:#6b7280;font-style:italic;background:#fff7ed;border-radius:0 10px 10px 0">${inlineMd(line.slice(2))}</blockquote>`;
    } else if (/^[-*] /.test(line)) {
      if (!inUl) { html += '<ul style="padding-left:18px;margin:10px 0;list-style:disc">'; inUl = true; }
      html += `<li style="margin:5px 0;line-height:1.7;color:#374151">${inlineMd(line.slice(2))}</li>`;
    } else if (line === "---") {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0">';
    } else if (line.trim() === "") {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += "<br>";
    } else {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<p style="margin:0 0 10px;line-height:1.85;color:#374151">${inlineMd(line)}</p>`;
    }
  }
  if (inUl) html += "</ul>";
  return html;
}

/* ══════════════════════════════════════════════════════════════
   RICH EDITOR
══════════════════════════════════════════════════════════════ */
function RichEditor({ value, onChange, disabled }) {
  const [preview, setPreview] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState("");
  const taRef  = useRef(null);
  const fileRef = useRef(null);

  function insert(before, after = "", placeholder = "") {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const sel = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(next);
    const selS = start + before.length;
    const selE = selS + sel.length;
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(selS, selE); });
  }

  function prefixLine(prefix) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const already = value.slice(lineStart, lineStart + prefix.length) === prefix;
    const next = already
      ? value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
      : value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    const offset = already ? -prefix.length : prefix.length;
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(start + offset, start + offset); });
  }

  async function handleImage(file) {
    if (!file) return;
    setImgError("");
    setImgUploading(true);
    try {
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const resp = await fetch("/api/uploads/imagekit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ file: dataUrl, fileName: file.name, mimeType: file.type, folderHint: "blog", folderType: "blog" }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Upload failed");
      // insert markdown at cursor
      insert("![", `](${data.url})`, "Image caption");
      fileRef.current.value = "";
    } catch (err) {
      setImgError(err.message || "Image upload failed.");
    } finally {
      setImgUploading(false);
    }
  }

  const TB = [
    { label: "B",   title: "Bold (**text**)",      fn: () => insert("**", "**", "bold text"),     style: { fontWeight: 900 } },
    { label: "I",   title: "Italic (*text*)",       fn: () => insert("*",  "*",  "italic text"),   style: { fontStyle: "italic" } },
    { label: "H2",  title: "Heading 2 (## )",       fn: () => prefixLine("## "),                   style: { fontSize: 10 } },
    { label: "H3",  title: "Heading 3 (### )",      fn: () => prefixLine("### "),                  style: { fontSize: 10 } },
    null,
    { label: "•",   title: "Bullet list (- )",      fn: () => prefixLine("- "),                    style: { fontSize: 16 } },
    { label: "❝",   title: "Blockquote (> )",       fn: () => prefixLine("> "),                    style: { fontSize: 13 } },
    { label: "—",   title: "Horizontal rule (---)", fn: () => insert("\n---\n"),                   style: {} },
    null,
    { label: "🔗",  title: "Link ([text](url))",    fn: () => insert("[", "](https://)", "link"),  style: {} },
    {
      label: imgUploading ? "…" : "📷",
      title: "Insert image",
      fn: () => { if (!imgUploading) fileRef.current?.click(); },
      style: { opacity: imgUploading ? 0.5 : 1, cursor: imgUploading ? "wait" : "pointer" },
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "6px 8px", background: "#f8fafc", borderRadius: "12px 12px 0 0", border: "1.5px solid #e2e8f0", borderBottom: "none", flexWrap: "wrap" }}>
        {TB.map((t, i) =>
          t === null
            ? <div key={`sep-${i}`} style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 2px" }} />
            : <button
                key={t.title}
                type="button"
                title={t.title}
                onClick={t.fn}
                style={{ padding: "4px 7px", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#475569", minWidth: 26, display: "flex", alignItems: "center", justifyContent: "center", ...t.style }}
              >
                {t.label}
              </button>
        )}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setPreview(v => !v)}
          style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: preview ? "#ea580c" : "#fff", color: preview ? "#fff" : "#475569", fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          {preview ? "✏️ Edit" : "👁 Preview"}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          style={{ border: "1.5px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "14px 16px", minHeight: 180, fontSize: 14, overflowWrap: "break-word" }}
          dangerouslySetInnerHTML={{ __html: value ? renderMarkdown(value) : '<p style="color:#94a3b8;font-style:italic">Nothing to preview yet…</p>' }}
        />
      ) : (
        <textarea
          ref={taRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={9}
          disabled={disabled}
          placeholder={"Share your Nepal story…\n\nTips:\n**bold**  *italic*  ## Heading\n- bullet item\n> blockquote\n![caption](image-url)"}
          style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "12px 14px", fontSize: 13, color: "#0f172a", fontFamily: "ui-monospace,SFMono-Regular,monospace", outline: "none", resize: "vertical", lineHeight: 1.75, background: "#fff" }}
        />
      )}

      {/* Image upload error */}
      {imgError && (
        <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>📷 {imgError}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={e => handleImage(e.target.files?.[0])}
      />
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
    if (!title.trim() || !content.trim()) { setError("Title and story are required."); return; }
    setBusy(true); setError("");
    try {
      const url    = isEdit ? `/api/blogs/${editBlog.id}` : "/api/blogs";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ title, content, category }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save."); return; }
      onSaved(data.blog, isEdit);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const cat = getCat(category);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201, background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "94vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e2e8f0" }} />
        </div>

        {/* Close */}
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 14, right: 16, width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <form onSubmit={handleSubmit} style={{ padding: "4px 20px 44px" }}>
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#ea580c", marginBottom: 3 }}>
              {isEdit ? "Edit Post" : "New Post"}
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
              {isEdit ? "Edit Blog" : "Write a Blog"}
            </h2>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Category</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.map(c => (
                <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 999, border: `1.5px solid ${category === c.id ? c.color : "#e2e8f0"}`, background: category === c.id ? c.bg : "#fff", color: category === c.id ? c.color : "#94a3b8", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  <span>{c.emoji}</span>{c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. My 3-day Langtang Valley trek…"
              maxLength={300}
              style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "#0f172a", outline: "none", fontFamily: "inherit" }}
            />
            <p style={{ fontSize: 10, color: "#cbd5e1", marginTop: 3, textAlign: "right" }}>{title.length}/300</p>
          </div>

          {/* Rich editor */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Story *</label>
              <span style={{ fontSize: 10, color: "#cbd5e1" }}>{content.length.toLocaleString()}/50,000</span>
            </div>
            <RichEditor value={content} onChange={setContent} disabled={busy} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={busy}
            style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: busy ? "#94a3b8" : "#ea580c", color: "#fff", fontSize: 14, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer" }}>
            {busy
              ? (isEdit ? "Saving…" : "Publishing…")
              : isEdit
                ? `Save Changes · ${cat.emoji} ${cat.label}`
                : `Publish · ${cat.emoji} ${cat.label}`
            }
          </button>
        </form>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   READ MODAL (fetches full content)
══════════════════════════════════════════════════════════════ */
function ReadModal({ blog: initial, onClose }) {
  const [blog, setBlog] = useState(initial);
  const [loading, setLoading] = useState(true);
  const color = avatarColor(blog.author_name);

  useEffect(() => {
    fetch(`/api/blogs/${initial.id}`, { credentials: "same-origin" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.blog) setBlog(d.blog); })
      .finally(() => setLoading(false));
  }, [initial.id]);

  const cat = getCat(blog.category);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201, background: "#fff", borderRadius: "24px 24px 0 0", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e2e8f0" }} />
        </div>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 14, right: 16, width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div style={{ padding: "6px 20px 52px" }}>
          {/* Category + meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cat.bg, color: cat.color, borderRadius: 999, padding: "4px 10px", fontSize: 10, fontWeight: 700 }}>
              {cat.emoji} {cat.label}
            </span>
            {blog.updated_at !== blog.created_at && (
              <span style={{ fontSize: 10, color: "#94a3b8" }}>edited</span>
            )}
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 21, fontWeight: 900, color: "#0f172a", lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: 14 }}>
            {blog.title}
          </h2>

          {/* Cover image */}
          {blog.cover_image_url && (
            <img src={blog.cover_image_url} alt={blog.title} style={{ width: "100%", borderRadius: 14, marginBottom: 16, objectFit: "cover", maxHeight: 220 }} />
          )}

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
            {blog.author_avatar
              ? <img src={blog.author_avatar} alt={blog.author_name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
              : <div style={{ width: 34, height: 34, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{initial(blog.author_name)}</div>
            }
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{blog.author_name}</p>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>{timeAgo(blog.created_at)}</p>
            </div>
          </div>

          <div style={{ height: 1, background: "#f1f5f9", marginBottom: 20 }} />

          {/* Content */}
          {loading
            ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[85, 70, 90, 60, 75].map((w, i) => (
                  <div key={i} style={{ height: 12, background: "#f1f5f9", borderRadius: 99, width: `${w}%` }} />
                ))}
              </div>
            : <div
                style={{ fontSize: 14, overflowWrap: "break-word" }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content || blog.excerpt || "") }}
              />
          }
        </div>
      </div>
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
      onDeleted(blog.id);
      onClose();
    } catch { setError("Network error."); } finally { setBusy(false); }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", left: 20, right: 20, bottom: 40, zIndex: 301, background: "#fff", borderRadius: 20, padding: "22px 20px", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Delete this blog?</p>
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginBottom: 18 }}>
          &ldquo;{blog.title}&rdquo; will be permanently removed.
        </p>
        {error && <p style={{ fontSize: 11, color: "#dc2626", marginBottom: 10 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#475569" }}>
            Cancel
          </button>
          <button onClick={confirm} disabled={busy}
            style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: busy ? "#94a3b8" : "#dc2626", color: "#fff", fontSize: 13, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer" }}>
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   BLOG CARD
══════════════════════════════════════════════════════════════ */
function BlogCard({ blog, user, onRead, onEdit, onDelete }) {
  const cat   = getCat(blog.category);
  const color = avatarColor(blog.author_name);
  const owner = canEdit(user, blog);

  return (
    <div style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,23,42,0.06)", position: "relative" }}>
      {/* Category stripe */}
      <div style={{ height: 4, background: cat.color, opacity: 0.8 }} />

      <div style={{ padding: "12px 14px 14px" }}>
        {/* Top row: category + time + action buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7, gap: 6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cat.bg, color: cat.color, borderRadius: 999, padding: "3px 9px", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            {cat.emoji} {cat.label}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{timeAgo(blog.created_at)}</span>

            {/* Edit / Delete — only for owner or admin */}
            {owner && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); onEdit(blog); }}
                  title="Edit"
                  style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(blog); }}
                  title="Delete"
                  style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #fca5a5", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                >
                  <svg width="12" height="13" viewBox="0 0 14 15" fill="none">
                    <path d="M1 3.5h12M5 3.5V2h4v1.5M2.5 3.5l1 9.5h7l1-9.5" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <button onClick={() => onRead(blog)}
          style={{ display: "block", width: "100%", background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", marginBottom: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", lineHeight: 1.35 }}>{blog.title}</p>
        </button>

        {/* Excerpt */}
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 11,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {blog.excerpt || ""}
        </p>

        {/* Author + read more */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {blog.author_avatar
              ? <img src={blog.author_avatar} alt={blog.author_name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
              : <div style={{ width: 24, height: 24, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{initial(blog.author_name)}</div>
            }
            <span style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>{blog.author_name}</span>
          </div>
          <button onClick={() => onRead(blog)} style={{ background: "none", border: "none", fontSize: 11, color: "#ea580c", fontWeight: 700, cursor: "pointer", padding: 0 }}>
            Read →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function BlogClient() {
  const [user,        setUser]        = useState(null);
  const [blogs,       setBlogs]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQ,     setSearchQ]     = useState("");
  const [writeOpen,   setWriteOpen]   = useState(false);
  const [editBlog,    setEditBlog]    = useState(null);
  const [readBlog,    setReadBlog]    = useState(null);
  const [deleteBlog,  setDeleteBlog]  = useState(null);
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
      const url = q ? `/api/blogs?q=${encodeURIComponent(q)}` : "/api/blogs";
      const res = await fetch(url, { credentials: "same-origin" });
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

  /* after write/edit */
  function handleSaved(savedBlog, isEdit) {
    if (isEdit) {
      setBlogs(bs => bs.map(b => b.id === savedBlog.id ? { ...b, ...savedBlog } : b));
    } else {
      fetchBlogs(); // re-fetch to get fresh list with new blog
    }
  }

  function handleDeleted(id) {
    setBlogs(bs => bs.filter(b => b.id !== id));
  }

  return (
    <div style={{ padding: "14px 0 48px" }}>

      {/* ── TOOLBAR ──────────────────────────────────────── */}
      <div style={{ padding: "0 20px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
            Recent Stories
            {!loading && blogs.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginLeft: 5 }}>({blogs.length})</span>
            )}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Search icon */}
            <button
              onClick={() => { setSearchOpen(v => !v); if (searchOpen) setSearchQ(""); }}
              aria-label="Search"
              style={{ width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${searchOpen ? "#ea580c" : "#e2e8f0"}`, background: searchOpen ? "#fff7ed" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              {searchOpen
                ? <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="#ea580c" strokeWidth="2" strokeLinecap="round"/></svg>
                : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#475569" strokeWidth="1.6"/><path d="M10.5 10.5L14 14" stroke="#475569" strokeWidth="1.6" strokeLinecap="round"/></svg>
              }
            </button>

            {/* Write button */}
            {user && (
              <button onClick={() => { setEditBlog(null); setWriteOpen(true); }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 999, border: "none", background: "#ea580c", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                Write Blog
              </button>
            )}
            {user === false && (
              <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 999, border: "1.5px solid #fed7aa", background: "#fff7ed", color: "#ea580c", fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                ✍️ Write
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ marginTop: 12 }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#94a3b8" strokeWidth="1.6"/>
                <path d="M10.5 10.5L14 14" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <input
                ref={searchRef}
                type="search"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search stories, places, tips…"
                style={{ width: "100%", boxSizing: "border-box", paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, border: "1.5px solid #fed7aa", borderRadius: 12, fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", background: "#fffbf7" }}
              />
            </div>
            {searchQ && (
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>
                {loading ? "Searching…" : `${blogs.length} result${blogs.length !== 1 ? "s" : ""} for "${searchQ}"`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── BLOG LIST ────────────────────────────────────── */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: "#f8fafc", border: "1.5px solid #f1f5f9", borderRadius: 18, padding: "16px 15px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ width: "35%", height: 10, background: "#e2e8f0", borderRadius: 99 }} />
                <div style={{ width: "85%", height: 14, background: "#e2e8f0", borderRadius: 99 }} />
                <div style={{ width: "65%", height: 11, background: "#e2e8f0", borderRadius: 99 }} />
                <div style={{ width: "45%", height: 11, background: "#f1f5f9", borderRadius: 99 }} />
              </div>
            ))
          : blogs.length === 0
            ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontSize: 34, marginBottom: 8 }}>{searchQ ? "🔍" : "✍️"}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                  {searchQ ? "No stories found" : "No blogs yet"}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280" }}>
                  {searchQ ? "Try a different keyword" : user ? "Be the first to share your Nepal story!" : "Log in to write the first blog."}
                </p>
                {!searchQ && user && (
                  <button onClick={() => setWriteOpen(true)} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 999, border: "none", background: "#ea580c", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    ✍️ Write Now
                  </button>
                )}
                {!searchQ && user === false && (
                  <Link href="/login" style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", borderRadius: 999, background: "#ea580c", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    Log In to Write
                  </Link>
                )}
              </div>
            )
            : blogs.map(blog => (
              <BlogCard
                key={blog.id}
                blog={blog}
                user={user}
                onRead={setReadBlog}
                onEdit={b => { setEditBlog(b); setWriteOpen(true); }}
                onDelete={setDeleteBlog}
              />
            ))
        }
      </div>

      {/* Guest CTA strip */}
      {!loading && user === false && blogs.length > 0 && (
        <div style={{ margin: "24px 20px 0", background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1.5px solid #fed7aa", borderRadius: 16, padding: "16px 18px", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>✍️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#7c2d12", marginBottom: 2 }}>Share your Nepal story</p>
            <p style={{ fontSize: 11, color: "#9a3412", lineHeight: 1.5 }}>Log in to publish your own travel blog.</p>
          </div>
          <Link href="/login" style={{ padding: "9px 16px", borderRadius: 999, background: "#ea580c", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>Log In</Link>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────── */}
      {writeOpen && (
        <WriteModal
          editBlog={editBlog}
          onClose={() => { setWriteOpen(false); setEditBlog(null); }}
          onSaved={handleSaved}
        />
      )}
      {readBlog  && <ReadModal  blog={readBlog}  onClose={() => setReadBlog(null)} />}
      {deleteBlog && <DeleteConfirm blog={deleteBlog} onClose={() => setDeleteBlog(null)} onDeleted={handleDeleted} />}
    </div>
  );
}
