/**
 * Google Analytics event tracking utilities
 * Use these functions to track custom events throughout the app
 */

// Type definitions for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

// Pre-defined events for common actions

/**
 * Track user signup
 */
export function trackSignup(method: 'email' | 'google') {
  trackEvent('sign_up', {
    method,
  });
}

/**
 * Track user login
 */
export function trackLogin(method: 'email' | 'google') {
  trackEvent('login', {
    method,
  });
}

/**
 * Track roadmap view
 */
export function trackRoadmapView(domain: string) {
  trackEvent('view_roadmap', {
    domain,
    content_type: 'roadmap',
  });
}

/**
 * Track roadmap generation/selection
 */
export function trackRoadmapGenerated(domain: string) {
  trackEvent('generate_roadmap', {
    domain,
  });
}

/**
 * Track subscription checkout initiated
 */
export function trackCheckoutStarted(plan: 'monthly' | 'yearly', currency: 'USD' | 'INR') {
  trackEvent('begin_checkout', {
    currency,
    items: plan,
  });
}

/**
 * Track successful subscription purchase
 */
export function trackPurchase(plan: 'monthly' | 'yearly', currency: 'USD' | 'INR', value: number) {
  trackEvent('purchase', {
    currency,
    value,
    items: plan,
  });
}

/**
 * Track subscription cancellation
 */
export function trackSubscriptionCancelled() {
  trackEvent('subscription_cancelled');
}

/**
 * Track onboarding step completion
 */
export function trackOnboardingStep(step: number, stepName: string) {
  trackEvent('onboarding_step', {
    step,
    step_name: stepName,
  });
}

/**
 * Track onboarding completion
 */
export function trackOnboardingComplete(userType: string) {
  trackEvent('onboarding_complete', {
    user_type: userType,
  });
}

/**
 * Track feedback submission
 */
export function trackFeedbackSubmitted(type: string) {
  trackEvent('feedback_submitted', {
    feedback_type: type,
  });
}

/**
 * Track weekly resource view
 */
export function trackResourceView(domain: string, week: number) {
  trackEvent('view_resource', {
    domain,
    week,
    content_type: 'weekly_resource',
  });
}

/**
 * Track page view (useful for SPAs where automatic tracking might miss some)
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });
}
