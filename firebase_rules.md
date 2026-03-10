rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if a user is the owner of a document.
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Users can only read and write their own profile data.
    match /users/{userId} {
      allow read, write: if isOwner(userId);

      // Personalized roadmaps — each user owns their own copy.
      match /roadmaps/{domain} {
        allow read, write: if isOwner(userId);
      }

      // Roadmap progress — each user owns their own progress data.
      match /roadmapProgress/{domain} {
        allow read, write: if isOwner(userId);
      }
    }

    // Skill usage can only be updated by authenticated users (during signup).
    // Read access is disabled as it's not needed by the client.
    match /skillUsage/{skill} {
      allow read: if false;
      allow write: if request.auth != null;
    }

    // Domain usage can only be updated by authenticated users.
    // Read access is disabled.
    match /domainUsage/{domain} {
      allow read: if false;
      allow write: if request.auth != null;
    }

    // The global user counter is readable by anyone, but not writable from the client.
    // It is only incremented via a trusted server-side transaction during signup.
    match /globalCounters/{counter} {
      allow get, list; // Allow public read access
      allow write: if false; // Deny all client-side writes
    }

    // Public stats document (for user count display on landing page)
    // Readable by anyone, authenticated users can increment counter.
    match /public/stats {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // AI-generated blog posts — written by cron/server only, public read.
    match /blog-posts/{slug} {
      allow read: if true;
      allow write: if false; // Server-side only (via Admin SDK in cron routes)
    }

    // Market research data — written by cron/server only, no client access.
    // Used internally by agents to generate roadmaps.
    match /market-research/{domain} {
      allow read: if false;
      allow write: if false; // Server-side only
    }

    // AI-generated roadmap templates — written by cron/server only.
    // Authenticated users can read to get the latest AI-updated base roadmap.
    match /roadmaps/{domain} {
      allow read: if request.auth != null;
      allow write: if false; // Server-side only
    }

    // Weekly learning resources — written by cron/server only.
    // Authenticated users can read.
    match /learning-resources/{domain} {
      allow read: if request.auth != null;
      allow write: if false; // Server-side only

      match /weeks/{weekId} {
        allow read: if request.auth != null;
        allow write: if false; // Server-side only
      }
    }

    // Pipeline locks — used by cron jobs to prevent duplicate runs.
    // No client access whatsoever.
    match /_pipeline_locks/{jobName} {
      allow read: if false;
      allow write: if false; // Server-side only (Admin SDK bypasses these rules)
    }
  }
}
