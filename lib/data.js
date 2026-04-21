import {
  doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, orderBy,
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL,
} from "firebase/storage";
import { db, storage } from "./firebase";

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

// ─── Image Upload (Firebase Storage - full quality) ───
export async function uploadImage(file) {
  const name = `images/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, name);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
