import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react"
import { Pictogram } from "@/components/brand/Pictogram"
import { buttonVariants } from "@/components/ui/button"
import { cart, lineTotal, useCart, type CartLine } from "@/lib/cart"
import { fill, formatMoney, pick } from "@/lib/format"
import { cn } from "@/lib/utils"
import { QuantityStepper } from "./AddToCart"

export interface CartConfig {
  lang: string
  defaultLang: string
  locale: string
  currency: string
  shippingFlat: number
  freeShippingOver: number
  storeHref: string
  checkoutHref: string
}

export function cartTotals(lines: CartLine[], cfg: Pick<CartConfig, "shippingFlat" | "freeShippingOver">, fulfillment: "ship" | "pickup" = "ship") {
  const products = lines.filter((l) => l.kind === "product")
  const offerings = lines.filter((l) => l.kind === "offering")
  const productSubtotal = products.reduce((n, l) => n + lineTotal(l), 0)
  const offeringTotal = offerings.reduce((n, l) => n + lineTotal(l), 0)
  const shipping = products.length === 0 || fulfillment === "pickup" || productSubtotal >= cfg.freeShippingOver ? 0 : cfg.shippingFlat
  return { products, offerings, productSubtotal, offeringTotal, shipping, total: productSubtotal + offeringTotal + shipping }
}

export function LineRow({ line, cfg, s, editable }: { line: CartLine; cfg: CartConfig; s: Record<string, string>; editable: boolean }) {
  const money = (n: number) => formatMoney(n, cfg.locale, cfg.currency)
  const title = pick(line.title as any, cfg.lang, cfg.defaultLang)
  return (
    <li className="flex gap-4 py-4">
      <span className={cn("flex size-16 shrink-0 items-center justify-center rounded-2xl border border-border", line.kind === "offering" ? "bg-gold-wash text-gold" : "bg-stone-50 text-blue")}>
        <Pictogram name={line.kind === "product" ? (line.motif ?? "church") : line.offeringType === "candle" ? "candle" : line.offeringType === "zapiska" ? "slip" : "church"} size={30} strokeWidth={1.2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-heading text-lg leading-snug text-ink">{title}</p>
            {line.kind === "product" ? <p className="text-sm text-ink-500">{pick(line.variantLabel as any, cfg.lang, cfg.defaultLang)}</p> : null}
            {line.kind === "offering" && line.names?.length ? <p className="mt-0.5 text-sm text-ink-600">{line.names.join(", ")}</p> : null}
          </div>
          <p className="shrink-0 font-tradition text-ink tabular-nums">{money(lineTotal(line))}</p>
        </div>
        {editable ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {line.kind === "product" ? <QuantityStepper size="sm" value={line.quantity} max={line.maxQuantity} onChange={(n) => cart.setQuantity(line.key, Math.max(1, n))} s={s} /> : null}
            <button type="button" onClick={() => cart.remove(line.key)} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-destructive">
              <Trash2 aria-hidden="true" className="size-4" />
              {s.remove}
            </button>
          </div>
        ) : line.kind === "product" ? (
          <p className="text-sm text-ink-500">
            {s.quantity}: {line.quantity}
          </p>
        ) : null}
      </div>
    </li>
  )
}

export function Totals({ totals, cfg, s }: { totals: ReturnType<typeof cartTotals>; cfg: CartConfig; s: Record<string, string> }) {
  const money = (n: number) => formatMoney(n, cfg.locale, cfg.currency)
  return (
    <dl className="space-y-2 text-ink-700">
      {totals.products.length > 0 ? (
        <>
          <div className="flex justify-between gap-3"><dt>{s.subtotal}</dt><dd className="tabular-nums">{money(totals.productSubtotal)}</dd></div>
          <div className="flex justify-between gap-3"><dt>{s.shipping}</dt><dd className="tabular-nums">{totals.shipping === 0 ? s.shippingFree : money(totals.shipping)}</dd></div>
        </>
      ) : null}
      {totals.offerings.length > 0 ? (
        <div className="flex justify-between gap-3"><dt>{s.offerings}</dt><dd className="tabular-nums">{money(totals.offeringTotal)}</dd></div>
      ) : null}
      <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3 text-ink">
        <dt className="font-medium">{s.total}</dt>
        <dd className="font-tradition text-2xl tabular-nums">{money(totals.total)}</dd>
      </div>
    </dl>
  )
}

export default function CartView({ cfg, s }: { cfg: CartConfig; s: Record<string, string> }) {
  const lines = useCart()
  const totals = cartTotals(lines, cfg)

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-[1.75rem] border border-dashed border-stone-300 bg-white p-10 text-center">
        <ShoppingBag aria-hidden="true" className="mx-auto size-10 text-ink-300" strokeWidth={1.2} />
        <p className="mt-4 text-lg text-ink-700">{s.cartEmpty}</p>
        <a href={cfg.storeHref} className={cn(buttonVariants(), "mt-6")}>
          {s.continueShopping}
        </a>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        {totals.products.length > 0 ? (
          <ul className="divide-y divide-border rounded-[1.5rem] border border-border bg-white px-5">
            {totals.products.map((l) => (
              <LineRow key={l.key} line={l} cfg={cfg} s={s} editable />
            ))}
          </ul>
        ) : null}
        {totals.offerings.length > 0 ? (
          <div>
            <h2 className="eyebrow mb-3">{s.offerings}</h2>
            <ul className="divide-y divide-border rounded-[1.5rem] border border-gold-line bg-white px-5">
              {totals.offerings.map((l) => (
                <LineRow key={l.key} line={l} cfg={cfg} s={s} editable />
              ))}
            </ul>
            <p className="mt-2 text-sm text-ink-500">{s.offeringsNote}</p>
          </div>
        ) : null}
        <a href={cfg.storeHref} className="inline-flex font-tradition text-blue hover:text-blue-deep">
          {s.continueShopping}
        </a>
      </div>
      <aside className="min-w-0">
        <div className="space-y-5 rounded-[1.5rem] border border-border bg-white p-5 shadow-[var(--mission-shadow-soft)] lg:sticky lg:top-24">
          <Totals totals={totals} cfg={cfg} s={s} />
          {totals.products.length > 0 && totals.shipping > 0 ? <p className="text-sm text-ink-500">{fill(s.freeShippingOver, { amount: formatMoney(cfg.freeShippingOver, cfg.locale, cfg.currency) })}</p> : null}
          <a href={cfg.checkoutHref} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            {s.goToCheckout}
            <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
          </a>
        </div>
      </aside>
    </div>
  )
}
