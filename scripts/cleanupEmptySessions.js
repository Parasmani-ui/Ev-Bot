import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  readFileSync('./ev-chatbot-f18d3-firebase-adminsdk-fbsvc-9df7bd61b8.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanupEmptySessions() {
  console.log('🧹 Starting cleanup of empty sessions...\n');

  try {
    // Get all sessions
    const sessionsSnapshot = await db.collection('chat_sessions').get();
    
    if (sessionsSnapshot.empty) {
      console.log('No sessions found.');
      return;
    }

    let deletedCount = 0;
    let keptCount = 0;
    const batch = db.batch();
    let batchCount = 0;

    for (const doc of sessionsSnapshot.docs) {
      const session = doc.data();
      
      // Delete sessions with 0 messages
      if (session.messageCount === 0 || !session.messageCount) {
        console.log(`❌ Deleting empty session: ${doc.id}`);
        console.log(`   - Title: ${session.title || 'New Conversation'}`);
        console.log(`   - Message Count: ${session.messageCount || 0}`);
        
        batch.delete(doc.ref);
        batchCount++;
        deletedCount++;

        // Firestore batch limit is 500 operations
        if (batchCount >= 500) {
          await batch.commit();
          console.log(`\n✅ Committed batch of ${batchCount} deletions\n`);
          batchCount = 0;
        }
      } else {
        keptCount++;
      }
    }

    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`\n✅ Committed final batch of ${batchCount} deletions\n`);
    }

    console.log('━'.repeat(50));
    console.log('\n📊 Cleanup Summary:');
    console.log(`   🗑️  Empty sessions deleted: ${deletedCount}`);
    console.log(`   ✅ Sessions kept: ${keptCount}`);
    console.log(`   📝 Total sessions processed: ${sessionsSnapshot.size}`);
    console.log('\n✅ Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

// Run the cleanup
cleanupEmptySessions();
