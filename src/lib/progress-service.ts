/**
 * Progress tracking service for learning path
 * Stores user progress in Firestore
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RoadmapProgress } from '@/types';

/**
 * Get all domain progress for a user (for dashboard overview)
 */
export async function getAllUserProgress(userId: string): Promise<Map<string, RoadmapProgress>> {
  const progressMap = new Map<string, RoadmapProgress>();

  try {
    const progressCollectionRef = collection(db, 'users', userId, 'roadmapProgress');
    const progressSnapshot = await getDocs(progressCollectionRef);

    progressSnapshot.forEach((doc) => {
      const data = doc.data();
      progressMap.set(doc.id, {
        domain: data.domain || doc.id,
        completedSteps: data.completedSteps || [],
        currentStepId: data.currentStepId || null,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        totalSteps: data.totalSteps || 0,
        completedCount: data.completedCount || 0,
      });
    });
  } catch (error) {
    console.error('[progress-service] Error fetching all progress:', error);
  }

  return progressMap;
}

/**
 * Get user's progress for a specific domain
 */
export async function getUserProgress(userId: string, domain: string): Promise<RoadmapProgress | null> {
  try {
    const progressRef = doc(db, 'users', userId, 'roadmapProgress', domain);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      const data = progressDoc.data();
      return {
        domain: data.domain,
        completedSteps: data.completedSteps || [],
        currentStepId: data.currentStepId || null,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        totalSteps: data.totalSteps || 0,
        completedCount: data.completedCount || 0,
      };
    }
    return null;
  } catch (error) {
    console.error('[progress-service] Error fetching progress:', error);
    return null;
  }
}

/**
 * Initialize progress for a domain (called when user first views a roadmap)
 */
export async function initializeProgress(
  userId: string,
  domain: string,
  totalSteps: number
): Promise<RoadmapProgress> {
  const progressRef = doc(db, 'users', userId, 'roadmapProgress', domain);

  const initialProgress: RoadmapProgress = {
    domain,
    completedSteps: [],
    currentStepId: '0-0', // First section, first subtopic
    lastUpdated: new Date(),
    totalSteps,
    completedCount: 0,
  };

  await setDoc(progressRef, {
    ...initialProgress,
    lastUpdated: serverTimestamp(),
  });

  return initialProgress;
}

/**
 * Mark a step as complete
 */
export async function markStepComplete(
  userId: string,
  domain: string,
  stepId: string,
  nextStepId: string | null
): Promise<void> {
  const progressRef = doc(db, 'users', userId, 'roadmapProgress', domain);
  const progressDoc = await getDoc(progressRef);

  if (!progressDoc.exists()) {
    console.error('[progress-service] Progress document not found');
    return;
  }

  const currentData = progressDoc.data();
  const completedSteps = currentData.completedSteps || [];

  // Don't add duplicates
  if (!completedSteps.includes(stepId)) {
    completedSteps.push(stepId);
  }

  await updateDoc(progressRef, {
    completedSteps,
    currentStepId: nextStepId,
    completedCount: completedSteps.length,
    lastUpdated: serverTimestamp(),
  });
}

/**
 * Mark a step as incomplete (undo completion)
 */
export async function markStepIncomplete(
  userId: string,
  domain: string,
  stepId: string
): Promise<void> {
  const progressRef = doc(db, 'users', userId, 'roadmapProgress', domain);
  const progressDoc = await getDoc(progressRef);

  if (!progressDoc.exists()) {
    return;
  }

  const currentData = progressDoc.data();
  const completedSteps = (currentData.completedSteps || []).filter(
    (id: string) => id !== stepId
  );

  await updateDoc(progressRef, {
    completedSteps,
    completedCount: completedSteps.length,
    lastUpdated: serverTimestamp(),
  });
}

/**
 * Update current step (for navigation without completing)
 */
export async function updateCurrentStep(
  userId: string,
  domain: string,
  stepId: string
): Promise<void> {
  const progressRef = doc(db, 'users', userId, 'roadmapProgress', domain);

  await updateDoc(progressRef, {
    currentStepId: stepId,
    lastUpdated: serverTimestamp(),
  });
}

/**
 * Calculate progress percentage
 */
export function calculateProgressPercentage(progress: RoadmapProgress): number {
  if (progress.totalSteps === 0) return 0;
  return Math.round((progress.completedCount / progress.totalSteps) * 100);
}

/**
 * Get step status based on progress
 */
export function getStepStatus(
  stepId: string,
  progress: RoadmapProgress | null
): 'completed' | 'current' | 'locked' {
  if (!progress) return stepId === '0-0' ? 'current' : 'locked';

  if (progress.completedSteps.includes(stepId)) {
    return 'completed';
  }

  if (progress.currentStepId === stepId) {
    return 'current';
  }

  // Check if previous step is completed (to unlock this step)
  const [sectionIdx, subtopicIdx] = stepId.split('-').map(Number);

  // First step is always unlocked
  if (sectionIdx === 0 && subtopicIdx === 0) {
    return 'current';
  }

  // Check if previous subtopic in same section is completed
  if (subtopicIdx > 0) {
    const prevStepId = `${sectionIdx}-${subtopicIdx - 1}`;
    if (progress.completedSteps.includes(prevStepId)) {
      return 'current';
    }
  }

  // Check if last subtopic of previous section is completed
  if (subtopicIdx === 0 && sectionIdx > 0) {
    // We need to find the last subtopic of the previous section
    // For simplicity, we'll check if any step from current section is current/completed
    const hasCurrentSectionProgress = progress.completedSteps.some(
      (id) => id.startsWith(`${sectionIdx}-`)
    ) || progress.currentStepId?.startsWith(`${sectionIdx}-`);

    if (hasCurrentSectionProgress) {
      return 'current';
    }
  }

  return 'locked';
}
