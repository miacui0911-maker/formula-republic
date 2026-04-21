# Formula Republic 🏎️

A minimalist motorsport photo journal with a built-in admin panel. Edit everything — photos, descriptions, design, colors — directly on the site. Changes save to Firebase instantly.

---

## 🚀 部署指南 (Setup Guide)

### 第一步：创建 Firebase 项目

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 点击 **"Add project"** → 输入项目名 `formula-republic` → 创建
3. 创建完成后，点击左侧 **⚙️ Project Settings**
4. 滚动到下面 **"Your apps"** → 点击 **Web (</>) 图标**
5. 输入 app nickname: `formula-republic` → 点击 **Register app**
6. 你会看到一段 `firebaseConfig` 代码 → **复制保存这些值**（后面要用）

### 第二步：开启 Firestore 数据库

1. 在 Firebase Console 左侧菜单，点击 **"Firestore Database"**
2. 点击 **"Create database"**
3. 选择 **"Start in test mode"**（开发阶段先用测试模式）
4. 选择离你最近的服务器位置（如 `asia-east1`）→ 点击 **Enable**

### 第三步：开启 Storage（存图片用）

1. 左侧菜单点击 **"Storage"**
2. 点击 **"Get started"**
3. 选择 **"Start in test mode"** → 点击 **Next** → **Done**

### 第四步：推到 GitHub

```bash
# 在项目文件夹里
cd formula-republic
git init
git add .
git commit -m "Initial commit - Formula Republic"

# 在 GitHub 上创建一个新 repo 叫 formula-republic，然后：
git remote add origin https://github.com/YOUR_USERNAME/formula-republic.git
git branch -M main
git push -u origin main
```

### 第五步：部署到 Vercel

1. 打开 [vercel.com](https://vercel.com) → 用 GitHub 账号登录
2. 点击 **"Add New Project"** → 导入你的 `formula-republic` repo
3. 在 **Environment Variables** 里添加以下变量（值来自第一步复制的 firebaseConfig）：

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | 你的 apiKey |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | 你的 authDomain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 你的 projectId |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | 你的 storageBucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 你的 messagingSenderId |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 你的 appId |

4. 点击 **Deploy** → 等待部署完成
5. 你会得到一个链接如 `formula-republic.vercel.app` ✨

### 第六步：（可选）绑定自定义域名

在 Vercel 项目设置里 → **Domains** → 添加你的域名

---

## 📝 使用方法

- 访问你的网站，点击右上角红色 **"Edit Site"** 按钮
- **Posts**: 上传照片、写标题和描述、选分类、设日期
- **Design**: 5个主题预设 + 自定义颜色
- **Categories**: 添加/删除分类
- **Site Info**: 改网站名、标语、关于页文字、页脚

所有修改实时保存到 Firebase，网站自动更新！

---

## 🔒 上线前安全设置

测试完成后，记得修改 Firestore 和 Storage 的安全规则：

**Firestore Rules** (Firebase Console → Firestore → Rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Storage Rules** (Firebase Console → Storage → Rules):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

如果需要加登录保护admin页面，告诉我，我可以帮你加 Firebase Authentication。

---

## 🛠 本地开发

```bash
npm install
cp .env.local.example .env.local
# 填入你的 Firebase config
npm run dev
```

打开 http://localhost:3000
