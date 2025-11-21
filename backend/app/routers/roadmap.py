"""
Roadmap Router
Handles roadmap customization with Gemini AI
"""
from fastapi import APIRouter, HTTPException, Depends
import logging
import json
import os

from app.models import CustomizeRoadmapRequest, CustomizeRoadmapResponse, UserProfile
from app.routers.auth import get_current_user
from app.services.firebase_service import get_user_profile, get_user_roadmap, save_user_roadmap
from app.services.gemini_service import customize_roadmap_with_gemini, quick_customize_roadmap

logger = logging.getLogger(__name__)

router = APIRouter()

# Path to base roadmap templates
ROADMAP_BASE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "public", "roadmaps-new")


def load_base_roadmap(domain: str) -> dict:
    """Load base roadmap template from file"""
    try:
        roadmap_file = os.path.join(ROADMAP_BASE_PATH, f"{domain}.json")
        if not os.path.exists(roadmap_file):
            raise FileNotFoundError(f"Roadmap not found for domain: {domain}")

        with open(roadmap_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load base roadmap: {e}")
        raise


@router.post("/customize", response_model=CustomizeRoadmapResponse)
async def customize_roadmap(
    request: CustomizeRoadmapRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Customize a roadmap using Gemini AI based on user profile

    **PREMIUM FEATURE**: This endpoint is only accessible to premium users.

    This endpoint:
    1. Verifies user has premium subscription
    2. Checks if user already has a personalized roadmap
    3. If not, loads the base template
    4. Uses Gemini AI to customize based on user profile
    5. Falls back to rule-based customization if AI fails
    6. Saves the customized roadmap for the user
    """
    try:
        uid = current_user.get("uid")

        # Verify user ID matches
        if uid != request.userId:
            raise HTTPException(status_code=403, detail="User ID mismatch")

        logger.info(f"Customizing roadmap for user {uid}, domain: {request.domain}")

        # Get user profile to check subscription status
        user_data = await get_user_profile(uid)
        if not user_data:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Check if user has premium subscription
        subscription = user_data.get("subscription", {})
        tier = subscription.get("tier", "free")
        status = subscription.get("status", "inactive")

        if tier != "premium" or status != "active":
            logger.warning(f"User {uid} attempted to access premium feature without active premium subscription")
            raise HTTPException(
                status_code=403,
                detail="Hyperpersonalization is a premium feature. Please upgrade to premium to access AI-customized roadmaps."
            )

        # Check if user already has a personalized roadmap
        existing_roadmap = await get_user_roadmap(uid, request.domain)
        if existing_roadmap:
            logger.info(f"Found existing roadmap for user {uid}, domain: {request.domain}")
            return CustomizeRoadmapResponse(
                roadmap=existing_roadmap,
                customized=existing_roadmap.get("customized", False),
                message="Using existing personalized roadmap"
            )

        # Load base roadmap template
        base_roadmap = load_base_roadmap(request.domain)

        # Get user profile
        user_data = await get_user_profile(uid)
        if not user_data:
            raise HTTPException(status_code=404, detail="User profile not found")

        user_profile = UserProfile(**user_data)

        # Try AI customization with Gemini
        customized_roadmap = await customize_roadmap_with_gemini(base_roadmap, user_profile)

        if customized_roadmap:
            # AI customization succeeded
            customized_roadmap["customized"] = True
            customized_roadmap["customizationMethod"] = "gemini-ai"
            message = "Roadmap customized with AI based on your profile"
        else:
            # Fallback to rule-based customization
            logger.warning("Gemini customization failed, using rule-based fallback")
            customized_roadmap = quick_customize_roadmap(base_roadmap, user_profile)
            customized_roadmap["customized"] = True
            customized_roadmap["customizationMethod"] = "rule-based"
            message = "Roadmap customized based on your profile (rule-based)"

        # Save customized roadmap
        await save_user_roadmap(uid, request.domain, customized_roadmap)

        return CustomizeRoadmapResponse(
            roadmap=customized_roadmap,
            customized=True,
            message=message
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to customize roadmap: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to customize roadmap")


@router.get("/domains")
async def get_available_domains():
    """
    Get list of available roadmap domains

    Returns list of available domain names
    """
    try:
        # Check if roadmap directory exists
        if not os.path.exists(ROADMAP_BASE_PATH):
            return {"domains": []}

        # List all JSON files in roadmap directory
        domains = []
        for filename in os.listdir(ROADMAP_BASE_PATH):
            if filename.endswith(".json"):
                domain_name = filename[:-5]  # Remove .json extension
                domains.append(domain_name)

        return {"domains": domains}

    except Exception as e:
        logger.error(f"Failed to get available domains: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve domains")


@router.get("/health")
async def roadmap_health():
    """Roadmap service health check"""
    return {
        "status": "healthy",
        "service": "roadmap",
        "roadmap_path_exists": os.path.exists(ROADMAP_BASE_PATH)
    }
