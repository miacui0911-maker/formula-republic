import {
  doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Settings ───
export async function loadSettings(defaults) {
  try {
    const snap = await getDoc(doc(db, "config", "settings"));
    return snap.exists() ? { ...defaults, ...snap.data() } : defaults;
  } catch { return defaults; }
}

export async function saveSettings(data) {
  await setDoc(doc(db, "config", "settings"), data);
}

// ─── Categories ───
export async function loadCategories(defaults) {
  try {
    const snap = await getDoc(doc(db, "config", "categories"));
    return snap.exists() ? snap.data().list : defaults;
  } catch { return defaults; }
}

export async function saveCategories(list) {
  await setDoc(doc(db, "config", "categories"), { list });
}

// ─── Posts ───
export async function loadPosts(defaults) {
  try {
    const q = query(collection(db, "posts"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) return defaults;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch { return defaults; }
}

export async function savePost(post) {
  await setDoc(doc(db, "posts", post.id), post);
}

export async function deletePost(id) {
  await deleteDoc(doc(db, "posts", id));
}

export async function saveAllPosts(posts) {
  const promises = posts.map((p) => setDoc(doc(db, "posts", p.id), p));
  await Promise.all(promises);
}

// ─── Image Upload (imgbb - free) ───
export async function uploadImage(file) {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    // Fallback: convert to data URL if no API key
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (data.success) return data.data.url;
  throw new Error("Upload failed");
}
