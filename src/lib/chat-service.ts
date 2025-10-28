import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ChatSession, ChatMessage } from '@/types';

/**
 * Firestore Chat Service
 * Handles CRUD operations for chat messages and sessions
 */

const CHAT_COLLECTION = 'chats';

/**
 * Get or create a chat session for a user and domain
 * @param userId - User's UID
 * @param domain - Roadmap domain
 * @returns ChatSession
 */
export async function getChatSession(
  userId: string,
  domain: string
): Promise<ChatSession> {
  try {
    const chatRef = doc(db, 'users', userId, CHAT_COLLECTION, domain);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      const data = chatSnap.data();

      // Convert Firestore Timestamps to Dates
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        messages: data.messages?.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate() || new Date(),
        })) || [],
      } as ChatSession;
    }

    // Create new session if doesn't exist
    const newSession: ChatSession = {
      userId,
      domain,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveChatSession(newSession);
    return newSession;
  } catch (error) {
    console.error('Error fetching chat session:', error);
    throw new Error('Failed to fetch chat session');
  }
}

/**
 * Save chat session to Firestore
 * @param session - ChatSession to save
 */
export async function saveChatSession(session: ChatSession): Promise<void> {
  try {
    const chatRef = doc(db, 'users', session.userId, CHAT_COLLECTION, session.domain);

    // Convert Dates to Firestore Timestamps
    const firestoreData = {
      ...session,
      createdAt: Timestamp.fromDate(session.createdAt),
      updatedAt: Timestamp.fromDate(session.updatedAt),
      messages: session.messages.map((msg) => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp),
      })),
    };

    await setDoc(chatRef, firestoreData, { merge: true });
  } catch (error) {
    console.error('Error saving chat session:', error);
    throw new Error('Failed to save chat session');
  }
}

/**
 * Add a message to the chat session
 * @param userId - User's UID
 * @param domain - Roadmap domain
 * @param message - ChatMessage to add
 */
export async function addMessageToSession(
  userId: string,
  domain: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<ChatMessage> {
  try {
    // Get current session
    const session = await getChatSession(userId, domain);

    // Create new message with ID and timestamp
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    // Add message to session
    session.messages.push(newMessage);
    session.updatedAt = new Date();

    // Save updated session
    await saveChatSession(session);

    return newMessage;
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message');
  }
}

/**
 * Get chat messages for a domain
 * @param userId - User's UID
 * @param domain - Roadmap domain
 * @param limitCount - Maximum number of messages to return
 * @returns Array of ChatMessages
 */
export async function getChatMessages(
  userId: string,
  domain: string,
  limitCount: number = 50
): Promise<ChatMessage[]> {
  try {
    const session = await getChatSession(userId, domain);

    // Return last N messages
    return session.messages.slice(-limitCount);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
}

/**
 * Clear chat history for a domain
 * @param userId - User's UID
 * @param domain - Roadmap domain
 */
export async function clearChatHistory(
  userId: string,
  domain: string
): Promise<void> {
  try {
    const session = await getChatSession(userId, domain);
    session.messages = [];
    session.updatedAt = new Date();

    await saveChatSession(session);
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw new Error('Failed to clear chat history');
  }
}

/**
 * Update chat session context (user profile, roadmap version)
 * @param userId - User's UID
 * @param domain - Roadmap domain
 * @param context - Context data to update
 */
export async function updateChatContext(
  userId: string,
  domain: string,
  context: ChatSession['context']
): Promise<void> {
  try {
    const chatRef = doc(db, 'users', userId, CHAT_COLLECTION, domain);

    await updateDoc(chatRef, {
      context,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating chat context:', error);
    throw new Error('Failed to update chat context');
  }
}

/**
 * Get all chat domains for a user
 * @param userId - User's UID
 * @returns Array of domain strings
 */
export async function getUserChatDomains(userId: string): Promise<string[]> {
  try {
    const chatsRef = collection(db, 'users', userId, CHAT_COLLECTION);
    const chatsSnap = await getDocs(chatsRef);

    return chatsSnap.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error getting user chat domains:', error);
    return [];
  }
}

/**
 * Check if user has any messages in a chat session
 * @param userId - User's UID
 * @param domain - Roadmap domain
 * @returns boolean
 */
export async function hasChatHistory(
  userId: string,
  domain: string
): Promise<boolean> {
  try {
    const session = await getChatSession(userId, domain);
    return session.messages.length > 0;
  } catch (error) {
    return false;
  }
}
