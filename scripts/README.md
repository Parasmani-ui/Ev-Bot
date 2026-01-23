# Firebase Admin Scripts

These scripts help you set up Firebase for your EV Policy Bot.

## Prerequisites

```bash
npm install firebase-admin
```

## Scripts

### 1. `setAdminClaim.js` - Grant Admin Privileges

Sets the custom admin claim for a Firebase user, allowing them to access the admin dashboard.

**Usage:**
```bash
node scripts/setAdminClaim.js
```

**Before running:**
1. Create a user in Firebase Console → Authentication
2. Update `ADMIN_EMAIL` in the script to match your admin email
3. Run the script

**What it does:**
- Finds the user by email
- Sets `{ admin: true }` custom claim
- Grants access to admin dashboard

---

### 2. `uploadKnowledgeBase.js` - Upload EV Policy to Firestore

Uploads the EV Policy context from `.env.local` to Firestore for centralized storage.

**Usage:**
```bash
node scripts/uploadKnowledgeBase.js
```

**Before running:**
- Ensure `.env.local` exists with `EV_POLICY_CONTEXT`

**What it does:**
- Reads policy context from `.env.local`
- Uploads to Firestore → `knowledge_base` collection
- Document ID: `ev_policy_2022`

---

## Setup Steps

1. **Install dependencies:**
   ```bash
   npm install firebase-admin
   ```

2. **Create admin user in Firebase Console:**
   - Go to Authentication → Users
   - Click "Add user"
   - Enter email and password
   - Click "Add user"

3. **Set admin claim:**
   ```bash
   node scripts/setAdminClaim.js
   ```

4. **Upload knowledge base:**
   ```bash
   node scripts/uploadKnowledgeBase.js
   ```

5. **Test:**
   - Start your app: `npm run dev`
   - Try to login as admin
   - Check Firestore Console for data

---

## Troubleshooting

### Error: "Cannot find module 'firebase-admin'"
**Solution:** Run `npm install firebase-admin`

### Error: "User not found"
**Solution:** Create the user in Firebase Console first

### Error: "Permission denied"
**Solution:** Check that the service account JSON file path is correct

### Error: "Cannot read .env.local"
**Solution:** Make sure `.env.local` exists in the root directory

---

## Security Note

These scripts use the Firebase Admin SDK with service account credentials.
**Never commit** the service account JSON file to git!

It's already in `.gitignore`, but double-check:
```bash
git status
```

Should NOT show: `ev-chatbot-f18d3-firebase-adminsdk-fbsvc-9df7bd61b8.json`

---

## Need Help?

Check the main setup guide: `FIREBASE_SETUP_GUIDE.md`
