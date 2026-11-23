/*
  Placeholder handlers. Every form on the site calls one of these, so the
  builder (or a developer) only has to replace this file to go live.
  Nothing here sends data anywhere.
*/

const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms))

const sampleId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

export type PaymentPurpose = "donation" | "order" | "offering"

export interface PaymentRequest {
  purpose: PaymentPurpose
  amount: number
  currency: string
  frequency?: "one-time" | "monthly"
  fund?: string
  lines?: unknown[]
  customer?: Record<string, string>
  fulfillment?: "ship" | "pickup"
  metadata?: Record<string, unknown>
}

export interface PaymentResult {
  ok: boolean
  reference: string
  sample: true
}

/**
 * Provider-agnostic payment entry point used by Donate, Store checkout and
 * Zapiski. TODO: connect a processor here.
 *   Stripe:        create a Checkout Session or PaymentIntent on a small
 *                  server endpoint, then redirect or confirm with Stripe.js.
 *                  Use mode "subscription" when frequency is "monthly".
 *   Authorize.net: request an Accept Hosted form token from a server
 *                  endpoint, then open the hosted payment page; use ARB for
 *                  monthly gifts.
 * Never put secret keys in this static site.
 */
export async function startPayment(request: PaymentRequest): Promise<PaymentResult> {
  await wait()
  console.info("[sample] payment not processed", request)
  return { ok: true, reference: sampleId(request.purpose === "order" ? "ORD" : "GIFT"), sample: true }
}

/** TODO: post to the parish form endpoint or an OrthodoxConnect inbox. */
export async function submitContactMessage(data: Record<string, string>): Promise<{ ok: boolean }> {
  await wait()
  console.info("[sample] contact message not sent", data)
  return { ok: true }
}

/** TODO: route to the priest or parish office (email, OrthodoxConnect inbox or a form service). */
export async function submitServiceRequest(data: { serviceId: string; recipients: string[]; fields: Record<string, string> }): Promise<{ ok: boolean; reference: string }> {
  await wait()
  console.info("[sample] service request not sent", data)
  return { ok: true, reference: sampleId("REQ") }
}

/** TODO: hand the names to the parish list for the commemoration date. */
export async function submitCommemorations(data: { slips: unknown[]; payment?: PaymentResult }): Promise<{ ok: boolean; reference: string }> {
  await wait(300)
  console.info("[sample] commemorations not sent", data)
  return { ok: true, reference: sampleId("ZAP") }
}

/** TODO: subscribe through the OrthodoxConnect newsletter API using site.orthodoxConnect.newsletter.listId. */
export async function subscribeNewsletter(data: { email: string; listId: string; parishId: string }): Promise<{ ok: boolean }> {
  await wait()
  console.info("[sample] newsletter subscription not sent", data)
  return { ok: true }
}

/**
 * TODO: sign the visitor in with their OrthodoxConnect account (OAuth or the
 * app's web handoff) and register the RSVP or slot sign-up there.
 */
export async function connectSignup(data: { parishId: string; itemType: "event" | "need"; itemId: string; slotId?: string; guests?: number }): Promise<{ ok: boolean }> {
  await wait()
  console.info("[sample] OrthodoxConnect sign-up not sent", data)
  return { ok: true }
}
