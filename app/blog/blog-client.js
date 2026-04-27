"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ── constants ─────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "general",      label: "General",       emoji: "✍️",  color: "#6b7280", bg: "#f3f4f6" },
  { id: "trekking",     label: "Trekking",      emoji: "🏔️", color: "#0369a1", bg: "#e0f2fe" },
  { id: "food",         label: "Food",           emoji: "🍜", color: "#b45309", bg: "#fef3c7" },
  { id: "culture",      label: "Culture",        emoji: "🏛️", color: "#7c3aed", bg: "#ede9fe" },
  { id: "hidden-gems",  label: "Hidden Gems",    emoji: "💎", color: "#0891b2", bg: "#cffafe" },
  { id: "heritage",     label: "Heritage",       emoji: "🕌", color: "#92400e", bg: "#fef3c7" },
  { id: "photography",  label: "Photography",    emoji: "📸", color: "#be185d", bg: "#fce7f3" },
];

function getCatStyle(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" });
}

function authorInitial(name) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

/* ── avatar colour from name ───────────────────────────────── */
const AVATAR_COLORS = ["#0369a1","#7c3aed","#059669","#dc2626","#d97706","#0891b2","#be185d","#6d28d9"];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/* ══════════════════════════════════════════════════════════════
   WRITE MODAL
══════════════════════════════════════════════════════════════ */
function WriteModal({ onClose, onPublished }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ title, content, category }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to publish."); return; }
      onPublished(data.blog);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const cat = getCatStyle(category);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, backdropFilter: "blur(3px)" }}
      />

      {/* Sheet */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201,
        background: "#fff", borderRadius: "24px 24px 0 0",
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e2e8f0" }} />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: "absolute", top: 14, right: 16, width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <form onSubmit={handleSubmit} style={{ padding: "4px 20px 40px" }}>
          {/* Heading */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#ea580c", marginBottom: 3 }}>
              New Post
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Write a Blog
            </h2>
          </div>

          {/* Category pills */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Category
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "5px 11px", borderRadius: 999,
                    border: `1.5px solid ${category === c.id ? c.color : "#e2e8f0"}`,
                    background: category === c.id ? c.bg : "#fff",
                    color: category === c.id ? c.color : "#6b7280",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My 3-day Langtang Valley trek…"
              maxLength={300}
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1.5px solid #e2e8f0", borderRadius: 12,
                padding: "11px 14px", fontSize: 14, color: "#0f172a",
                outline: "none", fontFamily: "inherit",
              }}
            />
            <p style={{ fontSize: 10, color: "#cbd5e1", marginTop: 4, textAlign: "right" }}>{title.length}/300</p>
          </div>

          {/* Content */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              Story *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience, tips, stories about Nepal…"
              rows={7}
              maxLength={50000}
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1.5px solid #e2e8f0", borderRadius: 12,
                padding: "11px 14px", fontSize: 13, color: "#0f172a",
                outline: "none", resize: "vertical", fontFamily: "inherit",
                lineHeight: 1.7,
              }}
            />
            <p style={{ fontSize: 10, color: "#cbd5e1", marginTop: 2, textAlign: "right" }}>{content.length}/50,000</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: submitting ? "#94a3b8" : "#ea580c",
              color: "#fff", fontSize: 14, fontWeight: 800,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Publishing…" : `Publish · ${getCatStyle(category).emoji} ${getCatStyle(category).label}`}
          </button>
        </form>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   READ MODAL
══════════════════════════════════════════════════════════════ */
function ReadModal({ blog, onClose }) {
  const cat = getCatStyle(blog.category);
  const color = avatarColor(blog.author_name);
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, backdropFilter: "blur(3px)" }}
      />
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201,
        background: "#fff", borderRadius: "24px 24px 0 0",
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e2e8f0" }} />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: "absolute", top: 14, right: 16, width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div style={{ padding: "6px 20px 48px" }}>
          {/* Category */}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cat.bg, color: cat.color, borderRadius: 999, padding: "4px 10px", fontSize: 10, fontWeight: 700, marginBottom: 12 }}>
            {cat.emoji} {cat.label}
          </span>

          {/* Title */}
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: 12 }}>
            {blog.title}
          </h2>

          {/* Author row */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
            {blog.author_avatar ? (
              <img src={blog.author_avatar} alt={blog.author_name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                {authorInitial(blog.author_name)}
              </div>
            )}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{blog.author_name}</p>
              <p style={{ fontSize: 11, color: "#94a3b8" }}>{timeAgo(blog.created_at)}</p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#f1f5f9", marginBottom: 20 }} />

          {/* Content */}
          <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {blog.content || blog.excerpt}
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   BLOG CARD
══════════════════════════════════════════════════════════════ */
function BlogCard({ blog, onClick }) {
  const cat = getCatStyle(blog.category);
  const color = avatarColor(blog.author_name);
  return (
    <button
      onClick={onClick}
      style={{
        background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 18,
        padding: 0, textAlign: "left", cursor: "pointer",
        boxShadow: "0 2px 12px rgba(15,23,42,0.06)", width: "100%", overflow: "hidden",
      }}
    >
      {/* Category stripe */}
      <div style={{ height: 4, background: cat.color, opacity: 0.75 }} />

      <div style={{ padding: "12px 15px 14px" }}>
        {/* Category + time */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cat.bg, color: cat.color, borderRadius: 999, padding: "3px 9px", fontSize: 10, fontWeight: 700 }}>
            {cat.emoji} {cat.label}
          </span>
          <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{timeAgo(blog.created_at)}</span>
        </div>

        {/* Title */}
        <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", lineHeight: 1.35, marginBottom: 6 }}>
          {blog.title}
        </p>

        {/* Excerpt */}
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 10,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {blog.excerpt || ""}
        </p>

        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {blog.author_avatar ? (
            <img src={blog.author_avatar} alt={blog.author_name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {authorInitial(blog.author_name)}
            </div>
          )}
          <span style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>{blog.author_name}</span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>· Read more →</span>
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function BlogClient() {
  const [user, setUser] = useState(null);         // null = not checked, false = not logged in
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [writeOpen, setWriteOpen] = useState(false);
  const [readBlog, setReadBlog] = useState(null);
  const searchRef = useRef(null);

  /* ── fetch auth ─────────────────────────────────────────── */
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setUser(d?.user || false))
      .catch(() => setUser(false));
  }, []);

  /* ── fetch blogs ─────────────────────────────────────────── */
  const fetchBlogs = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const url = q ? `/api/blogs?q=${encodeURIComponent(q)}` : "/api/blogs";
      const res = await fetch(url, { credentials: "same-origin" });
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  /* ── search debounce ────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => fetchBlogs(searchQ), 380);
    return () => clearTimeout(t);
  }, [searchQ, fetchBlogs]);

  /* ── focus search input when opened ─────────────────────── */
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  /* ── new blog prepended ─────────────────────────────────── */
  function handlePublished() {
    fetchBlogs();
  }

  return (
    <div style={{ padding: "14px 0 48px" }}>

      {/* ── TOOLBAR ──────────────────────────────────────── */}
      <div style={{ padding: "0 20px", marginBottom: searchOpen ? 0 : 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          {/* Section label */}
          <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
            Recent Stories {!loading && blogs.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginLeft: 4 }}>
                ({blogs.length})
              </span>
            )}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Search icon */}
            <button
              onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setSearchQ(""); }}
              aria-label={searchOpen ? "Close search" : "Search blogs"}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `1.5px solid ${searchOpen ? "#ea580c" : "#e2e8f0"}`,
                background: searchOpen ? "#fff7ed" : "#fff",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {searchOpen ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="#475569" strokeWidth="1.6" />
                  <path d="M10.5 10.5L14 14" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* Write Blog button (logged-in only) */}
            {user && (
              <button
                onClick={() => setWriteOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "8px 14px", borderRadius: 999, border: "none",
                  background: "#ea580c", color: "#fff",
                  fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1v11M1 6.5h11" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Write Blog
              </button>
            )}

            {/* Login prompt for guests */}
            {user === false && (
              <Link
                href="/login"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "8px 14px", borderRadius: 999,
                  border: "1.5px solid #fed7aa",
                  background: "#fff7ed", color: "#ea580c",
                  fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0,
                }}
              >
                ✍️ Write
              </Link>
            )}
          </div>
        </div>

        {/* ── SEARCH BAR ──────────────────────────────────── */}
        {searchOpen && (
          <div style={{ marginTop: 12 }}>
            <div style={{ position: "relative" }}>
              <svg
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="15" height="15" viewBox="0 0 16 16" fill="none"
              >
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#94a3b8" strokeWidth="1.6" />
                <path d="M10.5 10.5L14 14" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                type="search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search stories, places, tips…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                  border: "1.5px solid #fed7aa", borderRadius: 12,
                  fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit",
                  background: "#fffbf7",
                }}
              />
            </div>
            {searchQ && (
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                {loading ? "Searching…" : `${blogs.length} result${blogs.length !== 1 ? "s" : ""} for "${searchQ}"`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── BLOG LIST ────────────────────────────────────── */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          /* Skeleton cards */
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: "#f8fafc", border: "1.5px solid #f1f5f9", borderRadius: 18, padding: "16px 15px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ width: "35%", height: 10, background: "#e2e8f0", borderRadius: 99 }} />
              <div style={{ width: "85%", height: 14, background: "#e2e8f0", borderRadius: 99 }} />
              <div style={{ width: "65%", height: 11, background: "#e2e8f0", borderRadius: 99 }} />
              <div style={{ width: "45%", height: 11, background: "#f1f5f9", borderRadius: 99 }} />
            </div>
          ))
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>{searchQ ? "🔍" : "✍️"}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
              {searchQ ? "No stories found" : "No blogs yet"}
            </p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              {searchQ
                ? `Try a different search term`
                : user
                  ? "Be the first to share your Nepal story!"
                  : "Log in to write the first blog post."}
            </p>
            {!searchQ && user && (
              <button
                onClick={() => setWriteOpen(true)}
                style={{ marginTop: 16, padding: "10px 20px", borderRadius: 999, border: "none", background: "#ea580c", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                ✍️ Write Now
              </button>
            )}
            {!searchQ && user === false && (
              <Link href="/login" style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", borderRadius: 999, background: "#ea580c", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                Log In to Write
              </Link>
            )}
          </div>
        ) : (
          blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} onClick={() => setReadBlog(blog)} />
          ))
        )}
      </div>

      {/* ── WRITE CTA for guests at bottom ───────────────── */}
      {!loading && user === false && blogs.length > 0 && (
        <div style={{ margin: "24px 20px 0", background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "1.5px solid #fed7aa", borderRadius: 16, padding: "16px 18px", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>✍️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#7c2d12", marginBottom: 2 }}>Share your Nepal story</p>
            <p style={{ fontSize: 11, color: "#9a3412", lineHeight: 1.5 }}>Log in to publish your own travel blog.</p>
          </div>
          <Link href="/login" style={{ padding: "9px 16px", borderRadius: 999, background: "#ea580c", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
            Log In
          </Link>
        </div>
      )}

      {/* ── MODALS ───────────────────────────────────────── */}
      {writeOpen && (
        <WriteModal
          onClose={() => setWriteOpen(false)}
          onPublished={handlePublished}
        />
      )}
      {readBlog && (
        <ReadModal blog={readBlog} onClose={() => setReadBlog(null)} />
      )}
    </div>
  );
}
