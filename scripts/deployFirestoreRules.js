/**
 * Deploy Firestore Security Rules
 * 
 * This script deploys the firestore.rules file to your Firebase project
 * 
 * Usage: node scripts/deployFirestoreRules.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const rulesFile = path.join(projectRoot, 'firestore.rules');

console.log('🔥 Firebase Firestore Rules Deployment\n');

// Check if firestore.rules exists
if (!fs.existsSync(rulesFile)) {
  console.error('❌ Error: firestore.rules file not found!');
  console.error('   Expected location:', rulesFile);
  process.exit(1);
}

console.log('✅ Found firestore.rules file');
console.log('📋 Rules file location:', rulesFile);

console.log('\n⚠️  NOTE: To deploy rules, you need Firebase CLI installed.');
console.log('   If you haven\'t installed it yet, run:');
console.log('   npm install -g firebase-tools\n');
console.log('   Then login with:');
console.log('   firebase login\n');

console.log('📤 Deploying Firestore rules...\n');

try {
  // Deploy firestore rules
  execSync('firebase deploy --only firestore:rules', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  console.log('\n✅ Firestore rules deployed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Create composite indexes (see FIREBASE_FIX_GUIDE.md)');
  console.log('   2. Refresh your application');
  console.log('   3. Check that chat history appears in sidebar');
  
} catch (error) {
  console.error('\n❌ Deployment failed!');
  console.error('\n💡 Manual deployment option:');
  console.error('   1. Go to: https://console.firebase.google.com/project/ev-chatbot-f18d3/firestore/rules');
  console.error('   2. Copy contents from: firestore.rules');
  console.error('   3. Paste into Firebase Console');
  console.error('   4. Click "Publish"');
  process.exit(1);
}
