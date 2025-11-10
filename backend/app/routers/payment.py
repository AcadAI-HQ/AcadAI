"""
Payment Router
Handles Razorpay payment processing and subscription management
"""
from fastapi import APIRouter, HTTPException, Depends, Request, Header
from typing import Optional
import logging
import json

from app.models import (
    CreateSubscriptionRequest,
    CreateSubscriptionResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    CancelSubscriptionRequest,
    RazorpayWebhookEvent
)
from app.routers.auth import get_current_user
from app.services.payment_service import (
    create_subscription,
    verify_payment_signature,
    get_subscription_details,
    cancel_subscription,
    verify_webhook_signature
)
from app.services.firebase_service import get_user_profile, update_user_profile
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/create-subscription", response_model=CreateSubscriptionResponse)
async def create_user_subscription(
    request: CreateSubscriptionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new subscription for the authenticated user

    This endpoint:
    1. Verifies the user is authenticated
    2. Creates a Razorpay payment link/subscription
    3. Returns subscription details to the frontend
    """
    try:
        uid = current_user.get("uid")

        # Verify user ID matches
        if uid != request.userId:
            raise HTTPException(status_code=403, detail="User ID mismatch")

        # Get user profile for email and name
        user_data = await get_user_profile(uid)
        if not user_data:
            raise HTTPException(status_code=404, detail="User profile not found")

        user_email = user_data.get("email")
        user_name = user_data.get("displayName", "User")

        if not user_email:
            raise HTTPException(status_code=400, detail="User email not found")

        logger.info(f"Creating subscription for user {uid}, currency: {request.currency}")

        # Create subscription with Razorpay
        subscription_data = await create_subscription(
            user_id=uid,
            user_email=user_email,
            user_name=user_name,
            currency=request.currency
        )

        if not subscription_data:
            raise HTTPException(status_code=500, detail="Failed to create subscription")

        return CreateSubscriptionResponse(
            subscriptionId=subscription_data["subscription_id"],
            status=subscription_data["status"],
            shortUrl=subscription_data.get("short_url")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create subscription: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create subscription")


@router.post("/verify-payment", response_model=VerifyPaymentResponse)
async def verify_user_payment(
    request: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Verify payment signature and update user subscription status

    This endpoint:
    1. Verifies the Razorpay payment signature
    2. Updates the user's subscription status in Firestore
    3. Returns verification result
    """
    try:
        uid = current_user.get("uid")

        # Verify user ID matches
        if uid != request.userId:
            raise HTTPException(status_code=403, detail="User ID mismatch")

        logger.info(f"Verifying payment for user {uid}, subscription: {request.razorpay_subscription_id}")

        # Verify signature
        is_valid = verify_payment_signature(
            subscription_id=request.razorpay_subscription_id,
            payment_id=request.razorpay_payment_id,
            signature=request.razorpay_signature
        )

        if not is_valid:
            return VerifyPaymentResponse(
                verified=False,
                message="Invalid payment signature"
            )

        # Get subscription details from Razorpay
        subscription_details = await get_subscription_details(request.razorpay_subscription_id)

        # Update user subscription in Firestore
        subscription_data = {
            "tier": "premium",
            "status": "active",
            "razorpaySubscriptionId": request.razorpay_subscription_id,
            "razorpayPaymentId": request.razorpay_payment_id,
            "currency": subscription_details.get("currency", "INR") if subscription_details else "INR",
            "amount": subscription_details.get("amount") if subscription_details else None
        }

        success = await update_user_profile(uid, {"subscription": subscription_data})

        if not success:
            logger.error(f"Failed to update user subscription in Firestore for user {uid}")
            return VerifyPaymentResponse(
                verified=True,
                message="Payment verified but failed to update profile",
                subscriptionData=subscription_data
            )

        logger.info(f"Payment verified and subscription updated for user {uid}")

        return VerifyPaymentResponse(
            verified=True,
            message="Payment verified successfully",
            subscriptionData=subscription_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify payment: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to verify payment")


@router.post("/cancel-subscription")
async def cancel_user_subscription(
    request: CancelSubscriptionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Cancel user's active subscription

    This endpoint:
    1. Verifies the user is authenticated
    2. Cancels the subscription with Razorpay
    3. Updates user's subscription status in Firestore
    """
    try:
        uid = current_user.get("uid")

        # Verify user ID matches
        if uid != request.userId:
            raise HTTPException(status_code=403, detail="User ID mismatch")

        logger.info(f"Cancelling subscription for user {uid}, subscription: {request.subscriptionId}")

        # Cancel with Razorpay
        success = await cancel_subscription(request.subscriptionId)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to cancel subscription with Razorpay")

        # Update user profile
        subscription_data = {
            "tier": "free",
            "status": "cancelled",
            "razorpaySubscriptionId": request.subscriptionId
        }

        await update_user_profile(uid, {"subscription": subscription_data})

        logger.info(f"Subscription cancelled for user {uid}")

        return {
            "success": True,
            "message": "Subscription cancelled successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel subscription: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None)
):
    """
    Handle Razorpay webhooks for subscription events

    This endpoint handles events like:
    - subscription.activated
    - subscription.cancelled
    - subscription.charged
    - payment.failed

    Note: You need to configure webhook secret in Razorpay dashboard
    and add it to your environment variables
    """
    try:
        # Get raw body
        body = await request.body()
        body_str = body.decode("utf-8")

        # Verify webhook signature (if webhook secret is configured)
        webhook_secret = getattr(settings, "RAZORPAY_WEBHOOK_SECRET", None)
        if webhook_secret and x_razorpay_signature:
            is_valid = verify_webhook_signature(body_str, x_razorpay_signature, webhook_secret)
            if not is_valid:
                raise HTTPException(status_code=401, detail="Invalid webhook signature")

        # Parse webhook payload
        payload = json.loads(body_str)
        event_type = payload.get("event")

        logger.info(f"Received webhook event: {event_type}")

        # Handle different event types
        if event_type == "subscription.activated":
            await handle_subscription_activated(payload)
        elif event_type == "subscription.cancelled":
            await handle_subscription_cancelled(payload)
        elif event_type == "subscription.charged":
            await handle_subscription_charged(payload)
        elif event_type == "payment.failed":
            await handle_payment_failed(payload)
        else:
            logger.info(f"Unhandled webhook event: {event_type}")

        return {"status": "success"}

    except Exception as e:
        logger.error(f"Webhook processing failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Webhook processing failed")


async def handle_subscription_activated(payload: dict):
    """Handle subscription.activated event"""
    try:
        subscription = payload.get("payload", {}).get("subscription", {}).get("entity", {})
        notes = subscription.get("notes", {})
        user_id = notes.get("user_id")

        if not user_id:
            logger.warning("Subscription activated webhook missing user_id in notes")
            return

        # Update user subscription status
        subscription_data = {
            "tier": "premium",
            "status": "active",
            "razorpaySubscriptionId": subscription.get("id")
        }

        await update_user_profile(user_id, {"subscription": subscription_data})
        logger.info(f"Subscription activated for user {user_id}")

    except Exception as e:
        logger.error(f"Failed to handle subscription activated: {e}")


async def handle_subscription_cancelled(payload: dict):
    """Handle subscription.cancelled event"""
    try:
        subscription = payload.get("payload", {}).get("subscription", {}).get("entity", {})
        notes = subscription.get("notes", {})
        user_id = notes.get("user_id")

        if not user_id:
            logger.warning("Subscription cancelled webhook missing user_id in notes")
            return

        # Update user subscription status
        subscription_data = {
            "tier": "free",
            "status": "cancelled",
            "razorpaySubscriptionId": subscription.get("id")
        }

        await update_user_profile(user_id, {"subscription": subscription_data})
        logger.info(f"Subscription cancelled for user {user_id}")

    except Exception as e:
        logger.error(f"Failed to handle subscription cancelled: {e}")


async def handle_subscription_charged(payload: dict):
    """Handle subscription.charged event"""
    try:
        payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
        logger.info(f"Subscription charged: {payment.get('id')}, amount: {payment.get('amount')}")
        # Additional logic if needed (e.g., send receipt email)

    except Exception as e:
        logger.error(f"Failed to handle subscription charged: {e}")


async def handle_payment_failed(payload: dict):
    """Handle payment.failed event"""
    try:
        payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
        logger.warning(f"Payment failed: {payment.get('id')}, error: {payment.get('error_description')}")
        # Additional logic if needed (e.g., notify user)

    except Exception as e:
        logger.error(f"Failed to handle payment failed: {e}")


@router.get("/health")
async def payment_health():
    """Payment service health check"""
    return {
        "status": "healthy",
        "service": "payment",
        "razorpay_configured": bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)
    }
