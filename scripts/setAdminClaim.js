import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'ev-chatbot-f18d3-firebase-adminsdk-fbsvc-9df7bd61b8.json'), 'utf8')
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Admin email - CHANGE THIS to your admin email
const ADMIN_EMAIL = 'admin@jharkhand.gov.in';

async function setAdminClaim() {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(ADMIN_EMAIL);
    
    // Set custom admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    console.log('✅ SUCCESS!');
    console.log(`Admin claim set for user: ${ADMIN_EMAIL}`);
    console.log(`User ID: ${user.uid}`);
    console.log('\nThe user now has admin privileges.');
    console.log('They may need to log out and log back in for changes to take effect.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR setting admin claim:');
    console.error(error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n📝 Please create the user first in Firebase Console:');
      console.log('1. Go to Firebase Console → Authentication');
      console.log('2. Click "Add user"');
      console.log(`3. Enter email: ${ADMIN_EMAIL}`);
      console.log('4. Set a password');
      console.log('5. Run this script again');
    }
    
    process.exit(1);
  }
}

console.log('🔥 Setting admin claim for Firebase user...\n');
setAdminClaim();
