import { Webhooks } from "@dodopayments/nextjs";
import { adminDb } from "@/lib/firebase-admin";

// Utilities to safely extract fields from webhook payloads
function safeGet(obj: any, path: string[], defaultValue?: any) {
  return path.reduce((acc, key) => (acc && typeof acc === "object" ? acc[key] : undefined), obj) ?? defaultValue;
}

async function upsertUserSubscription(uid: string, data: {
  status: "active" | "cancelled" | "expired" | "payment_failed" | "on_hold" | "renewed";
  customerId?: string;
  subscriptionId?: string;
  interval?: "month" | "year";
  amount?: number;
  currency?: string;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  if (!adminDb) return;

  const userRef = adminDb.collection("users").doc(uid);
  const snapshot = await userRef.get();

  const update: any = {
    subscription: {
      tier: "premium",
      status:
        data.status === "on_hold"
          ? "payment_failed"
          : data.status === "renewed"
          ? "active"
          : (data.status as any),
      customerId: data.customerId ?? safeGet(snapshot.data(), ["subscription", "customerId"]),
      subscriptionId: data.subscriptionId ?? safeGet(snapshot.data(), ["subscription", "subscriptionId"]),
      interval: data.interval ?? safeGet(snapshot.data(), ["subscription", "interval"]),
      amount: typeof data.amount === "number" ? data.amount : safeGet(snapshot.data(), ["subscription", "amount"]),
      currency: data.currency ?? safeGet(snapshot.data(), ["subscription", "currency"]),
      currentPeriodEnd:
        data.currentPeriodEnd !== undefined
          ? data.currentPeriodEnd
          : safeGet(snapshot.data(), ["subscription", "currentPeriodEnd"]),
      cancelAtPeriodEnd:
        typeof data.cancelAtPeriodEnd === "boolean"
          ? data.cancelAtPeriodEnd
          : safeGet(snapshot.data(), ["subscription", "cancelAtPeriodEnd"]) ?? false,
      autoRenew: data.status !== "cancelled",
      updatedAt: new Date(),
    },
  };

  // If subscription is cancelled or expired, we keep tier as 'premium' until currentPeriodEnd passes.
  // A separate cleanup job can downgrade to 'free' after expiry if desired.

  await userRef.set(update, { merge: true });

  // Also persist a reverse lookup for customerId -> uid for resilience on future webhooks
  if (data.customerId) {
    await adminDb.collection("dodo_customers").doc(String(data.customerId)).set(
      {
        uid,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  }
}

function extractCommon(payload: any) {
  const type = payload?.type as string;

  // Attempt to retrieve metadata.uid we set during checkout
  const metadata =
    safeGet(payload, ["data", "metadata"]) ??
    safeGet(payload, ["metadata"]) ??
    safeGet(payload, ["data", "object", "metadata"]) ??
    {};

  const uid = metadata?.uid as string | undefined;

  // Extract subscription-ish object
  const data = payload?.data ?? {};
  const subscription =
    data.subscription ??
    data.object ??
    data; // fallback to top-level data if providers vary

  // Extract customer and subscription identifiers
  const customerId =
    subscription?.customer_id ??
    subscription?.customerId ??
    safeGet(subscription, ["customer", "id"]) ??
    safeGet(data, ["customer_id"]);

  const subscriptionId = subscription?.id ?? subscription?.subscription_id ?? safeGet(data, ["subscription_id"]);

  // Plan details
  const plan = subscription?.plan ?? subscription?.price ?? subscription?.plan_details ?? {};
  const amount =
    (typeof plan?.amount === "number" ? plan?.amount : undefined) ??
    (typeof data?.amount === "number" ? data?.amount : undefined);
  const currencyRaw =
    plan?.currency ?? data?.currency ?? subscription?.currency ?? "usd";
  const currency = typeof currencyRaw === "string" ? currencyRaw.toLowerCase() : "usd";

  const intervalRaw = plan?.interval ?? subscription?.interval ?? data?.interval;
  const interval: "month" | "year" | undefined =
    typeof intervalRaw === "string"
      ? intervalRaw.startsWith("month")
        ? "month"
        : intervalRaw.startsWith("year")
        ? "year"
        : undefined
      : undefined;

  // Period end (could be seconds since epoch or ISO)
  const periodEndRaw =
    subscription?.current_period_end ?? subscription?.currentPeriodEnd ?? data?.current_period_end;
  let currentPeriodEnd: Date | null | undefined = undefined;
  if (periodEndRaw === null) {
    currentPeriodEnd = null;
  } else if (typeof periodEndRaw === "number") {
    currentPeriodEnd = new Date(periodEndRaw * 1000);
  } else if (typeof periodEndRaw === "string") {
    const d = new Date(periodEndRaw);
    currentPeriodEnd = isNaN(d.getTime()) ? undefined : d;
  }

  const cancelAtPeriodEnd =
    subscription?.cancel_at_period_end ??
    subscription?.cancelAtPeriodEnd ??
    data?.cancel_at_period_end ??
    false;

  return {
    type,
    uid,
    customerId,
    subscriptionId,
    amount,
    currency,
    interval,
    currentPeriodEnd,
    cancelAtPeriodEnd: Boolean(cancelAtPeriodEnd),
    raw: payload,
  };
}

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    // Minimal logging for observability
    console.log("[Dodo Webhook] type:", payload?.type);
  },
  onSubscriptionActive: async (payload) => {
    const info = extractCommon(payload);
    const uid =
      info.uid ||
      (info.customerId
        ? (await adminDb?.collection("dodo_customers").doc(String(info.customerId)).get())?.data()?.uid
        : undefined);

    if (!uid) {
      console.warn("[Dodo Webhook] subscription.active without resolvable uid", {
        customerId: info.customerId,
      });
      return;
    }

    await upsertUserSubscription(uid, {
      status: "active",
      customerId: info.customerId,
      subscriptionId: info.subscriptionId,
      interval: info.interval,
      amount: info.amount,
      currency: info.currency,
      currentPeriodEnd: info.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: info.cancelAtPeriodEnd,
    });
  },
  onSubscriptionCancelled: async (payload) => {
    const info = extractCommon(payload);
    const uid =
      info.uid ||
      (info.customerId
        ? (await adminDb?.collection("dodo_customers").doc(String(info.customerId)).get())?.data()?.uid
        : undefined);

    if (!uid) {
      console.warn("[Dodo Webhook] subscription.cancelled without resolvable uid", {
        customerId: info.customerId,
      });
      return;
    }

    await upsertUserSubscription(uid, {
      status: "cancelled",
      customerId: info.customerId,
      subscriptionId: info.subscriptionId,
      interval: info.interval,
      amount: info.amount,
      currency: info.currency,
      currentPeriodEnd: info.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: true,
    });
  },
  onSubscriptionExpired: async (payload) => {
    const info = extractCommon(payload);
    const uid =
      info.uid ||
      (info.customerId
        ? (await adminDb?.collection("dodo_customers").doc(String(info.customerId)).get())?.data()?.uid
        : undefined);

    if (!uid) {
      console.warn("[Dodo Webhook] subscription.expired without resolvable uid", {
        customerId: info.customerId,
      });
      return;
    }

    await upsertUserSubscription(uid, {
      status: "expired",
      customerId: info.customerId,
      subscriptionId: info.subscriptionId,
      interval: info.interval,
      amount: info.amount,
      currency: info.currency,
      currentPeriodEnd: info.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: true,
    });
  },
  onSubscriptionFailed: async (payload) => {
    const info = extractCommon(payload);
    const uid =
      info.uid ||
      (info.customerId
        ? (await adminDb?.collection("dodo_customers").doc(String(info.customerId)).get())?.data()?.uid
        : undefined);

    if (!uid) {
      console.warn("[Dodo Webhook] subscription.failed without resolvable uid", {
        customerId: info.customerId,
      });
      return;
    }

    await upsertUserSubscription(uid, {
      status: "payment_failed",
      customerId: info.customerId,
      subscriptionId: info.subscriptionId,
      interval: info.interval,
      amount: info.amount,
      currency: info.currency,
      currentPeriodEnd: info.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: info.cancelAtPeriodEnd,
    });
  },
  onSubscriptionRenewed: async (payload) => {
    const info = extractCommon(payload);
    const uid =
      info.uid ||
      (info.customerId
        ? (await adminDb?.collection("dodo_customers").doc(String(info.customerId)).get())?.data()?.uid
        : undefined);

    if (!uid) {
      console.warn("[Dodo Webhook] subscription.renewed without resolvable uid", {
        customerId: info.customerId,
      });
      return;
    }

    await upsertUserSubscription(uid, {
      status: "renewed",
      customerId: info.customerId,
      subscriptionId: info.subscriptionId,
      interval: info.interval,
      amount: info.amount,
      currency: info.currency,
      currentPeriodEnd: info.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: info.cancelAtPeriodEnd,
    });
  },
});