import { useState } from "react"
import { Check, Loader2, Lock, Store, Truck } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, inputClass } from "@/components/sections/ContactForm"
import { cart, useCart } from "@/lib/cart"
import { startPayment } from "@/lib/handlers"
import { fill, isCompletePhone, isEmail, maskPhone } from "@/lib/format"
import { cn } from "@/lib/utils"
import { cartTotals, LineRow, Totals, type CartConfig } from "./CartView"

const empty = { name: "", email: "", phone: "", street: "", city: "", region: "", postalCode: "" }

export default function Checkout({ cfg, s, fulfillmentOptions, pickupNote }: { cfg: CartConfig; s: Record<string, string>; fulfillmentOptions: ("ship" | "pickup")[]; pickupNote: string }) {
  const lines = useCart()
  const forcedPickup = lines.some((l) => l.kind === "product" && l.pickupOnly) || !fulfillmentOptions.includes("ship")
  const [choice, setChoice] = useState<"ship" | "pickup">(fulfillmentOptions[0] ?? "ship")
  const fulfillment = forcedPickup ? "pickup" : choice
  const totals = cartTotals(lines, cfg, fulfillment)
  const needsFulfillment = totals.products.length > 0
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<"idle" | "sending">("idle")
  const [done, setDone] = useState<string | null>(null)
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [k]: k === "phone" ? maskPhone(e.target.value) : e.target.value }))

  if (done) {
    return (
      <div role="status" className="mx-auto max-w-xl rounded-[1.75rem] border border-blue-line bg-blue-wash p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue text-white">
          <Check aria-hidden="true" />
        </span>
        <p className="mt-4 text-lg text-ink">{fill(s.orderPlaced, { id: done })}</p>
        <a href={cfg.storeHref} className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
          {s.continueShopping}
        </a>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-[1.75rem] border border-dashed border-stone-300 bg-white p-10 text-center">
        <p className="text-lg text-ink-700">{s.cartEmpty}</p>
        <a href={cfg.storeHref} className={cn(buttonVariants(), "mt-6")}>
          {s.continueShopping}
        </a>
      </div>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!values.name.trim()) next.name = s.formRequired
    if (!isEmail(values.email)) next.email = s.formInvalidEmail
    if (values.phone && !isCompletePhone(values.phone)) next.phone = s.invalidPhone
    if (needsFulfillment && fulfillment === "ship") {
      for (const k of ["street", "city", "region", "postalCode"] as const) if (!values[k].trim()) next[k] = s.formRequired
    }
    setErrors(next)
    if (Object.keys(next).length) {
      document.getElementById(`co-${Object.keys(next)[0]}`)?.focus()
      return
    }
    setState("sending")
    const result = await startPayment({ purpose: "order", amount: totals.total, currency: cfg.currency, lines, customer: values, fulfillment: needsFulfillment ? fulfillment : undefined })
    cart.clear()
    setDone(result.reference)
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0 space-y-8">
        {needsFulfillment ? (
          <fieldset className="rounded-[1.5rem] border border-border bg-white p-5 sm:p-6">
            <legend className="sr-only">{s.fulfillment}</legend>
            <p aria-hidden="true" className="font-heading text-xl text-ink">{s.fulfillment}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["ship", "pickup"] as const)
                .filter((o) => fulfillmentOptions.includes(o))
                .map((o) => {
                  const disabled = o === "ship" && forcedPickup
                  const active = fulfillment === o
                  const Icon = o === "ship" ? Truck : Store
                  return (
                    <label key={o} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4 has-focus-visible:outline-2 has-focus-visible:outline-blue", active ? "border-blue bg-blue-wash" : "border-border", disabled && "cursor-not-allowed opacity-50")}>
                      <input type="radio" name="fulfillment" className="sr-only" disabled={disabled} checked={active} onChange={() => setChoice(o)} />
                      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", active ? "text-blue" : "text-ink-500")} />
                      <span className="min-w-0">
                        <span className="block font-tradition text-ink">{o === "ship" ? s.fulfillShip : s.fulfillPickup}</span>
                        {o === "pickup" ? <span className="mt-1 block text-sm text-ink-600">{pickupNote}</span> : null}
                      </span>
                    </label>
                  )
                })}
            </div>
            {forcedPickup && fulfillmentOptions.includes("ship") ? <p className="mt-3 text-sm text-ink-600">{s.pickupForced}</p> : null}
          </fieldset>
        ) : null}

        <fieldset className="grid gap-4 rounded-[1.5rem] border border-border bg-white p-5 sm:grid-cols-2 sm:p-6">
          <legend className="sr-only">{s.yourDetails}</legend>
          <p aria-hidden="true" className="font-heading text-xl text-ink sm:col-span-2">{s.yourDetails}</p>
          <div className="sm:col-span-2">
            <Field id="co-name" label={s.formName} error={errors.name}>
              <Input id="co-name" autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={!!errors.name} className={inputClass} />
            </Field>
          </div>
          <Field id="co-email" label={s.formEmail} error={errors.email}>
            <Input id="co-email" type="email" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={!!errors.email} className={inputClass} />
          </Field>
          <Field id="co-phone" label={s.formPhone} error={errors.phone} hint={s.phoneFormat}>
            <Input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(000)-000-0000" value={values.phone} onChange={set("phone")} aria-invalid={!!errors.phone} className={inputClass} />
          </Field>
        </fieldset>

        {needsFulfillment && fulfillment === "ship" ? (
          <fieldset className="grid gap-4 rounded-[1.5rem] border border-border bg-white p-5 sm:grid-cols-2 sm:p-6">
            <legend className="sr-only">{s.shippingAddress}</legend>
            <p aria-hidden="true" className="font-heading text-xl text-ink sm:col-span-2">{s.shippingAddress}</p>
            <div className="sm:col-span-2">
              <Field id="co-street" label={s.street} error={errors.street}>
                <Input id="co-street" autoComplete="street-address" value={values.street} onChange={set("street")} aria-invalid={!!errors.street} className={inputClass} />
              </Field>
            </div>
            <Field id="co-city" label={s.city} error={errors.city}>
              <Input id="co-city" autoComplete="address-level2" value={values.city} onChange={set("city")} aria-invalid={!!errors.city} className={inputClass} />
            </Field>
            <Field id="co-region" label={s.region} error={errors.region}>
              <Input id="co-region" autoComplete="address-level1" value={values.region} onChange={set("region")} aria-invalid={!!errors.region} className={inputClass} />
            </Field>
            <Field id="co-postalCode" label={s.postalCode} error={errors.postalCode}>
              <Input id="co-postalCode" autoComplete="postal-code" value={values.postalCode} onChange={set("postalCode")} aria-invalid={!!errors.postalCode} className={inputClass} />
            </Field>
          </fieldset>
        ) : null}
      </div>

      <aside className="min-w-0">
        <div className="space-y-5 rounded-[1.5rem] border border-border bg-white p-5 shadow-[var(--mission-shadow-soft)] lg:sticky lg:top-24">
          <h2 className="font-heading text-xl text-ink">{s.orderSummary}</h2>
          <ul className="divide-y divide-border">
            {lines.map((l) => (
              <LineRow key={l.key} line={l} cfg={cfg} s={s} editable={false} />
            ))}
          </ul>
          <Totals totals={totals} cfg={cfg} s={s} />
          <Button type="submit" size="lg" className="w-full" disabled={state === "sending"}>
            {state === "sending" ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Lock aria-hidden="true" />}
            {s.placeOrder}
          </Button>
          <p className="text-xs leading-relaxed text-ink-500">{s.orderSampleNote}</p>
        </div>
      </aside>
    </form>
  )
}
