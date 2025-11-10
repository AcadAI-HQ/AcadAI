"""
Authentication Router
Handles Firebase token verification and user authentication
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import logging

from app.models import VerifyTokenRequest, TokenResponse, UserProfile, ErrorResponse
from app.services.firebase_service import verify_firebase_token, get_user_profile

logger = logging.getLogger(__name__)

router = APIRouter()


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Dependency to get current authenticated user from Firebase token

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        Decoded token with user info

    Raises:
        HTTPException: If token is missing or invalid
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        # Verify token
        decoded_token = await verify_firebase_token(token)
        return decoded_token

    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")


@router.post("/verify-token", response_model=TokenResponse)
async def verify_token(request: VerifyTokenRequest):
    """
    Verify Firebase ID token and return user profile

    This endpoint is called by the frontend after Firebase authentication
    to verify the token on the backend and get user profile data.
    """
    try:
        # Verify Firebase token
        decoded_token = await verify_firebase_token(request.idToken)
        uid = decoded_token.get("uid")

        if not uid:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        # Get user profile from Firestore
        user_data = await get_user_profile(uid)

        if not user_data:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Convert to UserProfile model
        user_profile = UserProfile(**user_data)

        return TokenResponse(
            access_token=request.idToken,
            token_type="bearer",
            user=user_profile
        )

    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's profile

    Requires valid Firebase token in Authorization header
    """
    try:
        uid = current_user.get("uid")
        user_data = await get_user_profile(uid)

        if not user_data:
            raise HTTPException(status_code=404, detail="User profile not found")

        return UserProfile(**user_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/health")
async def auth_health():
    """Auth service health check"""
    return {"status": "healthy", "service": "authentication"}
