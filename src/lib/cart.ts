import { useSyncExternalStore } from "react"

/*
  Cart shared by the store and the zapiski form. Lives in localStorage so it
  survives page loads on a static host. Two kinds of lines:
    product   a store item with a variant, may need shipping
    offering  a zapiska, candle or donation; never shipped
*/

export interface ProductLine {
  kind: "product"
  key: string
  productId: string
  variantId: string
  title: Record<string, string> | string
  variantLabel: Record<string, string> | string
  unitPrice: number
  quantity: number
  maxQuantity: number
  pickupOnly?: boolean
  motif?: string
  href?: Record<string, string>
}

export interface OfferingLine {
  kind: "offering"
  key: string
  offeringType: "zapiska" | "candle" | "donation"
  title: Record<string, string> | string
  detail?: Record<string, string> | string
  names?: string[]
  amount: number
  quantity: 1
}

export type CartLine = ProductLine | OfferingLine

const STORAGE_KEY = "mission-cart-v1"
const listeners = new Set<() => void>()
let cache: CartLine[] | null = null
const EMPTY: CartLine[] = []

function read(): CartLine[] {
  if (typeof window === "undefined") return EMPTY
  if (cache) return cache
  try {
    cache = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")
  } catch {
    cache = []
  }
  return cache!
}

function write(lines: CartLine[]) {
  cache = lines
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    /* storage may be unavailable in private mode; the cart still works for this page */
  }
  listeners.forEach((l) => l())
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      cache = null
      listeners.forEach((l) => l())
    }
  })
}

export const cart = {
  get: read,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  addProduct(line: Omit<ProductLine, "kind" | "key">) {
    const key = `${line.productId}:${line.variantId}`
    const lines = [...read()]
    const existing = lines.find((l) => l.key === key) as ProductLine | undefined
    if (existing) {
      existing.quantity = Math.min(existing.maxQuantity, existing.quantity + line.quantity)
      write(lines.map((l) => (l.key === key ? { ...existing } : l)))
    } else {
      write([...lines, { ...line, kind: "product", key }])
    }
  },
  addOfferings(offerings: Omit<OfferingLine, "kind" | "key" | "quantity">[]) {
    const stamp = Date.now().toString(36)
    write([
      ...read(),
      ...offerings.map((o, i) => ({ ...o, kind: "offering" as const, key: `offering-${stamp}-${i}`, quantity: 1 as const })),
    ])
  },
  setQuantity(key: string, quantity: number) {
    write(
      read()
        .map((l) => (l.key === key && l.kind === "product" ? { ...l, quantity: Math.max(0, Math.min(l.maxQuantity, quantity)) } : l))
        .filter((l) => l.quantity > 0),
    )
  },
  remove(key: string) {
    write(read().filter((l) => l.key !== key))
  },
  clear() {
    write([])
  },
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(cart.subscribe, read, () => EMPTY)
}

export function lineTotal(line: CartLine): number {
  return line.kind === "product" ? line.unitPrice * line.quantity : line.amount
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0)
}
