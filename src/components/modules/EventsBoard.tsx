import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Check, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterChips } from "@/components/sections/Gallery"
import { addMonths, daysInMonth, formatDate, formatTime, localToday, startOfMonth, weekday, weekdayNames, addDays } from "@/lib/calendar"
import { fill } from "@/lib/format"
import { cn } from "@/lib/utils"
import ConnectDialog, { CapacityBar, ConnectBadge, type ConnectTarget } from "./ConnectDialog"

export interface EventItem {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  capacity: number
  signups: number
  organizer: string
  category: string
  categoryLabel: string
  connectHref: string
}

interface Props {
  events: EventItem[]
  categories: { id: string; label: string }[]
  limit?: number
  showCalendar: boolean
  allHref?: string | null
  initialToday: string
  locale: string
  weekStartsOn: number
  parishId: string
  s: Record<string, string>
}

function EventCard({ ev, locale, s, going, onRsvp }: { ev: EventItem; locale: string; s: Record<string, string>; going: boolean; onRsvp: () => void }) {
  const full = ev.signups >= ev.capacity
  return (
    <li className="flex min-w-0 flex-col gap-4 rounded-[1.5rem] border border-border bg-white p-4 sm:flex-row sm:p-5">
      <div className="kiot-arch flex h-24 w-20 shrink-0 flex-col items-center justify-center border border-gold-line bg-stone-50 text-center">
        <span className="text-xs font-semibold tracking-[0.16em] text-ink-500 uppercase">{formatDate(ev.date, locale, { month: "short" })}</span>
        <span className="font-tradition text-3xl leading-none text-ink">{formatDate(ev.date, locale, { day: "numeric" })}</span>
        <span className="mt-1 text-[0.7rem] text-ink-500">{formatDate(ev.date, locale, { weekday: "short" })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">{ev.categoryLabel}</span>
          <ConnectBadge label={s.onConnect} />
        </div>
        <h3 className="mt-2 text-xl leading-snug text-ink">
          <a href={ev.connectHref} rel="noopener" className="hover:text-blue-deep">
            {ev.title}
          </a>
        </h3>
        <p className="mt-1 text-ink-600">{ev.description}</p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-600">
          <li className="inline-flex items-center gap-1.5"><Clock aria-hidden="true" className="size-3.5 text-gold" />{formatTime(ev.time, locale)}</li>
          <li className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-3.5 text-gold" /><span className="sr-only">{s.location}: </span>{ev.location}</li>
          <li className="inline-flex items-center gap-1.5"><User aria-hidden="true" className="size-3.5 text-gold" /><span className="sr-only">{s.organizer}: </span>{ev.organizer}</li>
        </ul>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <CapacityBar signups={ev.signups} capacity={ev.capacity} s={s} />
          </div>
          {going ? (
            <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-blue-wash px-4 font-tradition text-sm text-blue-deep">
              <Check aria-hidden="true" className="size-4" />
              {s.going}
            </span>
          ) : (
            <Button size="sm" variant={full ? "secondary" : "default"} disabled={full} onClick={onRsvp}>
              {full ? s.full : s.rsvp}
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}

export default function EventsBoard({ events, categories, limit, showCalendar, allHref, initialToday, locale, weekStartsOn, parishId, s }: Props) {
  const [today, setToday] = useState(initialToday)
  useEffect(() => setToday(localToday()), [])
  const [items, setItems] = useState(events)
  const [going, setGoing] = useState<Record<string, boolean>>({})
  const [target, setTarget] = useState<ConnectTarget | null>(null)
  const [filter, setFilter] = useState("all")
  const [view, setView] = useState<"list" | "calendar">("list")
  const upcoming = useMemo(() => items.filter((e) => e.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [items, today])
  const filtered = filter === "all" ? upcoming : upcoming.filter((e) => e.category === filter)
  const shown = limit ? filtered.slice(0, limit) : filtered
  const [month, setMonth] = useState(startOfMonth(upcoming[0]?.date ?? initialToday))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const rsvp = (ev: EventItem) =>
    setTarget({ itemType: "event", itemId: ev.id, title: ev.title, subtitle: `${formatDate(ev.date, locale, { weekday: "long", month: "long", day: "numeric" })}, ${formatTime(ev.time, locale)}`, allowGuests: true, maxGuests: Math.min(6, ev.capacity - ev.signups) })

  const confirmed = (t: ConnectTarget, guests: number) => {
    setItems((all) => all.map((e) => (e.id === t.itemId ? { ...e, signups: Math.min(e.capacity, e.signups + guests) } : e)))
    setGoing((g) => ({ ...g, [t.itemId]: true }))
    setTarget(null)
  }

  const names = weekdayNames(locale, weekStartsOn, "short")
  const leading = (weekday(month) - weekStartsOn + 7) % 7
  const monthDays = Array.from({ length: daysInMonth(month) }, (_, i) => addDays(month, i))
  const byDay = (d: string) => filtered.filter((e) => e.date === d)
  const monthEvents = filtered.filter((e) => e.date.startsWith(month.slice(0, 7)))
  const dayEvents = selectedDay ? byDay(selectedDay) : monthEvents

  return (
    <div>
      {!limit ? (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <FilterChips label={s.filterLabel} value={filter} onChange={setFilter} options={[{ id: "all", label: s.all }, ...categories]} />
          {showCalendar ? (
            <div role="group" aria-label={s.viewLabel} className="flex shrink-0 rounded-full bg-stone-100 p-1">
              {(["list", "calendar"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={cn("h-9 flex-1 rounded-full px-5 font-tradition text-[0.92rem]", view === v ? "bg-white text-ink shadow-sm" : "text-ink-600")}>
                  {v === "list" ? s.listView : s.calendarView}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {view === "calendar" && !limit ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="min-w-0 rounded-[1.5rem] border border-border bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <Button variant="ghost" size="icon-sm" aria-label={s.previousMonth} onClick={() => { setMonth(addMonths(month, -1)); setSelectedDay(null) }}>
                <ChevronLeft aria-hidden="true" className="rtl:rotate-180" />
              </Button>
              <p aria-live="polite" className="font-heading text-lg text-ink">{formatDate(month, locale, { month: "long", year: "numeric" })}</p>
              <Button variant="ghost" size="icon-sm" aria-label={s.nextMonth} onClick={() => { setMonth(addMonths(month, 1)); setSelectedDay(null) }}>
                <ChevronRight aria-hidden="true" className="rtl:rotate-180" />
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.7rem] font-semibold tracking-wider text-ink-500 uppercase">
              {names.map((n) => (
                <span key={n} className="truncate">{n}</span>
              ))}
            </div>
            <ol className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: leading }, (_, i) => (
                <li key={`p${i}`} aria-hidden="true" />
              ))}
              {monthDays.map((d) => {
                const count = byDay(d).length
                const selected = selectedDay === d
                return (
                  <li key={d}>
                    <button
                      type="button"
                      disabled={count === 0}
                      aria-pressed={selected}
                      aria-label={`${formatDate(d, locale, { weekday: "long", month: "long", day: "numeric" })}${count ? `, ${count}` : ""}`}
                      onClick={() => setSelectedDay(selected ? null : d)}
                      className={cn(
                        "flex aspect-square w-full flex-col items-center justify-center rounded-xl text-sm transition-colors",
                        count ? "bg-blue-wash text-blue-deep hover:bg-blue hover:text-white" : "text-ink-500",
                        selected && "bg-blue text-white",
                        d === today && "ring-2 ring-gold",
                      )}
                    >
                      <span className="font-tradition">{formatDate(d, locale, { day: "numeric" })}</span>
                      {count ? <span aria-hidden="true" className="mt-0.5 flex gap-0.5">{Array.from({ length: Math.min(count, 3) }, (_, i) => <span key={i} className="size-1 rounded-full bg-current" />)}</span> : null}
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
          <div className="min-w-0">
            <p className="eyebrow mb-3">{selectedDay ? fill(s.eventsOnDay, { date: formatDate(selectedDay, locale, { month: "long", day: "numeric" }) }) : formatDate(month, locale, { month: "long", year: "numeric" })}</p>
            {dayEvents.length === 0 ? <p className="text-ink-500">{s.noEvents}</p> : null}
            <ul className="space-y-4">
              {dayEvents.map((ev) => (
                <EventCard key={ev.id} ev={ev} locale={locale} s={s} going={!!going[ev.id]} onRsvp={() => rsvp(ev)} />
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          {shown.length === 0 ? <p className="text-ink-500">{s.noResults}</p> : null}
          <ul className={cn("grid gap-4", limit ? "lg:grid-cols-3 [&>li]:sm:flex-col" : "lg:grid-cols-2")}>
            {shown.map((ev) => (
              <EventCard key={ev.id} ev={ev} locale={locale} s={s} going={!!going[ev.id]} onRsvp={() => rsvp(ev)} />
            ))}
          </ul>
          {limit && allHref ? (
            <a href={allHref} className="mt-6 inline-flex items-center gap-1.5 font-tradition text-blue hover:text-blue-deep">
              {s.seeAllEvents}
              <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
            </a>
          ) : null}
        </>
      )}

      <ConnectDialog target={target} parishId={parishId} s={s} onClose={() => setTarget(null)} onConfirmed={confirmed} />
    </div>
  )
}
