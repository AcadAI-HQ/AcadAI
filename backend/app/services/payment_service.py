"""
Razorpay Payment Service
Handles subscription creation, verification, and management
"""
import razorpay
import hmac
import hashlib
import logging
from typing import Dict, Any, Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

# Subscription pricing (in smallest currency unit)
SUBSCRIPTION_PLANS = {
    "INR": {
        "monthly": {
            "amount": 29900,  # ₹299 in paise
            "currency": "INR",
            "period": "monthly",
            "interval": 1
        }
    },
    "USD": {
        "monthly": {
            "amount": 999,  # $9.99 in cents
            "currency": "USD",
            "period": "monthly",
            "interval": 1
        }
    }
}


async def create_razorpay_plan(currency: str = "INR") -> Optional[str]:
    """
    Create or get Razorpay plan ID

    Args:
        currency: Currency code (INR or USD)

    Returns:
        Plan ID or None if creation fails
    """
    try:
        plan_config = SUBSCRIPTION_PLANS.get(currency, {}).get("monthly")
        if not plan_config:
            logger.error(f"Invalid currency: {currency}")
            return None

        # Create plan
        plan_data = {
            "period": plan_config["period"],
            "interval": plan_config["interval"],
            "item": {
                "name": "Acad AI Premium Monthly Subscription",
                "amount": plan_config["amount"],
                "currency": plan_config["currency"],
                "description": "Access to premium features including AI-powered roadmap customization"
            }
        }

        plan = razorpay_client.plan.create(plan_data)
        logger.info(f"Created Razorpay plan: {plan['id']}")
        return plan["id"]

    except Exception as e:
        logger.error(f"Failed to create Razorpay plan: {e}")
        return None


async def create_subscription(
    user_id: str,
    user_email: str,
    user_name: str,
    currency: str = "INR"
) -> Optional[Dict[str, Any]]:
    """
    Create a new subscription for a user

    Args:
        user_id: User ID
        user_email: User email
        user_name: User name
        currency: Currency code (INR or USD)

    Returns:
        Subscription data with subscription_id, or None if creation fails
    """
    try:
        # Get or create plan
        # In production, you should store plan IDs and reuse them
        # For now, we'll create subscription with inline plan

        plan_config = SUBSCRIPTION_PLANS.get(currency, {}).get("monthly")
        if not plan_config:
            logger.error(f"Invalid currency: {currency}")
            return None

        # Create subscription with inline plan
        subscription_data = {
            "plan_id": None,  # We'll create inline
            "customer_notify": 1,
            "quantity": 1,
            "total_count": 12,  # 12 months
            "notes": {
                "user_id": user_id,
                "email": user_email
            }
        }

        # For Razorpay, we need to create a plan first or use existing plan ID
        # Let's use a simplified approach with amount
        subscription_data = {
            "type": "link",
            "amount": plan_config["amount"],
            "currency": plan_config["currency"],
            "description": "Acad AI Premium Monthly Subscription",
            "customer": {
                "name": user_name,
                "email": user_email
            },
            "notify": {
                "sms": False,
                "email": True
            },
            "reminder_enable": True,
            "notes": {
                "user_id": user_id
            }
        }

        # Create payment link (simpler than subscription for monthly payments)
        payment_link = razorpay_client.payment_link.create(subscription_data)

        logger.info(f"Created payment link for user {user_id}: {payment_link['id']}")

        return {
            "subscription_id": payment_link["id"],
            "short_url": payment_link.get("short_url"),
            "status": payment_link["status"]
        }

    except Exception as e:
        logger.error(f"Failed to create subscription: {e}")
        return None


def verify_payment_signature(
    subscription_id: str,
    payment_id: str,
    signature: str
) -> bool:
    """
    Verify Razorpay payment signature

    Args:
        subscription_id: Razorpay subscription ID
        payment_id: Razorpay payment ID
        signature: Razorpay signature to verify

    Returns:
        True if signature is valid, False otherwise
    """
    try:
        # Generate expected signature
        message = f"{subscription_id}|{payment_id}"
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

        # Compare signatures
        is_valid = hmac.compare_digest(expected_signature, signature)

        if is_valid:
            logger.info(f"Payment signature verified for subscription {subscription_id}")
        else:
            logger.warning(f"Invalid payment signature for subscription {subscription_id}")

        return is_valid

    except Exception as e:
        logger.error(f"Error verifying payment signature: {e}")
        return False


async def get_subscription_details(subscription_id: str) -> Optional[Dict[str, Any]]:
    """
    Get subscription details from Razorpay

    Args:
        subscription_id: Razorpay subscription ID

    Returns:
        Subscription details or None if not found
    """
    try:
        subscription = razorpay_client.subscription.fetch(subscription_id)
        return subscription
    except Exception as e:
        logger.error(f"Failed to fetch subscription details: {e}")
        return None


async def cancel_subscription(subscription_id: str) -> bool:
    """
    Cancel a subscription

    Args:
        subscription_id: Razorpay subscription ID

    Returns:
        True if successful, False otherwise
    """
    try:
        result = razorpay_client.subscription.cancel(subscription_id)
        logger.info(f"Cancelled subscription: {subscription_id}")
        return result.get("status") == "cancelled"
    except Exception as e:
        logger.error(f"Failed to cancel subscription: {e}")
        return False


def verify_webhook_signature(payload: str, signature: str, webhook_secret: str) -> bool:
    """
    Verify Razorpay webhook signature

    Args:
        payload: Webhook payload (raw body)
        signature: Signature from X-Razorpay-Signature header
        webhook_secret: Webhook secret from Razorpay dashboard

    Returns:
        True if signature is valid, False otherwise
    """
    try:
        expected_signature = hmac.new(
            webhook_secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_signature, signature)
    except Exception as e:
        logger.error(f"Error verifying webhook signature: {e}")
        return False
