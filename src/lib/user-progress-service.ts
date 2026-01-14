import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { WeeklyProgress, CompletionStats } from '@/types/weekly-resources';
import { getAvailableWeeks, loadWeeklyResource } from './weekly-resources-service';

/**
 * Generate deterministic document ID for resource progress
 * @param domain - The domain
 * @param weekNumber - The week number
 * @returns Document ID in format "{domain}-{weekNumber}"
 */
function getProgressDocId(domain: string, weekNumber: number): string {
  return `${domain}-${weekNumber}`;
}

/**
 * Get user's progress for a specific week
 * @param userId - The user ID
 * @param domain - The domain
 * @param weekNumber - The week number
 * @returns WeeklyProgress or null if not found
 */
export async function getUserProgress(
  userId: string,
  domain: string,
  weekNumber: number
): Promise<WeeklyProgress | null> {
  try {
    const docId = getProgressDocId(domain, weekNumber);
    const docRef = doc(db, 'users', userId, 'resourceProgress', docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();

    return {
      id: docSnap.id,
      userId: data.userId,
      domain: data.domain,
      weekNumber: data.weekNumber,
      startedAt: data.startedAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate(),
      completedResources: data.completedResources || [],
      progress: data.progress || 0,
      lastAccessedAt: data.lastAccessedAt?.toDate(),
    };
  } catch (error: any) {
    // Check for permission errors and fail gracefully
    if (error?.code === 'permission-denied') {
      console.warn('Permission denied for user progress - Firestore rules need to be updated');
      return null;
    }
    console.error('Error getting user progress:', error);
    return null;
  }
}

/**
 * Initialize progress for a week (called when user first accesses a week)
 * @param userId - The user ID
 * @param domain - The domain
 * @param weekNumber - The week number
 * @returns The created WeeklyProgress
 */
export async function initializeProgress(
  userId: string,
  domain: string,
  weekNumber: number
): Promise<WeeklyProgress> {
  const docId = getProgressDocId(domain, weekNumber);
  const docRef = doc(db, 'users', userId, 'resourceProgress', docId);

  const progressData: WeeklyProgress = {
    id: docId,
    userId,
    domain,
    weekNumber,
    startedAt: new Date(),
    completedResources: [],
    progress: 0,
    lastAccessedAt: new Date(),
  };

  try {
    await setDoc(docRef, {
      userId,
      domain,
      weekNumber,
      startedAt: Timestamp.fromDate(progressData.startedAt),
      completedResources: [],
      progress: 0,
      lastAccessedAt: Timestamp.fromDate(progressData.lastAccessedAt!),
    });

    return progressData;
  } catch (error) {
    console.error('Error initializing progress:', error);
    throw new Error('Failed to initialize progress');
  }
}

/**
 * Calculate progress percentage
 * @param completedResources - Array of completed resource IDs
 * @param totalResources - Total number of resources
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(
  completedResources: string[],
  totalResources: number
): number {
  if (totalResources === 0) return 0;
  return Math.round((completedResources.length / totalResources) * 100);
}

/**
 * Update resource completion status
 * @param userId - The user ID
 * @param domain - The domain
 * @param weekNumber - The week number
 * @param resourceId - The resource ID to update
 * @param completed - Whether the resource is completed
 * @returns Updated WeeklyProgress
 */
export async function updateResourceCompletion(
  userId: string,
  domain: string,
  weekNumber: number,
  resourceId: string,
  completed: boolean
): Promise<WeeklyProgress> {
  try {
    // Get or create progress
    let progress = await getUserProgress(userId, domain, weekNumber);
    if (!progress) {
      progress = await initializeProgress(userId, domain, weekNumber);
    }

    // Update completed resources array
    const completedResources = completed
      ? [...progress.completedResources, resourceId].filter(
          (id, index, self) => self.indexOf(id) === index
        ) // Remove duplicates
      : progress.completedResources.filter((id) => id !== resourceId);

    // Load resource to get total count
    const resource = await loadWeeklyResource(domain, weekNumber);
    const totalResources = resource.resources.length + 1; // +1 for main article

    // Calculate new progress
    const newProgress = calculateProgress(completedResources, totalResources);

    // Check if week is fully completed
    const isFullyCompleted = newProgress === 100;
    const completedAt = isFullyCompleted ? new Date() : undefined;

    // Update Firestore
    const docId = getProgressDocId(domain, weekNumber);
    const docRef = doc(db, 'users', userId, 'resourceProgress', docId);

    const updateData: any = {
      completedResources,
      progress: newProgress,
      lastAccessedAt: Timestamp.now(),
    };

    if (isFullyCompleted) {
      updateData.completedAt = Timestamp.fromDate(completedAt!);
    }

    await updateDoc(docRef, updateData);

    return {
      id: docId,
      userId,
      domain,
      weekNumber,
      startedAt: progress.startedAt,
      completedAt,
      completedResources,
      progress: newProgress,
      lastAccessedAt: new Date(),
    };
  } catch (error) {
    console.error('Error updating resource completion:', error);
    throw new Error('Failed to update resource completion');
  }
}

/**
 * Mark an entire week as completed
 * @param userId - The user ID
 * @param domain - The domain
 * @param weekNumber - The week number
 * @returns Updated WeeklyProgress
 */
export async function markWeekCompleted(
  userId: string,
  domain: string,
  weekNumber: number
): Promise<WeeklyProgress> {
  try {
    // Load resource to get all resource IDs
    const resource = await loadWeeklyResource(domain, weekNumber);
    const allResourceIds = [
      resource.mainArticle.id,
      ...resource.resources.map((r) => r.id),
    ];

    // Get or create progress
    let progress = await getUserProgress(userId, domain, weekNumber);
    if (!progress) {
      progress = await initializeProgress(userId, domain, weekNumber);
    }

    // Update Firestore
    const docId = getProgressDocId(domain, weekNumber);
    const docRef = doc(db, 'users', userId, 'resourceProgress', docId);

    const completedAt = new Date();

    await updateDoc(docRef, {
      completedResources: allResourceIds,
      progress: 100,
      completedAt: Timestamp.fromDate(completedAt),
      lastAccessedAt: Timestamp.now(),
    });

    return {
      id: docId,
      userId,
      domain,
      weekNumber,
      startedAt: progress.startedAt,
      completedAt,
      completedResources: allResourceIds,
      progress: 100,
      lastAccessedAt: new Date(),
    };
  } catch (error) {
    console.error('Error marking week completed:', error);
    throw new Error('Failed to mark week as completed');
  }
}

/**
 * Check if a specific resource is completed
 * @param userId - The user ID
 * @param domain - The domain
 * @param weekNumber - The week number
 * @param resourceId - The resource ID to check
 * @returns True if the resource is completed
 */
export async function isResourceCompleted(
  userId: string,
  domain: string,
  weekNumber: number,
  resourceId: string
): Promise<boolean> {
  const progress = await getUserProgress(userId, domain, weekNumber);
  return progress?.completedResources.includes(resourceId) || false;
}

/**
 * Get completion statistics for a domain
 * @param userId - The user ID
 * @param domain - The domain
 * @returns Completion statistics
 */
export async function getCompletionStats(
  userId: string,
  domain: string
): Promise<CompletionStats> {
  try {
    // Get available weeks from manifest
    const availableWeeks = await getAvailableWeeks(domain);
    const totalWeeks = availableWeeks.length;

    if (totalWeeks === 0) {
      return {
        domain,
        totalWeeks: 0,
        completedWeeks: 0,
        completionPercentage: 0,
        totalResourcesCompleted: 0,
      };
    }

    // Get all progress docs for this domain
    const progressRef = collection(db, 'users', userId, 'resourceProgress');
    const q = query(progressRef, where('domain', '==', domain));
    const querySnapshot = await getDocs(q);

    let completedWeeks = 0;
    let totalResourcesCompleted = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.progress === 100) {
        completedWeeks++;
      }
      totalResourcesCompleted += data.completedResources?.length || 0;
    });

    const completionPercentage = Math.round(
      (completedWeeks / totalWeeks) * 100
    );

    return {
      domain,
      totalWeeks,
      completedWeeks,
      completionPercentage,
      totalResourcesCompleted,
    };
  } catch (error: any) {
    // Check for permission errors and fail gracefully
    if (error?.code === 'permission-denied') {
      console.warn('Permission denied for completion stats - Firestore rules need to be updated');
    } else {
      console.error('Error getting completion stats:', error);
    }
    return {
      domain,
      totalWeeks: 0,
      completedWeeks: 0,
      completionPercentage: 0,
      totalResourcesCompleted: 0,
    };
  }
}
