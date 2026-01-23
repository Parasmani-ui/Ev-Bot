/**
 * Deploy Firestore Rules and Indexes
 * 
 * This script deploys both the firestore.rules and firestore.indexes.json to Firebase
 * 
 * Usage: node scripts/deployFirestore.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const rulesFile = path.join(projectRoot, 'firestore.rules');
const indexesFile = path.join(projectRoot, 'firestore.indexes.json');

console.log('🔥 Firebase Firestore Deployment\n');
console.log('This will deploy:');
console.log('  1. Security Rules (firestore.rules)');
console.log('  2. Composite Indexes (firestore.indexes.json)');
console.log('');

// Check if files exist
const errors = [];

if (!fs.existsSync(rulesFile)) {
  errors.push('❌ firestore.rules file not found');
}

if (!fs.existsSync(indexesFile)) {
  errors.push('❌ firestore.indexes.json file not found');
}

if (errors.length > 0) {
  console.error('Errors found:');
  errors.forEach(err => console.error('  ' + err));
  process.exit(1);
}

console.log('✅ Found firestore.rules');
console.log('✅ Found firestore.indexes.json');
console.log('');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'ignore' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.error('❌ Firebase CLI is not installed!');
  console.error('');
  console.error('Install it with:');
  console.error('  npm install -g firebase-tools');
  console.error('');
  console.error('Then login:');
  console.error('  firebase login');
  process.exit(1);
}

console.log('');
console.log('⚠️  IMPORTANT NOTES:');
console.log('  • Make sure you are logged in: firebase login');
console.log('  • Indexes may take 2-5 minutes to build after deployment');
console.log('  • You can monitor index status in Firebase Console');
console.log('');

// Ask for confirmation
console.log('📤 Deploying Firestore configuration...\n');

try {
  // Deploy firestore rules and indexes
  execSync('firebase deploy --only firestore', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  console.log('\n✅ Deployment successful!\n');
  console.log('📋 Next steps:');
  console.log('  1. Wait 2-5 minutes for indexes to build');
  console.log('  2. Check index status: https://console.firebase.google.com/project/ev-chatbot-f18d3/firestore/indexes');
  console.log('  3. Refresh your application (Ctrl+F5)');
  console.log('  4. Chat history should now appear in the sidebar!');
  console.log('');
  
} catch (error) {
  console.error('\n❌ Deployment failed!\n');
  console.error('💡 Troubleshooting:');
  console.error('  1. Make sure you are logged in: firebase login');
  console.error('  2. Check that you have permissions for project: ev-chatbot-f18d3');
  console.error('  3. Try deploying from Firebase Console manually:');
  console.error('     Rules: https://console.firebase.google.com/project/ev-chatbot-f18d3/firestore/rules');
  console.error('     Indexes: https://console.firebase.google.com/project/ev-chatbot-f18d3/firestore/indexes');
  console.error('');
  process.exit(1);
}
