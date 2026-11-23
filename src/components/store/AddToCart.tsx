import { useState } from "react"
import { Check, Minus, Plus, ShoppingBag } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cart } from "@/lib/cart"
import { fill, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Variant {
  id: string
  label: string
  labels: Record<string, string>
  price: number
  stock: number
}

interface Props {
  productId: string
  titles: Record<string, string>
  variants: Variant[]
  pickupOnly: boolean
  motif: string
  locale: string
  currency: string
  cartHref: string
  s: Record<string, string>
}

export function QuantityStepper({ value, max, onChange, s, size = "md" }: { value: number; max: number; onChange: (n: number) => void; s: Record<string, string>; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-9" : "h-11"
  return (
    <div className={cn("inline-flex items-center rounded-full border border-border bg-white", h)}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={s.decrease} className={cn("flex aspect-square h-full items-center justify-center rounded-full text-ink-700 hover:bg-stone-100 disabled:opacity-40")}>
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <span aria-live="polite" className="min-w-8 text-center font-tradition tabular-nums">
        <span className="sr-only">{s.quantity}: </span>
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={s.increase} className={cn("flex aspect-square h-full items-center justify-center rounded-full text-ink-700 hover:bg-stone-100 disabled:opacity-40")}>
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

export default function AddToCart({ productId, titles, variants, pickupOnly, motif, locale, currency, cartHref, s }: Props) {
  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0]
  const [variantId, setVariantId] = useState(firstInStock.id)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const variant = variants.find((v) => v.id === variantId)!
  const money = (n: number) => formatMoney(n, locale, currency)
  const out = variant.stock <= 0

  const add = () => {
    cart.addProduct({ productId, variantId, title: titles, variantLabel: variant.labels, unitPrice: variant.price, quantity: qty, maxQuantity: variant.stock, pickupOnly, motif })
    setAdded(true)
  }

  return (
    <div className="space-y-6">
      <p className="font-tradition text-3xl text-ink">{money(variant.price)}</p>
      {variants.length > 1 ? (
        <fieldset>
          <legend className="eyebrow mb-2.5">{s.option}</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <label key={v.id} className={cn("inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm has-focus-visible:outline-2 has-focus-visible:outline-blue", variantId === v.id ? "border-ink bg-ink text-white" : "border-border bg-white text-ink-700 hover:border-ink-300", v.stock <= 0 && "opacity-60")}>
                <input type="radio" name="variant" className="sr-only" checked={variantId === v.id} onChange={() => { setVariantId(v.id); setQty(1); setAdded(false) }} />
                {v.label}
                {v.stock <= 0 ? <span className="text-xs">({s.outOfStock})</span> : null}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <p className={cn("text-sm", out ? "text-destructive" : variant.stock <= 5 ? "text-gold" : "text-ink-600")}>
        {out ? s.outOfStock : variant.stock <= 5 ? fill(s.lowStock, { n: variant.stock }) : s.inStock}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {!out ? <QuantityStepper value={qty} max={variant.stock} onChange={(n) => { setQty(Math.max(1, Math.min(variant.stock, n))); setAdded(false) }} s={s} /> : null}
        <Button size="lg" onClick={add} disabled={out} className="flex-1 sm:flex-none">
          <ShoppingBag aria-hidden="true" />
          {s.addToCart}
        </Button>
      </div>

      {added ? (
        <p role="status" className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-line bg-blue-wash px-4 py-3 text-blue-deep">
          <Check aria-hidden="true" className="size-4" />
          {s.addedToCart}
          <a href={cartHref} className={cn(buttonVariants({ size: "sm" }), "ms-auto")}>
            {s.viewCart}
          </a>
        </p>
      ) : null}
    </div>
  )
}
