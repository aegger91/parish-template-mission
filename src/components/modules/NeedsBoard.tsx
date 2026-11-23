import { useState } from "react"
import { Check, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterChips } from "@/components/sections/Gallery"
import { formatDate, formatTime } from "@/lib/calendar"
import { cn } from "@/lib/utils"
import ConnectDialog, { CapacityBar, ConnectBadge, type ConnectTarget } from "./ConnectDialog"

interface Slot {
  id: string
  date: string
  time: string
  capacity: number
  signups: number
}

export interface NeedItem {
  id: string
  title: string
  description: string
  location: string
  organizer: string
  category: string
  categoryLabel: string
  connectHref: string
  slots: Slot[]
}

export default function NeedsBoard({ needs, categories, locale, parishId, s }: { needs: NeedItem[]; categories: { id: string; label: string }[]; locale: string; parishId: string; s: Record<string, string> }) {
  const [items, setItems] = useState(needs)
  const [mine, setMine] = useState<Record<string, boolean>>({})
  const [target, setTarget] = useState<ConnectTarget | null>(null)
  const [filter, setFilter] = useState("all")
  const visible = filter === "all" ? items : items.filter((n) => n.category === filter)

  const confirmed = (t: ConnectTarget) => {
    setItems((all) => all.map((n) => (n.id === t.itemId ? { ...n, slots: n.slots.map((sl) => (sl.id === t.slotId ? { ...sl, signups: Math.min(sl.capacity, sl.signups + 1) } : sl)) } : n)))
    setMine((m) => ({ ...m, [t.slotId!]: true }))
    setTarget(null)
  }

  return (
    <div>
      <FilterChips label={s.filterLabel} value={filter} onChange={setFilter} options={[{ id: "all", label: s.all }, ...categories]} />
      {visible.length === 0 ? <p className="mt-8 text-ink-500">{s.noResults}</p> : null}
      <ul className="mt-8 grid gap-5 lg:grid-cols-2">
        {visible.map((need) => (
          <li key={need.id} className="flex min-w-0 flex-col rounded-[1.5rem] border border-border bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold-wash px-2.5 py-0.5 text-xs font-medium text-ink-700 ring-1 ring-gold-line">{need.categoryLabel}</span>
              <ConnectBadge label={s.onConnect} />
            </div>
            <h3 className="mt-3 text-2xl leading-snug text-ink">
              <a href={need.connectHref} rel="noopener" className="hover:text-blue-deep">
                {need.title}
              </a>
            </h3>
            <p className="mt-2 text-ink-600">{need.description}</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-600">
              <li className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-3.5 text-gold" /><span className="sr-only">{s.location}: </span>{need.location}</li>
              <li className="inline-flex items-center gap-1.5"><User aria-hidden="true" className="size-3.5 text-gold" /><span className="sr-only">{s.organizer}: </span>{need.organizer}</li>
            </ul>
            <p className="eyebrow mt-5 mb-2">{s.slotsLabel}</p>
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {need.slots.map((slot) => {
                const full = slot.signups >= slot.capacity
                const signed = !!mine[slot.id]
                return (
                  <li key={slot.id} className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center">
                    <div className="w-full shrink-0 sm:w-40">
                      <p className="font-tradition text-ink">{formatDate(slot.date, locale, { weekday: "short", month: "short", day: "numeric" })}</p>
                      <p className="text-sm text-ink-500">{formatTime(slot.time, locale)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <CapacityBar signups={slot.signups} capacity={slot.capacity} s={s} />
                    </div>
                    {signed ? (
                      <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-blue-wash px-4 font-tradition text-sm text-blue-deep">
                        <Check aria-hidden="true" className="size-4" />
                        {s.signedUp}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant={full ? "secondary" : "outline"}
                        disabled={full}
                        className={cn("shrink-0")}
                        onClick={() => setTarget({ itemType: "need", itemId: need.id, slotId: slot.id, title: need.title, subtitle: `${formatDate(slot.date, locale, { weekday: "long", month: "long", day: "numeric" })}, ${formatTime(slot.time, locale)}` })}
                      >
                        {full ? s.full : s.signUp}
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
      <ConnectDialog target={target} parishId={parishId} s={s} onClose={() => setTarget(null)} onConfirmed={(t) => confirmed(t)} />
    </div>
  )
}
