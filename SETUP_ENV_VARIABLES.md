# 🔐 Environment Variables Setup Guide

## ⚡ QUICK SETUP

### **Step 1: Create `.env.local` File**

Create a file named **`.env.local`** in your project root directory:

```
C:\Users\Vikash Lanjhikar\Desktop\ev policy bot\.env.local
```

### **Step 2: Copy & Paste This Content**

Copy the entire content below into your `.env.local` file:

```bash
# ==============================================
# FIREBASE WEB CONFIGURATION
# ==============================================
# These are your Firebase Web App credentials
# Get from: Firebase Console → Project Settings → Web App

VITE_FIREBASE_API_KEY=AIzaSyBnUFo0orDDzyH_Abj7RwAznD3v4YwftLY
VITE_FIREBASE_AUTH_DOMAIN=ev-chatbot-f18d3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ev-chatbot-f18d3
VITE_FIREBASE_STORAGE_BUCKET=ev-chatbot-f18d3.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1035071919615
VITE_FIREBASE_APP_ID=1:1035071919615:web:37e1365829fcd98a2b03ca
VITE_FIREBASE_MEASUREMENT_ID=G-5X0GT8R5N7
```

### **Step 3: Save the File**

Make sure:
- ✅ File is named exactly: `.env.local` (with the dot at the beginning)
- ✅ File is in the project root (same folder as `package.json`)
- ✅ No extra spaces or characters

### **Step 4: Restart Dev Server**

```bash
# Stop server (Ctrl+C if running)
# Then start again:
npm run dev
```

---

## ✅ VERIFICATION

After restarting, your app should work without errors. If you see:

```
Firebase configuration is missing!
```

Then the `.env.local` file is not in the right place or variables are incorrect.

---

## 🔐 SECURITY NOTES

### **Are these values secret?**

**Short Answer:** These Firebase Web config values are **PUBLIC** and **SAFE** to expose in your frontend code.

**Why?**
- These are **client-side** credentials meant to be visible in browser
- Your data security comes from **Firestore Security Rules**, not from hiding these values
- Every Firebase web app exposes these values in the browser's developer tools

### **What IS secret?**

**DO NOT expose these:**
- ❌ Firebase Admin SDK credentials (`*firebase-adminsdk*.json`)
- ❌ Private keys
- ❌ Service account keys
- ❌ Database connection strings with passwords

**These are already protected** by `.gitignore`!

---

## 📊 WHAT CHANGED?

### **Before (Hardcoded):**

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBnUFo0orDDzyH_Abj7RwAznD3v4YwftLY",
  authDomain: "ev-chatbot-f18d3.firebaseapp.com",
  // ... hardcoded values
};
```

### **After (Environment Variables):**

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... from environment variables
};
```

---

## 🌐 FOR VERCEL DEPLOYMENT

When deploying to Vercel, add these **same variables** in:

**Vercel Dashboard → Your Project → Settings → Environment Variables**

```bash
VITE_FIREBASE_API_KEY=AIzaSyBnUFo0orDDzyH_Abj7RwAznD3v4YwftLY
VITE_FIREBASE_AUTH_DOMAIN=ev-chatbot-f18d3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ev-chatbot-f18d3
VITE_FIREBASE_STORAGE_BUCKET=ev-chatbot-f18d3.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1035071919615
VITE_FIREBASE_APP_ID=1:1035071919615:web:37e1365829fcd98a2b03ca
VITE_FIREBASE_MEASUREMENT_ID=G-5X0GT8R5N7
```

**Important:** 
- Add to ALL environments: Production, Preview, Development
- Redeploy after adding variables

---

## 🎯 BENEFITS OF USING ENV VARIABLES

1. **🔄 Flexibility:** Easy to switch between dev/staging/prod Firebase projects
2. **🔒 Best Practice:** Separate configuration from code
3. **🚀 Deployment:** Different values for different environments
4. **👥 Team:** Each developer can use their own Firebase project
5. **📦 Clean Code:** No hardcoded credentials in source files

---

## 🚨 TROUBLESHOOTING

### **Error: Firebase configuration is missing**

**Cause:** `.env.local` file not found or variables not loaded

**Solution:**
1. Verify file is named exactly `.env.local` (not `.env.local.txt`)
2. Verify file is in project root (same folder as `package.json`)
3. Verify variables have `VITE_` prefix
4. Restart dev server: `npm run dev`

---

### **Error: Cannot find module 'firebase/app'**

**Cause:** Firebase packages not installed

**Solution:**
```bash
npm install
```

---

### **Variables showing as `undefined` in console**

**Cause:** Missing `VITE_` prefix or server not restarted

**Solution:**
1. All variables MUST start with `VITE_`
2. Restart dev server after creating/modifying `.env.local`

---

## 📝 QUICK CHECKLIST

After setup, verify:

- [ ] Created `.env.local` in project root
- [ ] All 7 Firebase variables added with `VITE_` prefix
- [ ] Restarted dev server (`npm run dev`)
- [ ] App loads without errors
- [ ] Can log in as admin
- [ ] Can send chat messages
- [ ] Chat history appears in sidebar

---

## 💡 VITE ENVIRONMENT VARIABLES

### **Why `VITE_` prefix?**

Vite only exposes variables with `VITE_` prefix to your browser code for security.

**In your code, access with:**
```typescript
import.meta.env.VITE_FIREBASE_API_KEY
```

**DO NOT use:**
```typescript
process.env.VITE_FIREBASE_API_KEY  // ❌ Wrong! (This is for Node.js)
```

---

## 🔗 RELATED FILES

- ✅ **`config/firebase.ts`** - Now uses environment variables
- ✅ **`.gitignore`** - Excludes `.env.local` from Git
- ✅ **`.env.local`** - YOU NEED TO CREATE THIS

---

## 📞 NEED HELP?

If you're still having issues:

1. Check console for specific error messages
2. Verify `.env.local` file location (must be in project root)
3. Ensure all variables are spelled correctly
4. Restart your dev server

---

**🎉 You're all set! Your Firebase config is now secure and flexible!**
