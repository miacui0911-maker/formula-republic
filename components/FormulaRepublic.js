"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  loadSettings, saveSettings as fbSaveSettings,
  loadCategories, saveCategories as fbSaveCategories,
  loadPosts, savePost, deletePost as fbDeletePost, saveAllPosts,
  uploadImage,
} from "../lib/data";

/* ─── defaults ─── */
const DEFAULT_SETTINGS = {
  siteName: "Formula Republic",
  tagline: "Velocity in every frame",
  accentColor: "#d4001a",
  bgColor: "#f5f4f0",
  cardBg: "#ffffff",
  textColor: "#111111",
  mutedColor: "#6b6b6b",
  showTagline: true,
  aboutText: "A visual journal capturing the speed, drama, and beauty of motorsport — from the paddock to the podium.",
  footerText: "© 2026 Formula Republic",
};

const DEFAULT_CATEGORIES = ["All", "Formula 1", "Paddock Life", "Behind the Scenes", "Pit Lane", "Race Day"];

const DEFAULT_POSTS = [
  { id: "demo-1", title: "Lights Out in Shanghai", description: "The moment before chaos — standing start under the lights at Shanghai International Circuit.", imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80", category: "Race Day", date: "2026-04-10", featured: true },
  { id: "demo-2", title: "Tyre Wall Stories", description: "Each mark on the barrier tells a story of a thousand near-misses.", imageUrl: "https://images.unsplash.com/photo-1541348263662-e068662d82af?w=800&q=80", category: "Behind the Scenes", date: "2026-04-08", featured: false },
  { id: "demo-3", title: "Garage Quiet", description: "5:30 AM. The garage before the storm. Tools laid out with surgical precision.", imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", category: "Pit Lane", date: "2026-04-05", featured: false },
];

/* ─── icon ─── */
const Icon = ({ name, size = 20 }) => {
  const p = { plus: "M12 5v14M5 12h14", edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z", trash: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6", x: "M18 6L6 18M6 6l12 12", star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z", settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z", upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12", arrowLeft: "M19 12H5M12 19l-7-7 7-7", loader: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={p[name]} /></svg>;
};

/* ═══════════════════ MAIN APP ═══════════════════ */
export default function FormulaRepublic() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loaded, setLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [view, setView] = useState("gallery");
  const [selectedPost, setSelectedPost] = useState(null);
  const [adminTab, setAdminTab] = useState("posts");
  const [editingPost, setEditingPost] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    (async () => {
      const [s, p, c] = await Promise.all([
        loadSettings(DEFAULT_SETTINGS),
        loadPosts(DEFAULT_POSTS),
        loadCategories(DEFAULT_CATEGORIES),
      ]);
      setSettings(s);
      setPosts(p);
      setCategories(c);
      setLoaded(true);
    })();
  }, []);

  const updateSettings = useCallback(async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await fbSaveSettings(next);
    flash("Settings saved");
  }, [settings]);

  const updatePosts = useCallback(async (next) => {
    setPosts(next);
  }, []);

  const updateCategories = useCallback(async (next) => {
    setCategories(next);
    await fbSaveCategories(next);
  }, []);

  const flash = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 2200); };

  const filteredPosts = activeCategory === "All" ? posts : posts.filter(p => p.category === activeCategory);
  const featuredPost = posts.find(p => p.featured) || posts[0];

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", settings.accentColor);
    document.documentElement.style.setProperty("--bg", settings.bgColor);
    document.documentElement.style.setProperty("--card", settings.cardBg);
    document.documentElement.style.setProperty("--text", settings.textColor);
    document.documentElement.style.setProperty("--muted", settings.mutedColor);
  }, [settings]);

  if (!loaded) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#999" }}>
      Loading…
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {notification && <div className="fr-notif">{notification}</div>}

      {/* HEADER */}
      <header style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,.06)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "baseline", gap: 10 }} onClick={() => { setView("gallery"); setSelectedPost(null); }}>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: "var(--text)", letterSpacing: "-0.02em" }}>{settings.siteName}</h1>
          {settings.showTagline && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{settings.tagline}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {view === "admin" ? (
            <button className="fr-btn" onClick={() => setView("gallery")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 100, background: "var(--text)", color: "var(--bg)", fontSize: 13, fontWeight: 600 }}><Icon name="eye" size={15} /> View Site</button>
          ) : (
            <button className="fr-btn" onClick={() => { setView("admin"); setAdminTab("posts"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 100, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600 }}><Icon name="settings" size={15} /> Edit Site</button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 60px" }}>
        {view === "gallery" && <GalleryView posts={filteredPosts} categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} featuredPost={featuredPost} onSelect={p => { setSelectedPost(p); setView("post"); }} settings={settings} />}
        {view === "post" && selectedPost && <PostView post={selectedPost} onBack={() => { setView("gallery"); setSelectedPost(null); }} settings={settings} />}
        {view === "admin" && <AdminPanel settings={settings} updateSettings={updateSettings} posts={posts} setPosts={updatePosts} categories={categories} saveCategories={updateCategories} adminTab={adminTab} setAdminTab={setAdminTab} editingPost={editingPost} setEditingPost={setEditingPost} flash={flash} />}
      </main>

      <footer style={{ padding: 32, textAlign: "center", borderTop: "1px solid rgba(0,0,0,.06)", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--muted)", letterSpacing: ".04em" }}>{settings.footerText}</footer>
    </div>
  );
}

/* ═══════════════════ GALLERY VIEW ═══════════════════ */
function GalleryView({ posts, categories, activeCategory, setActiveCategory, featuredPost, onSelect, settings }) {
  return (
    <div className="fr-fade">
      {featuredPost && activeCategory === "All" && (
        <div onClick={() => onSelect(featuredPost)} style={{ margin: "32px 0", cursor: "pointer", position: "relative", borderRadius: 10, overflow: "hidden" }}>
          <img src={featuredPost.imageUrl} alt={featuredPost.title} className="fr-hero-img" style={{ display: "block" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "60px 32px 28px", background: "linear-gradient(transparent,rgba(0,0,0,.7))", borderRadius: "0 0 10px 10px" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: settings.accentColor, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700 }}>{featuredPost.category || "Featured"}</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "#fff", marginTop: 6, lineHeight: 1.2 }}>{featuredPost.title}</h2>
            <p style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 14, color: "rgba(255,255,255,.75)", marginTop: 8, maxWidth: 520, lineHeight: 1.5 }}>{featuredPost.description?.slice(0, 140)}{featuredPost.description?.length > 140 ? "…" : ""}</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, margin: "24px 0", flexWrap: "wrap" }}>
        {categories.map(cat => <button key={cat} className={`fr-cat-btn ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>{cat}</button>)}
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
          <p style={{ fontSize: 16 }}>No posts yet</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Click &quot;Edit Site&quot; to add your first photo</p>
        </div>
      ) : (
        <div className="fr-masonry">
          {posts.filter(p => !(activeCategory === "All" && p.featured && p.id === featuredPost?.id)).map(post => (
            <div key={post.id} className="fr-card" onClick={() => onSelect(post)} style={{ background: "var(--card)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(0,0,0,.04)" }}>
              <img src={post.imageUrl} alt={post.title} style={{ width: "100%", display: "block", minHeight: 180, objectFit: "cover", background: "#e5e5e5" }} onError={e => { e.target.style.minHeight = "180px"; e.target.style.background = "#e0ddd8"; }} />
              <div style={{ padding: "16px 18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700 }}>{post.category}</span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--muted)" }}>{post.date}</span>
                </div>
                <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: "var(--text)", lineHeight: 1.3 }}>{post.title}</h3>
                {post.description && <p style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 13, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>{post.description.slice(0, 100)}{post.description.length > 100 ? "…" : ""}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ POST VIEW ═══════════════════ */
function PostView({ post, onBack, settings }) {
  return (
    <div className="fr-fade" style={{ maxWidth: 720, margin: "0 auto" }}>
      <button className="fr-btn" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 28, marginBottom: 20, background: "transparent", color: "var(--muted)", fontSize: 13, fontWeight: 500 }}><Icon name="arrowLeft" size={16} /> Back to gallery</button>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: settings.accentColor, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700 }}>{post.category}</span>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--muted)" }}>{post.date}</span>
      </div>
      <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 36, color: "var(--text)", lineHeight: 1.2, marginBottom: 24 }}>{post.title}</h1>
      <img src={post.imageUrl} alt={post.title} style={{ width: "100%", borderRadius: 8, display: "block", marginBottom: 28, background: "#e5e5e5" }} />
      <p style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 16, color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{post.description}</p>
    </div>
  );
}

/* ═══════════════════ ADMIN PANEL ═══════════════════ */
function AdminPanel({ settings, updateSettings, posts, setPosts, categories, saveCategories, adminTab, setAdminTab, editingPost, setEditingPost, flash }) {
  return (
    <div className="fr-fade" style={{ marginTop: 24 }}>
      <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: "var(--text)", marginBottom: 4 }}>Edit Your Site</h2>
      <p style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Changes save to Firebase instantly — your live site updates automatically.</p>
      <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,.08)", marginBottom: 28, gap: 4, overflowX: "auto" }}>
        {[{ key: "posts", label: "Posts" }, { key: "design", label: "Design" }, { key: "categories", label: "Categories" }, { key: "site", label: "Site Info" }].map(t => (
          <button key={t.key} className={`atab ${adminTab === t.key ? "active" : ""}`} onClick={() => { setAdminTab(t.key); setEditingPost(null); }}>{t.label}</button>
        ))}
      </div>
      {adminTab === "posts" && <PostsAdmin posts={posts} setPosts={setPosts} categories={categories} editingPost={editingPost} setEditingPost={setEditingPost} flash={flash} />}
      {adminTab === "design" && <DesignAdmin settings={settings} updateSettings={updateSettings} />}
      {adminTab === "categories" && <CategoriesAdmin categories={categories} saveCategories={saveCategories} flash={flash} />}
      {adminTab === "site" && <SiteAdmin settings={settings} updateSettings={updateSettings} />}
    </div>
  );
}

/* ─── Posts Admin ─── */
function PostsAdmin({ posts, setPosts, categories, editingPost, setEditingPost, flash }) {
  const emptyPost = { id: "", title: "", description: "", imageUrl: "", category: categories[1] || "", date: new Date().toISOString().split("T")[0], featured: false };
  const [form, setForm] = useState(emptyPost);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { setForm(editingPost || emptyPost); }, [editingPost]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(f => ({ ...f, imageUrl: url }));
      flash("Image uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      flash("Upload failed — check Firebase Storage is enabled");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!form.title.trim()) { flash("Title is required"); return; }
    if (!form.imageUrl.trim()) { flash("Image is required"); return; }

    const postToSave = editingPost ? { ...form } : { ...form, id: "post-" + Date.now() };
    
    let next;
    if (editingPost) {
      next = posts.map(p => p.id === editingPost.id ? postToSave : p);
    } else {
      next = [postToSave, ...posts];
    }

    if (form.featured) {
      next = next.map(p => p.id === postToSave.id ? p : { ...p, featured: false });
      await saveAllPosts(next);
    } else {
      await savePost(postToSave);
    }

    setPosts(next);
    setEditingPost(null);
    setForm(emptyPost);
    flash(editingPost ? "Post updated" : "Post published");
  };

  const handleDelete = async (id) => {
    await fbDeletePost(id);
    setPosts(posts.filter(p => p.id !== id));
    flash("Post deleted");
  };

  const cardStyle = { background: "var(--card)", borderRadius: 10, padding: 24, border: "1px solid rgba(0,0,0,.06)" };
  const labelStyle = { fontFamily: "'Libre Franklin',sans-serif", fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 4, display: "block" };

  return (
    <div>
      <div style={{ ...cardStyle, marginBottom: 28 }}>
        <h3 style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={editingPost ? "edit" : "plus"} size={18} /> {editingPost ? "Edit Post" : "New Post"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input className="fr-input" placeholder="Post title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="fr-textarea" placeholder="Description / caption — tell the story behind this photo" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <select className="fr-input" style={{ flex: 1, minWidth: 140 }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {categories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="fr-input" type="date" style={{ flex: 1, minWidth: 140 }} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Image</label>
            <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
              <input className="fr-input" placeholder="Paste image URL…" value={form.imageUrl?.startsWith("data:") ? "(uploaded)" : form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} style={{ flex: 1 }} />
              <button className="fr-btn" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "10px 16px", borderRadius: 6, background: uploading ? "#ccc" : "#eee", color: "#555", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                {uploading ? <><Icon name="loader" size={15} /> Uploading…</> : <><Icon name="upload" size={15} /> Upload</>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            </div>
            {form.imageUrl && <img src={form.imageUrl} alt="preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 6, marginTop: 10, background: "#e5e5e5" }} />}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "'Libre Franklin',sans-serif", fontSize: 14, color: "var(--text)" }}>
            <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
            <Icon name="star" size={15} /> Feature this post (hero banner)
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="fr-btn" onClick={handleSave} style={{ padding: "10px 28px", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600 }}>{editingPost ? "Update Post" : "Publish Post"}</button>
            {editingPost && <button className="fr-btn" onClick={() => { setEditingPost(null); setForm(emptyPost); }} style={{ padding: "10px 20px", borderRadius: 8, background: "#eee", color: "#555", fontSize: 14 }}>Cancel</button>}
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 14, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>All Posts ({posts.length})</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {posts.map(post => (
          <div key={post.id} style={{ display: "flex", gap: 14, alignItems: "center", background: "var(--card)", borderRadius: 8, padding: 12, border: "1px solid rgba(0,0,0,.04)" }}>
            <img src={post.imageUrl} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, background: "#e5e5e5", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 14, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {post.featured && <span style={{ color: "var(--accent)", marginRight: 6 }}>★</span>}{post.title}
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{post.category} · {post.date}</div>
            </div>
            <button className="fr-btn" onClick={() => setEditingPost(post)} style={{ background: "#f0f0f0", color: "#555", padding: 8, borderRadius: 6 }}><Icon name="edit" size={15} /></button>
            <button className="fr-btn" onClick={() => handleDelete(post.id)} style={{ background: "#fef2f2", color: "#dc2626", padding: 8, borderRadius: 6 }}><Icon name="trash" size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Design Admin ─── */
function DesignAdmin({ settings, updateSettings }) {
  const colors = [
    { key: "accentColor", label: "Accent" }, { key: "bgColor", label: "Background" },
    { key: "cardBg", label: "Card" }, { key: "textColor", label: "Text" }, { key: "mutedColor", label: "Muted" },
  ];
  const presets = [
    { name: "Scuderia", accentColor: "#d4001a", bgColor: "#f5f4f0", cardBg: "#ffffff", textColor: "#111111", mutedColor: "#6b6b6b" },
    { name: "Night Race", accentColor: "#00d2ff", bgColor: "#0f0f13", cardBg: "#1a1a22", textColor: "#eeeef0", mutedColor: "#7a7a88" },
    { name: "Racing Green", accentColor: "#00694b", bgColor: "#f7f8f5", cardBg: "#ffffff", textColor: "#1a1f1a", mutedColor: "#6b7b6b" },
    { name: "Gulf", accentColor: "#e85d26", bgColor: "#e8f0f4", cardBg: "#ffffff", textColor: "#1c2d3f", mutedColor: "#6a8299" },
    { name: "Midnight", accentColor: "#f5a623", bgColor: "#111118", cardBg: "#1c1c26", textColor: "#e8e8ed", mutedColor: "#6e6e7f" },
  ];
  const cardStyle = { background: "var(--card)", borderRadius: 10, padding: 24, border: "1px solid rgba(0,0,0,.06)" };

  return (
    <div>
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Theme Presets</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {presets.map(p => (
            <button key={p.name} className="fr-btn" onClick={() => updateSettings({ accentColor: p.accentColor, bgColor: p.bgColor, cardBg: p.cardBg, textColor: p.textColor, mutedColor: p.mutedColor })} style={{ padding: "8px 16px", borderRadius: 8, background: p.bgColor, color: p.textColor, fontSize: 13, fontWeight: 600, border: `2px solid ${p.accentColor}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: p.accentColor, display: "inline-block" }} />{p.name}
            </button>
          ))}
        </div>
      </div>
      <div style={cardStyle}>
        <h3 style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Custom Colors</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 16 }}>
          {colors.map(c => (
            <div key={c.key}>
              <label style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 6, display: "block" }}>{c.label}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="csw" style={{ background: settings[c.key] }}><input type="color" value={settings[c.key]} onChange={e => updateSettings({ [c.key]: e.target.value })} /></div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--muted)" }}>{settings[c.key]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Categories Admin ─── */
function CategoriesAdmin({ categories, saveCategories, flash }) {
  const [newCat, setNewCat] = useState("");
  const add = async () => {
    const n = newCat.trim();
    if (!n) return;
    if (categories.includes(n)) { flash("Already exists"); return; }
    await saveCategories([...categories, n]);
    setNewCat("");
    flash("Category added");
  };
  const remove = async (c) => { if (c === "All") return; await saveCategories(categories.filter(x => x !== c)); flash("Category removed"); };

  return (
    <div style={{ background: "var(--card)", borderRadius: 10, padding: 24, border: "1px solid rgba(0,0,0,.06)" }}>
      <h3 style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Manage Categories</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input className="fr-input" placeholder="New category name" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <button className="fr-btn" onClick={add} style={{ padding: "10px 20px", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>Add</button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: cat === "All" ? "#f0f0f0" : "#f8f8f6", border: "1px solid rgba(0,0,0,.08)", fontFamily: "'Libre Franklin',sans-serif", fontSize: 13, color: "var(--text)" }}>
            {cat}
            {cat !== "All" && <button className="fr-btn" onClick={() => remove(cat)} style={{ background: "transparent", color: "#999", padding: 0, display: "flex" }}><Icon name="x" size={14} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Site Info Admin ─── */
function SiteAdmin({ settings, updateSettings }) {
  const labelStyle = { fontFamily: "'Libre Franklin',sans-serif", fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 4, display: "block" };
  return (
    <div style={{ background: "var(--card)", borderRadius: 10, padding: 24, border: "1px solid rgba(0,0,0,.06)", display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 style={{ fontFamily: "'Libre Franklin',sans-serif", fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Site Information</h3>
      <div><label style={labelStyle}>Site Name</label><input className="fr-input" value={settings.siteName} onChange={e => updateSettings({ siteName: e.target.value })} /></div>
      <div><label style={labelStyle}>Tagline</label><input className="fr-input" value={settings.tagline} onChange={e => updateSettings({ tagline: e.target.value })} /></div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Libre Franklin',sans-serif", fontSize: 14, color: "var(--text)", cursor: "pointer" }}>
        <input type="checkbox" checked={settings.showTagline} onChange={e => updateSettings({ showTagline: e.target.checked })} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} /> Show tagline in header
      </label>
      <div><label style={labelStyle}>About Text</label><textarea className="fr-textarea" value={settings.aboutText} onChange={e => updateSettings({ aboutText: e.target.value })} /></div>
      <div><label style={labelStyle}>Footer Text</label><input className="fr-input" value={settings.footerText} onChange={e => updateSettings({ footerText: e.target.value })} /></div>
    </div>
  );
}
