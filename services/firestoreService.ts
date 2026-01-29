import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  setDoc,
  getDoc,
  Timestamp,
  updateDoc,
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ChatSession, UserQueryRecord } from '../types';

/**
 * Firestore Service for managing user sessions and queries
 */

// Collections
const SESSIONS_COLLECTION = 'chat_sessions';
const QUERIES_COLLECTION = 'user_queries';
const KNOWLEDGE_BASE_COLLECTION = 'knowledge_base';

/**
 * Get or create a user session
 */
export const getOrCreateSession = async (userId: string): Promise<string> => {
  try {
    // Create a new session
    const sessionRef = await addDoc(collection(db, SESSIONS_COLLECTION), {
      userId,
      createdAt: Timestamp.now(),
      lastActivityAt: Timestamp.now(),
      title: 'New Conversation',
      messageCount: 0
    });
    
    return sessionRef.id;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Get all sessions for a user
 */
export const getUserSessions = async (userId: string): Promise<ChatSession[]> => {
  try {
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('lastActivityAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        userId: data.userId || '',
        title: data.title || 'New Conversation',
        createdAt: data.createdAt,
        lastActivityAt: data.lastActivityAt,
        messageCount: data.messageCount || 0
      };
    });
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

/**
 * Update session activity
 */
export const updateSessionActivity = async (sessionId: string, title?: string) => {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const updateData: any = {
      lastActivityAt: Timestamp.now()
    };
    
    if (title) {
      updateData.title = title;
    }
    
    await updateDoc(sessionRef, updateData);
  } catch (error) {
    console.error('Error updating session:', error);
  }
};

/**
 * Save a query to Firestore
 */
export const saveQuery = async (sessionId: string, userId: string, query: string, response: string): Promise<void> => {
  try {
    await addDoc(collection(db, QUERIES_COLLECTION), {
      sessionId,
      userId,
      query,
      response,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now()
    });

    // Update session activity and message count
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (sessionDoc.exists()) {
      const data = sessionDoc.data();
      const messageCount = (data.messageCount || 0) + 1;
      
      // Auto-generate title from first query
      let title = data.title;
      if (messageCount === 1 && query) {
        title = query.substring(0, 50) + (query.length > 50 ? '...' : '');
      }
      
      await updateDoc(sessionRef, {
        lastActivityAt: Timestamp.now(),
        messageCount,
        title
      });
    }
  } catch (error) {
    console.error('Error saving query to Firestore:', error);
    throw error;
  }
};

/**
 * Get all queries for a session
 */
export const getSessionQueries = async (sessionId: string): Promise<UserQueryRecord[]> => {
  try {
    const q = query(
      collection(db, QUERIES_COLLECTION),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        sessionId: data.sessionId,
        query: data.query,
        response: data.response,
        timestamp: data.timestamp?.toMillis() || Date.now()
      };
    });
  } catch (error) {
    console.error('Error getting session queries:', error);
    return [];
  }
};

/**
 * Get all queries for admin dashboard
 */
export const getAllQueries = async (): Promise<UserQueryRecord[]> => {
  try {
    const q = query(
      collection(db, QUERIES_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        sessionId: data.sessionId,
        query: data.query,
        response: data.response,
        timestamp: data.timestamp?.toMillis() || Date.now()
      };
    });
  } catch (error) {
    console.error('Error getting all queries:', error);
    return [];
  }
};

/**
 * Get queries for a specific user
 */
export const getUserQueries = async (userId: string): Promise<UserQueryRecord[]> => {
  try {
    const q = query(
      collection(db, QUERIES_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        sessionId: data.sessionId,
        query: data.query,
        response: data.response,
        timestamp: data.timestamp?.toMillis() || Date.now()
      };
    });
  } catch (error) {
    console.error('Error getting user queries:', error);
    return [];
  }
};

/**
 * Store knowledge base context (for reference)
 */
export const storeKnowledgeBase = async (policyName: string, content: string): Promise<void> => {
  try {
    const docRef = doc(db, KNOWLEDGE_BASE_COLLECTION, policyName);
    await setDoc(docRef, {
      name: policyName,
      content,
      updatedAt: Timestamp.now(),
      version: '1.0'
    });
    console.log('Knowledge base stored successfully');
  } catch (error) {
    console.error('Error storing knowledge base:', error);
    throw error;
  }
};

/**
 * Get knowledge base context
 */
export const getKnowledgeBase = async (policyName: string): Promise<string | null> => {
  try {
    const docRef = doc(db, KNOWLEDGE_BASE_COLLECTION, policyName);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().content;
    }
    return null;
  } catch (error) {
    console.error('Error getting knowledge base:', error);
    return null;
  }
};

/**
 * Delete a session and all its queries
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    // Delete all queries in the session
    const q = query(
      collection(db, QUERIES_COLLECTION),
      where('sessionId', '==', sessionId)
    );
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(docSnapshot =>
      deleteDoc(docSnapshot.ref)
    );
    await Promise.all(deletePromises);
    
    // Delete the session
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await deleteDoc(sessionRef);
    
    console.log('Session deleted successfully');
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

export const firestoreService = {
  getOrCreateSession,
  getUserSessions,
  updateSessionActivity,
  saveQuery,
  getSessionQueries,
  getAllQueries,
  getUserQueries,
  storeKnowledgeBase,
  getKnowledgeBase,
  deleteSession
};
