import {
  WeeklyResource,
  WeeklyResourceManifest,
  DomainManifest,
} from '@/types/weekly-resources';

// Cache for manifest to avoid repeated fetches
let manifestCache: WeeklyResourceManifest | null = null;

/**
 * Load and cache the weekly resources manifest
 * @returns The manifest containing all domain configurations
 */
export async function loadManifest(): Promise<WeeklyResourceManifest> {
  if (manifestCache) {
    return manifestCache;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('/weekly-resources/manifest.json', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }
    const manifest: WeeklyResourceManifest = await response.json();
    manifestCache = manifest;
    return manifest;
  } catch (error) {
    console.error('Error loading manifest:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Manifest load timeout - please check your connection');
    }
    throw new Error('Failed to load weekly resources manifest');
  }
}

/**
 * Get manifest data for a specific domain
 * @param domain - The domain to get manifest for
 * @returns Domain manifest or null if not found
 */
export async function getDomainManifest(
  domain: string
): Promise<DomainManifest | null> {
  try {
    const manifest = await loadManifest();
    return manifest.domains[domain] || null;
  } catch (error) {
    console.error(`Error getting domain manifest for ${domain}:`, error);
    return null;
  }
}

/**
 * Get list of available weeks for a domain
 * @param domain - The domain to get weeks for
 * @returns Array of available week numbers
 */
export async function getAvailableWeeks(domain: string): Promise<number[]> {
  const domainManifest = await getDomainManifest(domain);
  return domainManifest?.availableWeeks || [];
}

/**
 * Get the latest (highest) available week number for a domain
 * @param domain - The domain to check
 * @returns The highest available week number or 0 if none available
 */
export async function getLatestWeek(domain: string): Promise<number> {
  const availableWeeks = await getAvailableWeeks(domain);
  if (availableWeeks.length === 0) return 0;
  return Math.max(...availableWeeks);
}

/**
 * Check if a specific week is available for a domain
 * @param domain - The domain to check
 * @param weekNumber - The week number to validate
 * @returns True if the week is available
 */
export async function isWeekAvailable(
  domain: string,
  weekNumber: number
): Promise<boolean> {
  const availableWeeks = await getAvailableWeeks(domain);
  return availableWeeks.includes(weekNumber);
}

/**
 * Load a weekly resource from the public folder
 * @param domain - The domain (e.g., 'frontend', 'backend')
 * @param weekNumber - The week number
 * @returns The weekly resource data
 * @throws Error if resource doesn't exist or fails to load
 */
export async function loadWeeklyResource(
  domain: string,
  weekNumber: number
): Promise<WeeklyResource> {
  // Validate week is available before attempting to load
  const available = await isWeekAvailable(domain, weekNumber);
  if (!available) {
    throw new Error(
      `Week ${weekNumber} is not available for domain ${domain}`
    );
  }

  try {
    const response = await fetch(
      `/weekly-resources/${domain}/week-${weekNumber}.json`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load resource: ${response.status} ${response.statusText}`
      );
    }

    const resource: WeeklyResource = await response.json();

    // Validate the resource structure
    if (!resource.domain || !resource.weekNumber || !resource.title) {
      throw new Error('Invalid resource structure');
    }

    return resource;
  } catch (error) {
    console.error(
      `Error loading weekly resource for ${domain} week ${weekNumber}:`,
      error
    );
    throw new Error(
      `Failed to load resources for ${domain} week ${weekNumber}`
    );
  }
}

/**
 * Load all available weekly resources for a domain
 * @param domain - The domain to load resources for
 * @returns Array of weekly resources
 */
export async function getAllDomainResources(
  domain: string
): Promise<WeeklyResource[]> {
  const availableWeeks = await getAvailableWeeks(domain);

  // Load all weeks in parallel
  const resourcePromises = availableWeeks.map((weekNumber) =>
    loadWeeklyResource(domain, weekNumber)
  );

  try {
    const resources = await Promise.all(resourcePromises);
    // Sort by week number descending (newest first)
    return resources.sort((a, b) => b.weekNumber - a.weekNumber);
  } catch (error) {
    console.error(`Error loading all resources for ${domain}:`, error);
    throw new Error(`Failed to load resources for ${domain}`);
  }
}

/**
 * Get all configured domains from the manifest
 * @returns Array of domain IDs
 */
export async function getAllDomains(): Promise<string[]> {
  try {
    const manifest = await loadManifest();
    return Object.keys(manifest.domains);
  } catch (error) {
    console.error('Error getting all domains:', error);
    return [];
  }
}

/**
 * Clear the manifest cache (useful for testing or manual refresh)
 */
export function clearManifestCache(): void {
  manifestCache = null;
}
