/**
 * lib/courier/steadfast.ts
 * Thin client for the Steadfast Courier merchant API.
 * Docs: https://portal.packzy.com/api/v1  (auth = Api-Key + Secret-Key headers)
 */
import type { AdminOrder } from "@/lib/orders/types";

const BASE_URL = process.env.STEADFAST_BASE_URL || "https://portal.packzy.com/api/v1";

type Creds = { apiKey: string; secretKey: string };

function headers({ apiKey, secretKey }: Creds): HeadersInit {
  return { "Api-Key": apiKey, "Secret-Key": secretKey, "Content-Type": "application/json", Accept: "application/json" };
}

export type SteadfastConsignment = {
  consignmentId: string;
  trackingCode: string;
  status: string;
};

export type SteadfastResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function call(path: string, creds: Creds, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: headers(creds),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  return { res, json };
}

/** Build the Steadfast payload from one of our orders. */
export function buildCreateOrderPayload(order: AdminOrder) {
  const codAmount = order.paymentStatus === "PAID" ? 0 : order.total;
  const itemDescription = order.items
    .map((i) => `${i.productName}${i.size ? ` (${i.size})` : ""} x${i.qty}`)
    .join(", ")
    .slice(0, 500);
  const address = `${order.address}, ${order.district}`.slice(0, 250);
  return {
    invoice: order.orderNumber,
    recipient_name: order.customerName.slice(0, 100),
    recipient_phone: order.customerPhone,
    recipient_address: address,
    cod_amount: codAmount,
    note: (order.customerNote ?? "").slice(0, 250),
    item_description: itemDescription,
    total_lot: order.items.reduce((s, i) => s + i.qty, 0),
    delivery_type: 0, // home delivery
  };
}

export async function createSteadfastConsignment(
  creds: Creds,
  order: AdminOrder
): Promise<SteadfastResult<SteadfastConsignment>> {
  try {
    const { res, json } = await call("/create_order", creds, {
      method: "POST",
      body: JSON.stringify(buildCreateOrderPayload(order)),
    });
    const consignment = json?.consignment as
      | { consignment_id?: number | string; tracking_code?: string; status?: string }
      | undefined;

    if (res.ok && json?.status === 200 && consignment?.consignment_id) {
      return {
        ok: true,
        data: {
          consignmentId: String(consignment.consignment_id),
          trackingCode: consignment.tracking_code ?? "",
          status: consignment.status ?? "in_review",
        },
      };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: "Steadfast rejected the API key / secret key. Check Settings → Courier." };
    }
    const msg =
      (typeof json?.message === "string" && json.message) ||
      (json?.errors ? JSON.stringify(json.errors) : "") ||
      `Steadfast returned HTTP ${res.status}.`;
    return { ok: false, error: msg };
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return {
      ok: false,
      error: timedOut ? "Steadfast took too long to respond. Try again." : "Could not reach Steadfast. Check the server's internet connection.",
    };
  }
}

/** Used by the "Test connection" button — also shows the merchant balance. */
export async function getSteadfastBalance(creds: Creds): Promise<SteadfastResult<{ balance: number }>> {
  try {
    const { res, json } = await call("/get_balance", creds);
    if (res.ok && json && typeof json.current_balance === "number") {
      return { ok: true, data: { balance: json.current_balance } };
    }
    if (res.status === 401 || res.status === 403 || json?.status === 401) {
      return { ok: false, error: "Steadfast rejected the API key / secret key." };
    }
    return { ok: false, error: (typeof json?.message === "string" && json.message) || `Steadfast returned HTTP ${res.status}.` };
  } catch {
    return { ok: false, error: "Could not reach Steadfast. Check the server's internet connection." };
  }
}
