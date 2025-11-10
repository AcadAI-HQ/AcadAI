"""
Google Gemini AI Service
Handles roadmap customization using Google Gemini API
"""
import google.generativeai as genai
import json
import logging
from typing import Dict, Any, Optional

from app.config import settings
from app.models import RoadmapFile, UserProfile

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GOOGLE_GEMINI_API_KEY)

# Model configuration
GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}

SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]


def build_user_context(user_profile: UserProfile) -> str:
    """Build user context string from profile"""
    context_parts = []

    # User type
    if user_profile.userType:
        context_parts.append(f"User Type: {user_profile.userType}")

    # Experience level
    if user_profile.userType == "professional" and user_profile.yearsOfExperience:
        context_parts.append(f"Years of Experience: {user_profile.yearsOfExperience}")
        if user_profile.currentRole:
            context_parts.append(f"Current Role: {user_profile.currentRole}")

    if user_profile.userType == "student":
        if user_profile.degree:
            context_parts.append(f"Education: {user_profile.degree}")
        if user_profile.currentYear:
            context_parts.append(f"Academic Year: {user_profile.currentYear}")

    # Skills
    if user_profile.skills:
        context_parts.append(f"Existing Skills: {', '.join(user_profile.skills)}")

    # Domain experience
    if user_profile.domainExperience:
        context_parts.append(f"Domain Experience Level: {user_profile.domainExperience}")

    # Interested domains
    if user_profile.interestedDomains:
        context_parts.append(f"Interested Domains: {', '.join(user_profile.interestedDomains)}")

    return "\n".join(context_parts)


def build_customization_prompt(base_roadmap: Dict[str, Any], user_context: str) -> str:
    """Build customization prompt for Gemini"""
    return f"""You are an expert learning path designer and educational content curator. Your task is to customize a learning roadmap based on the user's profile, experience level, and learning goals.

USER PROFILE:
{user_context}

BASE ROADMAP:
Domain: {base_roadmap.get('domain', 'Unknown')}
Overview: {base_roadmap.get('overview', '')}

CURRENT ROADMAP STRUCTURE:
{json.dumps(base_roadmap.get('steps', []), indent=2)}

YOUR TASK:
Customize this roadmap by carefully considering the user's profile and making the following adjustments:

1. **Adjust Difficulty & Depth**:
   - For beginners: Add more foundational explanations, prerequisite topics, and gentle introductions
   - For intermediate users: Focus on practical applications and real-world scenarios
   - For advanced users: Emphasize best practices, advanced patterns, and optimization techniques

2. **Reorder & Prioritize**:
   - If user already has certain skills, move related topics earlier or mark as "quick review"
   - Prioritize topics that align with their career goals or interested domains

3. **Personalize Content**:
   - Add specific examples relevant to their background (student projects, professional scenarios)
   - Suggest resources that match their learning style
   - Include industry-specific applications if they're a professional

4. **Enhance Learning Path**:
   - Add estimated time for each step based on their experience level
   - Suggest practical projects or exercises
   - Include tips for their specific user type (student, professional, learner)

5. **Maintain Quality**:
   - Keep the comprehensive nature of the roadmap
   - Don't remove core concepts, but adjust their presentation
   - Ensure logical progression through topics

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON in the EXACT same structure as the base roadmap
- Do NOT add commentary, explanations, or markdown formatting
- The response must be parseable as JSON
- Maintain all fields: domain, overview, steps (with title, description, topics, resources)

Return the customized roadmap now:"""


async def customize_roadmap_with_gemini(
    base_roadmap: Dict[str, Any],
    user_profile: UserProfile
) -> Optional[Dict[str, Any]]:
    """
    Customize a roadmap using Google Gemini AI

    Args:
        base_roadmap: Base roadmap template
        user_profile: User's profile data

    Returns:
        Customized roadmap or None if customization fails
    """
    try:
        # Build context and prompt
        user_context = build_user_context(user_profile)
        prompt = build_customization_prompt(base_roadmap, user_context)

        logger.info(f"Customizing roadmap for user {user_profile.uid}, domain: {base_roadmap.get('domain')}")

        # Initialize model
        model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config=GENERATION_CONFIG,
            safety_settings=SAFETY_SETTINGS
        )

        # Generate content
        response = model.generate_content(prompt)

        # Extract and parse response
        response_text = response.text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]

        response_text = response_text.strip()

        # Parse JSON
        customized_roadmap = json.loads(response_text)

        # Validate structure
        if not all(key in customized_roadmap for key in ['domain', 'overview', 'steps']):
            logger.error("Invalid roadmap structure from Gemini")
            return None

        logger.info("Successfully customized roadmap with Gemini")
        return customized_roadmap

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        logger.debug(f"Response text: {response_text[:500]}")
        return None
    except Exception as e:
        logger.error(f"Error customizing roadmap with Gemini: {e}")
        return None


def quick_customize_roadmap(
    base_roadmap: Dict[str, Any],
    user_profile: UserProfile
) -> Dict[str, Any]:
    """
    Quick rule-based customization without AI (fallback)

    Args:
        base_roadmap: Base roadmap template
        user_profile: User's profile data

    Returns:
        Customized roadmap
    """
    # Deep copy
    customized = json.loads(json.dumps(base_roadmap))

    # Add user-specific overview message
    experience_level = user_profile.domainExperience or "beginner"
    user_type = user_profile.userType or "learner"

    customized['overview'] = f"{customized.get('overview', '')}\n\n"
    customized['overview'] += f"This roadmap has been tailored for your {experience_level} level experience as a {user_type}."

    # Adjust based on experience
    if experience_level == "advanced" and user_profile.yearsOfExperience and user_profile.yearsOfExperience > 3:
        # Add note to early steps
        for i, step in enumerate(customized.get('steps', [])[:3]):
            step['description'] = f"[Quick Review Recommended] {step.get('description', '')}"

    # Add student-specific context
    if user_type == "student":
        customized['overview'] += "\n\nThis roadmap is structured to align with your academic journey and includes project-based learning opportunities."

    # Add professional context
    if user_type == "professional":
        customized['overview'] += "\n\nThis roadmap focuses on practical applications and industry best practices relevant to your professional experience."

    return customized
