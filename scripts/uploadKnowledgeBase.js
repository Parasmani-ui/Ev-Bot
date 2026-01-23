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

const db = admin.firestore();

// Read EV Policy Context from .env.local
function getEVPolicyContext() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    
    // Extract EV_POLICY_CONTEXT value
    const match = envContent.match(/EV_POLICY_CONTEXT="(.+?)"/s);
    if (match && match[1]) {
      return match[1];
    }
    
    console.warn('⚠️  EV_POLICY_CONTEXT not found in .env.local');
    return null;
  } catch (error) {
    console.error('❌ Error reading .env.local:', error.message);
    return null;
  }
}

async function uploadKnowledgeBase() {
  try {
    console.log('🔥 Uploading knowledge base to Firestore...\n');
    
    const policyContext = getEVPolicyContext();
    
    if (!policyContext) {
      console.error('❌ Cannot upload: Policy context not found in .env.local');
      console.log('\nPlease ensure .env.local exists with EV_POLICY_CONTEXT variable.');
      process.exit(1);
    }
    
    // Upload to Firestore
    await db.collection('knowledge_base').doc('ev_policy_2022').set({
      name: 'Jharkhand Electric Vehicle Policy 2022',
      content: policyContext,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0',
      source: 'EV JH.pdf',
      policyDate: 'October 6, 2022',
      validity: '5 years from notification'
    });
    
    console.log('✅ SUCCESS!');
    console.log('Knowledge base uploaded to Firestore');
    console.log('Collection: knowledge_base');
    console.log('Document ID: ev_policy_2022');
    console.log(`Content size: ${policyContext.length} characters`);
    console.log('\nYou can view it in Firebase Console → Firestore Database');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR uploading knowledge base:');
    console.error(error.message);
    process.exit(1);
  }
}

uploadKnowledgeBase();
