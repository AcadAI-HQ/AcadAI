import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserRoadmap, RoadmapFile, RoadmapModification } from '@/types';

/**
 * Firestore Roadmap Service
 * Handles CRUD operations for personalized user roadmaps
 */

const ROADMAP_COLLECTION = 'roadmaps';
const BASE_ROADMAP_VERSION = 'v1.0.0'; // Update this when base templates change

/**
 * Get a user's personalized roadmap from Firestore
 * @param userId - User's UID
 * @param domain - Roadmap domain (e.g., 'frontend', 'backend')
 * @returns UserRoadmap if exists, null otherwise
 */
export async function getUserRoadmap(
  userId: string,
  domain: string
): Promise<UserRoadmap | null> {
  try {
    const roadmapRef = doc(db, 'users', userId, ROADMAP_COLLECTION, domain);
    const roadmapSnap = await getDoc(roadmapRef);

    if (roadmapSnap.exists()) {
      const data = roadmapSnap.data();

      // Convert Firestore Timestamp to Date
      return {
        ...data,
        lastModified: data.lastModified?.toDate() || new Date(),
        modifications: data.modifications?.map((mod: any) => ({
          ...mod,
          timestamp: mod.timestamp?.toDate() || new Date(),
        })),
      } as UserRoadmap;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user roadmap:', error);
    throw new Error('Failed to fetch roadmap from Firestore');
  }
}

/**
 * Load base roadmap template from public folder
 * @param domain - Roadmap domain
 * @returns RoadmapFile from JSON
 */
export async function loadBaseRoadmap(domain: string): Promise<RoadmapFile> {
  try {
    const response = await fetch(`/roadmaps-new/${domain}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load base roadmap: ${response.statusText}`);
    }

    const data = await response.json();
    return data as RoadmapFile;
  } catch (error) {
    console.error('Error loading base roadmap:', error);
    throw new Error(`Failed to load base roadmap for domain: ${domain}`);
  }
}

/**
 * Get roadmap for user - returns personalized version if exists, otherwise base template
 * @param userId - User's UID
 * @param domain - Roadmap domain
 * @returns RoadmapFile (either personalized or base template)
 */
export async function getRoadmapForUser(
  userId: string,
  domain: string
): Promise<{ roadmap: RoadmapFile; isPersonalized: boolean }> {
  try {
    // First, try to get personalized roadmap
    const userRoadmap = await getUserRoadmap(userId, domain);

    if (userRoadmap) {
      return {
        roadmap: userRoadmap.content,
        isPersonalized: userRoadmap.customized,
      };
    }

    // If no personalized version, load base template
    const baseRoadmap = await loadBaseRoadmap(domain);

    return {
      roadmap: baseRoadmap,
      isPersonalized: false,
    };
  } catch (error) {
    console.error('Error getting roadmap for user:', error);
    throw error;
  }
}

/**
 * Initialize a user's roadmap from base template
 * This creates a copy in Firestore that can be customized later
 * @param userId - User's UID
 * @param domain - Roadmap domain
 * @returns Created UserRoadmap
 */
export async function initializeUserRoadmap(
  userId: string,
  domain: string
): Promise<UserRoadmap> {
  try {
    // Load base template
    const baseRoadmap = await loadBaseRoadmap(domain);

    // Create user roadmap document
    const userRoadmap: UserRoadmap = {
      userId,
      domain,
      baseRoadmapVersion: BASE_ROADMAP_VERSION,
      customized: false,
      lastModified: new Date(),
      content: baseRoadmap,
      modifications: [
        {
          timestamp: new Date(),
          type: 'base_update',
          description: 'Initialized from base template',
          modifiedBy: 'system',
        },
      ],
    };

    // Save to Firestore
    await saveUserRoadmap(userRoadmap);

    return userRoadmap;
  } catch (error) {
    console.error('Error initializing user roadmap:', error);
    throw new Error('Failed to initialize user roadmap');
  }
}

/**
 * Save or update a user's roadmap in Firestore
 * @param userRoadmap - UserRoadmap object to save
 */
export async function saveUserRoadmap(userRoadmap: UserRoadmap): Promise<void> {
  try {
    const roadmapRef = doc(
      db,
      'users',
      userRoadmap.userId,
      ROADMAP_COLLECTION,
      userRoadmap.domain
    );

    // Convert Date objects to Firestore Timestamps
    const firestoreData = {
      ...userRoadmap,
      lastModified: Timestamp.fromDate(userRoadmap.lastModified),
      modifications: userRoadmap.modifications?.map((mod) => ({
        ...mod,
        timestamp: Timestamp.fromDate(mod.timestamp),
      })),
    };

    await setDoc(roadmapRef, firestoreData, { merge: true });
  } catch (error) {
    console.error('Error saving user roadmap:', error);
    throw new Error('Failed to save roadmap to Firestore');
  }
}

/**
 * Update user roadmap content (for AI customization or manual edits)
 * @param userId - User's UID
 * @param domain - Roadmap domain
 * @param newContent - Updated RoadmapFile
 * @param modificationType - Type of modification
 * @param description - Description of changes
 */
export async function updateUserRoadmap(
  userId: string,
  domain: string,
  newContent: RoadmapFile,
  modificationType: 'ai_customization' | 'manual_edit' = 'manual_edit',
  description: string = 'Roadmap updated'
): Promise<void> {
  try {
    const roadmapRef = doc(db, 'users', userId, ROADMAP_COLLECTION, domain);

    // Check if roadmap exists
    const existingRoadmap = await getUserRoadmap(userId, domain);

    if (!existingRoadmap) {
      // Initialize if doesn't exist
      await initializeUserRoadmap(userId, domain);
    }

    // Create modification record
    const modification: RoadmapModification = {
      timestamp: new Date(),
      type: modificationType,
      description,
      modifiedBy: modificationType === 'ai_customization' ? 'gemini' : 'user',
    };

    // Update roadmap
    await updateDoc(roadmapRef, {
      content: newContent,
      customized: true,
      lastModified: serverTimestamp(),
      modifications: [
        ...(existingRoadmap?.modifications || []).map((mod) => ({
          ...mod,
          timestamp: Timestamp.fromDate(mod.timestamp),
        })),
        {
          ...modification,
          timestamp: Timestamp.fromDate(modification.timestamp),
        },
      ],
    });
  } catch (error) {
    console.error('Error updating user roadmap:', error);
    throw new Error('Failed to update roadmap');
  }
}

/**
 * Delete a user's personalized roadmap (revert to base template)
 * @param userId - User's UID
 * @param domain - Roadmap domain
 */
export async function deleteUserRoadmap(
  userId: string,
  domain: string
): Promise<void> {
  try {
    const roadmapRef = doc(db, 'users', userId, ROADMAP_COLLECTION, domain);

    // Instead of deleting, we reset to base template
    await initializeUserRoadmap(userId, domain);
  } catch (error) {
    console.error('Error deleting user roadmap:', error);
    throw new Error('Failed to delete roadmap');
  }
}

/**
 * Check if user has customized roadmap
 * @param userId - User's UID
 * @param domain - Roadmap domain
 * @returns boolean indicating if roadmap is customized
 */
export async function isRoadmapCustomized(
  userId: string,
  domain: string
): Promise<boolean> {
  const userRoadmap = await getUserRoadmap(userId, domain);
  return userRoadmap?.customized || false;
}

/**
 * Get all roadmap domains for a user
 * @param userId - User's UID
 * @returns Array of domain strings
 */
export async function getUserRoadmapDomains(userId: string): Promise<string[]> {
  try {
    // This is a simple implementation - could be enhanced with a query
    const domains = [
      'frontend',
      'backend',
      'fullstack',
      'ml',
      'devops',
      'cybersecurity',
      'data-science',
    ];

    const userDomains: string[] = [];

    for (const domain of domains) {
      const roadmap = await getUserRoadmap(userId, domain);
      if (roadmap) {
        userDomains.push(domain);
      }
    }

    return userDomains;
  } catch (error) {
    console.error('Error getting user roadmap domains:', error);
    return [];
  }
}
