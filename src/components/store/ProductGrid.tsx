import { useEffect, useState } from "react"
import { PlaceholderArt } from "@/components/brand/PlaceholderArt"
import { FilterChips } from "@/components/sections/Gallery"
import { cn } from "@/lib/utils"

export interface ProductCardData {
  id: string
  href: string
  category: string
  categoryLabel: string
  title: string
  summary: string
  priceLabel: string
  inStock: boolean
  motif: string
  tone: string
  src: string | null
  alt: string
  pickupOnly: boolean
}

export default function ProductGrid({ products, categories, s }: { products: ProductCardData[]; categories: { id: string; label: string }[]; s: Record<string, string> }) {
  const [filter, setFilter] = useState("all")
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category")
    if (c && categories.some((x) => x.id === c)) setFilter(c)
  }, [categories])
  const change = (v: string) => {
    setFilter(v)
    const url = new URL(window.location.href)
    if (v === "all") url.searchParams.delete("category")
    else url.searchParams.set("category", v)
    window.history.replaceState(null, "", url)
  }
  const visible = filter === "all" ? products : products.filter((p) => p.category === filter)

  return (
    <div>
      <FilterChips label={s.filterLabel} value={filter} onChange={change} options={[{ id: "all", label: s.all }, ...categories]} />
      {visible.length === 0 ? <p className="mt-8 text-ink-500">{s.noResults}</p> : null}
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((p) => (
          <li key={p.id} className="min-w-0">
            <a href={p.href} className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border bg-white transition-shadow hover:shadow-[var(--mission-shadow-lift)]">
              <div className="relative aspect-square">
                <PlaceholderArt motif={p.motif} tone={p.tone} src={p.src} alt={p.alt} label={s.replacePhoto ?? s.sampleImage} arch={false} iconSize="40%" />
                {!p.inStock ? (
                  <span className="absolute end-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[0.7rem] font-semibold text-ink-700">{s.outOfStock}</span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <p className="text-xs text-ink-500">{p.categoryLabel}</p>
                <h3 className="mt-1 font-heading text-[1.05rem] leading-snug text-ink group-hover:text-blue-deep sm:text-lg">{p.title}</h3>
                <p className={cn("mt-auto pt-3 font-tradition text-blue-deep")}>{p.priceLabel}</p>
                {p.pickupOnly ? <p className="mt-1 text-xs text-ink-500">{s.pickupOnly}</p> : null}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
