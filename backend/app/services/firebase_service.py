"""
Firebase Admin SDK Service
Handles Firebase authentication and Firestore operations
"""
import firebase_admin
from firebase_admin import credentials, auth, firestore
from typing import Optional, Dict, Any
import logging
import os

from app.config import settings

logger = logging.getLogger(__name__)

# Global Firebase app instance
_firebase_app: Optional[firebase_admin.App] = None
_db: Optional[firestore.Client] = None


def initialize_firebase() -> None:
    """Initialize Firebase Admin SDK"""
    global _firebase_app, _db

    if _firebase_app is not None:
        logger.info("Firebase already initialized")
        return

    try:
        # Check if service account file exists
        if not os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
            logger.warning(
                f"Firebase service account file not found at: {settings.FIREBASE_SERVICE_ACCOUNT_PATH}"
            )
            logger.warning("Backend will run with limited functionality. Frontend authentication will still work.")
            logger.warning("To enable full backend features, add firebase-service-account.json to the backend directory.")
            return

        # Initialize with service account
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        _firebase_app = firebase_admin.initialize_app(cred)
        _db = firestore.client()

        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        logger.warning("Backend will run with limited functionality.")


def get_firestore_client() -> firestore.Client:
    """Get Firestore client instance"""
    if _db is None:
        raise RuntimeError(
            "Firebase not initialized. Add firebase-service-account.json to the backend directory. "
            "Get it from Firebase Console > Project Settings > Service Accounts > Generate New Private Key"
        )
    return _db


async def verify_firebase_token(id_token: str) -> Dict[str, Any]:
    """
    Verify Firebase ID token and return decoded token

    Args:
        id_token: Firebase ID token from client

    Returns:
        Decoded token containing user info

    Raises:
        ValueError: If token is invalid
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        logger.info(f"Token verified for user: {decoded_token.get('uid')}")
        return decoded_token
    except auth.InvalidIdTokenError:
        logger.error("Invalid Firebase ID token")
        raise ValueError("Invalid authentication token")
    except auth.ExpiredIdTokenError:
        logger.error("Expired Firebase ID token")
        raise ValueError("Authentication token has expired")
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise ValueError(f"Token verification failed: {str(e)}")


async def get_user_profile(uid: str) -> Optional[Dict[str, Any]]:
    """
    Get user profile from Firestore

    Args:
        uid: User ID

    Returns:
        User profile data or None if not found
    """
    try:
        db = get_firestore_client()
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()

        if user_doc.exists:
            return user_doc.to_dict()
        return None
    except Exception as e:
        logger.error(f"Failed to get user profile: {e}")
        return None


async def update_user_profile(uid: str, updates: Dict[str, Any]) -> bool:
    """
    Update user profile in Firestore

    Args:
        uid: User ID
        updates: Fields to update

    Returns:
        True if successful, False otherwise
    """
    try:
        db = get_firestore_client()
        user_ref = db.collection('users').document(uid)

        # Clean up undefined/null values
        clean_updates = {
            k: v for k, v in updates.items()
            if v is not None and v != ''
        }

        user_ref.update(clean_updates)
        logger.info(f"Updated profile for user: {uid}")
        return True
    except Exception as e:
        logger.error(f"Failed to update user profile: {e}")
        return False


async def get_user_roadmap(uid: str, domain: str) -> Optional[Dict[str, Any]]:
    """
    Get user's personalized roadmap from Firestore

    Args:
        uid: User ID
        domain: Roadmap domain

    Returns:
        Roadmap data or None if not found
    """
    try:
        db = get_firestore_client()
        roadmap_ref = db.collection('users').document(uid).collection('roadmaps').document(domain)
        roadmap_doc = roadmap_ref.get()

        if roadmap_doc.exists:
            return roadmap_doc.to_dict()
        return None
    except Exception as e:
        logger.error(f"Failed to get user roadmap: {e}")
        return None


async def save_user_roadmap(uid: str, domain: str, roadmap_data: Dict[str, Any]) -> bool:
    """
    Save user's personalized roadmap to Firestore

    Args:
        uid: User ID
        domain: Roadmap domain
        roadmap_data: Roadmap data to save

    Returns:
        True if successful, False otherwise
    """
    try:
        db = get_firestore_client()
        roadmap_ref = db.collection('users').document(uid).collection('roadmaps').document(domain)

        # Add metadata
        roadmap_data['lastModified'] = firestore.SERVER_TIMESTAMP
        roadmap_data['domain'] = domain

        roadmap_ref.set(roadmap_data, merge=True)
        logger.info(f"Saved roadmap for user {uid}, domain: {domain}")
        return True
    except Exception as e:
        logger.error(f"Failed to save user roadmap: {e}")
        return False
