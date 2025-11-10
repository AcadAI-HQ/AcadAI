/**
 * Google Gemini AI Service for Roadmap Customization
 *
 * @deprecated This frontend service is deprecated.
 * All Gemini AI operations are now handled securely by the backend.
 * Use the api-client.ts customizeRoadmap function instead.
 *
 * Previous functionality:
 * - User profile analysis
 * - Learning preference customization
 * - Career goal alignment
 * - Knowledge level adaptation
 */

import type { RoadmapFile, UserProfile } from '@/types';

/**
 * Customize a roadmap using Google Gemini AI
 *
 * @deprecated Use customizeRoadmap from @/lib/api-client instead
 * @param baseRoadmap - The base roadmap template
 * @param userProfile - User's profile data
 * @returns Customized roadmap tailored to the user
 */
export async function customizeRoadmapWithGemini(
  baseRoadmap: RoadmapFile,
  userProfile: UserProfile
): Promise<RoadmapFile> {
  // This function is deprecated. All Gemini AI calls are now handled by the secure backend.
  // Import from '@/lib/api-client' and use customizeRoadmap instead.
  throw new Error(
    'customizeRoadmapWithGemini is deprecated. ' +
    'Use customizeRoadmap from @/lib/api-client instead. ' +
    'The Gemini API key is now secured on the backend.'
  );
}

// All helper functions have been moved to the secure backend.
// See: backend/app/services/gemini_service.py

/**
 * Quick customization for MVP (rule-based, no AI)
 * Use this as a fallback or for initial implementation
 */
export function quickCustomizeRoadmap(
  baseRoadmap: RoadmapFile,
  userProfile: UserProfile
): RoadmapFile {
  const customized = JSON.parse(JSON.stringify(baseRoadmap)); // Deep clone

  // Add user-specific overview message
  const experienceLevel = userProfile.domainExperience || 'beginner';
  customized.overview = `${customized.overview}\n\nThis roadmap has been tailored for your ${experienceLevel} level experience.`;

  // If user is a professional with experience, mark some steps as optional
  if (userProfile.userType === 'professional' && userProfile.yearsOfExperience && userProfile.yearsOfExperience > 2) {
    // Add note to early steps
    customized.steps.slice(0, 3).forEach((step: any) => {
      step.description = `[Quick Review] ${step.description}`;
    });
  }

  // If user is a student, add academic context
  if (userProfile.userType === 'student') {
    customized.overview += ' We\'ve structured this roadmap to align with your academic journey.';
  }

  return customized;
}

/**
 * Generate roadmap suggestions based on user skills
 */
export function generateSkillGaps(
  roadmap: RoadmapFile,
  userSkills: string[]
): string[] {
  // TODO: Implement skill gap analysis
  // Compare roadmap topics with user's existing skills
  // Return list of topics user should focus on

  return [];
}

/**
 * Estimate completion time based on user profile
 */
export function estimateCompletionTime(
  roadmap: RoadmapFile,
  userProfile: UserProfile
): { totalHours: number; weeksAtModerate: number } {
  // TODO: Implement time estimation
  // Consider user's experience level
  // Calculate based on roadmap complexity

  const baseHours = roadmap.steps.length * 10; // Rough estimate
  const experienceMultiplier = userProfile.domainExperience === 'advanced' ? 0.7 : 1.2;
  const totalHours = Math.round(baseHours * experienceMultiplier);
  const weeksAtModerate = Math.ceil(totalHours / 10); // Assuming 10 hours per week

  return { totalHours, weeksAtModerate };
}
