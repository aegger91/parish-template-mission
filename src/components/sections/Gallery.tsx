import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { PlaceholderArt } from "@/components/brand/PlaceholderArt"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { buttonVariants } from "@/components/ui/button"
import { fill } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Item {
  id: string
  category: string
  motif: string
  tone: string
  shape: "wide" | "tall" | "square"
  src: string | null
  caption: string
}

export function FilterChips({ options, value, onChange, label }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "h-9 rounded-full border px-4 font-tradition text-[0.9rem] transition-colors",
            value === o.id ? "border-ink bg-ink text-white" : "border-border bg-white text-ink-700 hover:border-ink-300",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Gallery({ items, categories, s }: { items: Item[]; categories: { id: string; label: string }[]; s: Record<string, string> }) {
  const [filter, setFilter] = useState("all")
  const [index, setIndex] = useState<number | null>(null)
  const visible = filter === "all" ? items : items.filter((i) => i.category === filter)
  const current = index != null ? visible[index] : null

  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i == null ? i : (i + dir + visible.length) % visible.length)),
    [visible.length],
  )

  useEffect(() => {
    if (index == null) return
    const onKey = (e: KeyboardEvent) => {
      const rtl = document.documentElement.dir === "rtl"
      if (e.key === "ArrowRight") step(rtl ? -1 : 1)
      if (e.key === "ArrowLeft") step(rtl ? 1 : -1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, step])

  return (
    <div>
      <FilterChips label={s.filterLabel} value={filter} onChange={setFilter} options={[{ id: "all", label: s.all }, ...categories]} />
      {visible.length === 0 ? (
        <p className="mt-8 text-ink-500">{s.noResults}</p>
      ) : (
        <ul className="mt-8 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] md:grid-cols-3 lg:grid-cols-4">
          {visible.map((item, i) => (
            <li key={item.id} className={cn("min-w-0", item.shape === "wide" && "col-span-2", item.shape === "tall" && "row-span-2")}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={fill(s.openImage, { name: item.caption })}
                className="group relative block h-full w-full overflow-hidden rounded-2xl"
              >
                <PlaceholderArt motif={item.motif} tone={item.tone} src={item.src} alt="" className="transition-transform duration-500 group-hover:scale-[1.03]" iconSize={item.shape === "wide" ? "22%" : "38%"} />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-3 pt-8 pb-3 text-start text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {item.caption}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-ink-500">{s.sampleImage}</p>

      <Dialog open={current != null} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent showCloseButton={false} className="max-w-[min(64rem,calc(100%-1.5rem))] gap-0 overflow-hidden rounded-[1.5rem] bg-white p-0 sm:max-w-[min(64rem,calc(100%-2rem))]">
          {current ? (
            <>
              <div className="relative aspect-[4/3] max-h-[70dvh] w-full sm:aspect-[16/10]">
                <PlaceholderArt motif={current.motif} tone={current.tone} src={current.src} alt={current.caption} label={s.sampleImage} iconSize="24%" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6">
                <div className="min-w-0">
                  <DialogTitle className="font-heading text-lg text-ink">{current.caption}</DialogTitle>
                  <p className="text-sm text-ink-500">{fill(s.imageOf, { n: (index ?? 0) + 1, total: visible.length })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => step(-1)} aria-label={s.previous} className={buttonVariants({ variant: "outline", size: "icon-sm" })}>
                    <ChevronLeft aria-hidden="true" className="rtl:rotate-180" />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label={s.nextItem} className={buttonVariants({ variant: "outline", size: "icon-sm" })}>
                    <ChevronRight aria-hidden="true" className="rtl:rotate-180" />
                  </button>
                  <button type="button" onClick={() => setIndex(null)} aria-label={s.close} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
                    <X aria-hidden="true" />
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
