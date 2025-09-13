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
    // Readable by anyone, authenticated users can increment counter
    match /public/stats {
        allow read: if true; // Allow public read access
        allow write: if request.auth != null; // Allow authenticated users to update stats
    }
  }
}