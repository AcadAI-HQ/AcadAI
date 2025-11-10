"""
Pydantic Models for Request/Response Validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ===== Enums =====

class UserType(str, Enum):
    STUDENT = "student"
    PROFESSIONAL = "professional"
    LEARNER = "learner"


class ExperienceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class SubscriptionTier(str, Enum):
    FREE = "free"
    PREMIUM = "premium"


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


# ===== Authentication Models =====

class UserProfile(BaseModel):
    """User profile data"""
    uid: str
    email: Optional[str] = None
    displayName: Optional[str] = None
    userType: Optional[UserType] = None
    skills: List[str] = []
    profileComplete: bool = False

    # Student fields
    degree: Optional[str] = None
    currentYear: Optional[str] = None

    # Professional fields
    yearsOfExperience: Optional[int] = None
    currentRole: Optional[str] = None

    # Learning preferences
    domainExperience: Optional[ExperienceLevel] = None
    interestedDomains: List[str] = []
    lastGeneratedDomain: Optional[str] = None

    # Subscription
    subscription: Optional[Dict[str, Any]] = None


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class VerifyTokenRequest(BaseModel):
    """Request to verify Firebase ID token"""
    idToken: str = Field(..., description="Firebase ID token from client")


# ===== Roadmap Models =====

class RoadmapStep(BaseModel):
    """Single step in a roadmap"""
    title: str
    description: str
    topics: List[str] = []
    resources: List[Dict[str, str]] = []
    estimatedTime: Optional[str] = None


class RoadmapFile(BaseModel):
    """Complete roadmap structure"""
    domain: str
    overview: str
    steps: List[RoadmapStep]


class CustomizeRoadmapRequest(BaseModel):
    """Request to customize a roadmap"""
    domain: str = Field(..., description="Domain to customize (frontend, backend, etc.)")
    userId: str = Field(..., description="User ID for personalization")


class CustomizeRoadmapResponse(BaseModel):
    """Response with customized roadmap"""
    roadmap: RoadmapFile
    customized: bool = Field(..., description="Whether roadmap was AI-customized")
    message: Optional[str] = None


# ===== Payment Models =====

class CreateSubscriptionRequest(BaseModel):
    """Request to create a subscription"""
    userId: str
    planId: str = "monthly"
    currency: str = Field("INR", pattern="^(USD|INR)$")


class CreateSubscriptionResponse(BaseModel):
    """Response with subscription details"""
    subscriptionId: str
    customerId: Optional[str] = None
    status: str
    shortUrl: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    """Request to verify payment signature"""
    razorpay_subscription_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    userId: str


class VerifyPaymentResponse(BaseModel):
    """Payment verification response"""
    verified: bool
    message: str
    subscriptionData: Optional[Dict[str, Any]] = None


class CancelSubscriptionRequest(BaseModel):
    """Request to cancel subscription"""
    userId: str
    subscriptionId: str


class RazorpayWebhookEvent(BaseModel):
    """Razorpay webhook event"""
    entity: str
    account_id: str
    event: str
    contains: List[str]
    payload: Dict[str, Any]
    created_at: int


# ===== Error Response =====

class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    message: str
    details: Optional[Any] = None
