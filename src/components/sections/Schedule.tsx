import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  addDays,
  addMonths,
  buildDays,
  daysInMonth,
  formatDate,
  formatTime,
  localToday,
  startOfMonth,
  startOfWeek,
  weekday,
  weekdayNames,
  type DaySchedule,
  type ScheduleData,
} from "@/lib/calendar"
import { fill } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
  data: ScheduleData
  initialToday: string
  locale: string
  weekStartsOn: number
  startView: "week" | "month"
  highlightRanks: string[]
  liveOn: boolean
  calendarNote: string
  note: string
  s: Record<string, string>
}

function FeastTag({ day, s }: { day: DaySchedule; s: Record<string, string> }) {
  if (day.feasts.length === 0) return null
  return (
    <div className="space-y-1">
      {day.feasts.map((f) => (
        <p key={f.id} className="text-sm leading-snug text-ink">
          <span className={cn("me-1.5 inline-block rounded-full px-2 py-px align-middle text-[0.65rem] font-semibold tracking-wider uppercase", f.rank === "great" ? "bg-blue text-white" : "bg-gold-wash text-ink-700 ring-1 ring-gold-line")}>
            {f.rank === "great" ? s.greatFeast : s.feast}
          </span>
          <span className="font-heading">{f.title}</span>
        </p>
      ))}
    </div>
  )
}

function ServiceRow({ svc, locale, liveOn, s, compact, stackOnDesktop }: { svc: DaySchedule["services"][number]; locale: string; liveOn: boolean; s: Record<string, string>; compact?: boolean; stackOnDesktop?: boolean }) {
  const live = liveOn && svc.livestream ? <Radio aria-label={s.streamed} className="size-3.5 shrink-0 text-blue" /> : null
  return (
    <li className={cn("flex items-baseline gap-3", compact ? "py-0.5 text-[0.8rem] leading-snug" : "py-1.5", stackOnDesktop && "lg:flex-col lg:gap-0.5 lg:py-2")}>
      <span className={cn("inline-flex shrink-0 items-center gap-1.5 font-tradition text-blue-deep tabular-nums", compact ? "w-auto" : "w-[4.8rem]", stackOnDesktop && "lg:w-auto lg:text-sm")}>
        {formatTime(svc.time, locale)}
        {stackOnDesktop ? <span className="hidden lg:inline-flex">{live}</span> : null}
      </span>
      <span className={cn("min-w-0 flex-1 text-ink", stackOnDesktop && "lg:text-[0.92rem] lg:leading-snug")}>
        {svc.title}
        {!compact && svc.note ? <span className="block text-sm text-ink-500">{svc.note}</span> : null}
      </span>
      {live ? <span className={cn("self-center", stackOnDesktop && "lg:hidden")}>{live}</span> : null}
    </li>
  )
}

function dayHighlight(day: DaySchedule, ranks: string[]) {
  return day.feasts.some((f) => ranks.includes(f.rank))
}

export default function Schedule({ data, initialToday, locale, weekStartsOn, startView, highlightRanks, liveOn, calendarNote, note, s }: Props) {
  const [today, setToday] = useState(initialToday)
  const [view, setView] = useState<"week" | "month">(startView)
  const [anchor, setAnchor] = useState(initialToday)

  useEffect(() => {
    const t = localToday()
    setToday(t)
    setAnchor(t)
    const fromHash = new URLSearchParams(window.location.search).get("view")
    if (fromHash === "month" || fromHash === "week") setView(fromHash)
  }, [])

  const weekStart = startOfWeek(anchor, weekStartsOn)
  const monthStart = startOfMonth(anchor)
  const weekDays = useMemo(() => buildDays(weekStart, 7, data), [weekStart, data])
  const monthDays = useMemo(() => buildDays(monthStart, daysInMonth(monthStart), data), [monthStart, data])
  const names = useMemo(() => weekdayNames(locale, weekStartsOn, "short"), [locale, weekStartsOn])
  const leading = (weekday(monthStart) - weekStartsOn + 7) % 7

  const move = (dir: 1 | -1) => setAnchor(view === "week" ? addDays(anchor, dir * 7) : addMonths(anchor, dir))
  const label =
    view === "week"
      ? fill(s.weekOf, { date: formatDate(weekStart, locale, { month: "short", day: "numeric", year: "numeric" }) })
      : formatDate(monthStart, locale, { month: "long", year: "numeric" })

  const dayHeading = (date: string) => formatDate(date, locale, { weekday: "long", month: "long", day: "numeric" })

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-2 sm:ps-3">
        <div role="group" aria-label={s.viewLabel} className="flex rounded-full bg-stone-100 p-1">
          {(["week", "month"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "h-9 flex-1 rounded-full px-5 font-tradition text-[0.92rem] transition-colors sm:flex-none",
                view === v ? "bg-white text-ink shadow-sm" : "text-ink-600 hover:text-ink",
              )}
            >
              {v === "week" ? s.weekly : s.monthly}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => move(-1)} aria-label={view === "week" ? s.previousWeek : s.previousMonth}>
            <ChevronLeft className="rtl:rotate-180" aria-hidden="true" />
          </Button>
          <p aria-live="polite" className="min-w-0 flex-1 text-center font-heading text-base text-ink sm:min-w-[13rem] sm:text-lg">
            {label}
          </p>
          <Button variant="ghost" size="icon-sm" onClick={() => move(1)} aria-label={view === "week" ? s.nextWeek : s.nextMonth}>
            <ChevronRight className="rtl:rotate-180" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAnchor(today)}>
            {s.goToToday}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-sm text-ink-600">
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded-sm bg-gold-wash ring-1 ring-gold" />{s.legendFeast}</span>
        <span className="inline-flex items-center gap-2"><span className="size-3 rounded-sm ring-2 ring-blue" />{s.legendToday}</span>
        {liveOn ? <span className="inline-flex items-center gap-2"><Radio className="size-3.5 text-blue" aria-hidden="true" />{s.legendStream}</span> : null}
        <span className="text-ink-500">{calendarNote}</span>
      </div>

      {view === "week" ? (
        <ol className="mt-6 grid gap-3 lg:grid-cols-7">
          {weekDays.map((day) => {
            const isToday = day.date === today
            const feast = dayHighlight(day, highlightRanks)
            return (
              <li
                key={day.date}
                className={cn(
                  "flex min-w-0 flex-col rounded-2xl border p-4 lg:min-h-[15rem] lg:p-3",
                  feast ? "border-gold-line bg-gold-wash" : "border-border bg-white",
                  isToday && "ring-2 ring-blue ring-offset-2",
                )}
              >
                <p className="flex items-baseline justify-between gap-2 lg:block">
                  <span className="font-heading text-lg text-ink lg:hidden">{dayHeading(day.date)}</span>
                  <span className="hidden lg:block">
                    <span className="block text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">{formatDate(day.date, locale, { weekday: "short" })}</span>
                    <span className="font-tradition text-3xl text-ink">{formatDate(day.date, locale, { day: "numeric" })}</span>
                  </span>
                  {isToday ? <span className="rounded-full bg-blue px-2 py-0.5 text-xs font-semibold text-white lg:mt-1 lg:inline-block">{s.today}</span> : null}
                </p>
                <div className="mt-2">
                  <FeastTag day={day} s={s} />
                </div>
                {day.services.length > 0 ? (
                  <ul className="mt-2 divide-y divide-border/70 lg:divide-y-0">
                    {day.services.map((svc) => (
                      <ServiceRow key={svc.key} svc={svc} locale={locale} liveOn={liveOn} s={s} compact={false} stackOnDesktop />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-ink-500">{s.noServices}</p>
                )}
              </li>
            )
          })}
        </ol>
      ) : (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-border lg:block">
            <div className="grid grid-cols-7 border-b border-border bg-stone-50">
              {names.map((n) => (
                <p key={n} className="px-3 py-2 text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">{n}</p>
              ))}
            </div>
            <ol className="grid grid-cols-7">
              {Array.from({ length: leading }, (_, i) => (
                <li key={`pad-${i}`} aria-hidden="true" className="min-h-[8.5rem] border-e border-b border-border bg-stone-50/60" />
              ))}
              {monthDays.map((day) => {
                const isToday = day.date === today
                const feast = dayHighlight(day, highlightRanks)
                return (
                  <li
                    key={day.date}
                    aria-label={dayHeading(day.date)}
                    className={cn("relative min-h-[8.5rem] min-w-0 border-e border-b border-border p-2", feast ? "bg-gold-wash" : "bg-white", isToday && "z-10 outline-2 -outline-offset-2 outline-blue")}
                  >
                    <p className={cn("font-tradition text-lg", isToday ? "text-blue" : "text-ink")}>{formatDate(day.date, locale, { day: "numeric" })}</p>
                    {day.feasts.map((f) => (
                      <p key={f.id} className={cn("mt-0.5 text-[0.75rem] leading-tight", f.rank === "great" ? "font-semibold text-blue-deep" : "text-ink-700")}>
                        {f.title}
                      </p>
                    ))}
                    <ul className="mt-1">
                      {day.services.map((svc) => (
                        <ServiceRow key={svc.key} svc={svc} locale={locale} liveOn={false} s={s} compact />
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ol>
          </div>
          <ol className="mt-6 space-y-3 lg:hidden">
            {monthDays
              .filter((d) => d.services.length > 0 || d.feasts.length > 0)
              .map((day) => {
                const isToday = day.date === today
                const feast = dayHighlight(day, highlightRanks)
                return (
                  <li key={day.date} className={cn("rounded-2xl border p-4", feast ? "border-gold-line bg-gold-wash" : "border-border bg-white", isToday && "ring-2 ring-blue ring-offset-2")}>
                    <p className="flex items-baseline justify-between gap-2">
                      <span className="font-heading text-lg text-ink">{dayHeading(day.date)}</span>
                      {isToday ? <span className="rounded-full bg-blue px-2 py-0.5 text-xs font-semibold text-white">{s.today}</span> : null}
                    </p>
                    <div className="mt-1.5">
                      <FeastTag day={day} s={s} />
                    </div>
                    <ul className="mt-1.5 divide-y divide-border/70">
                      {day.services.map((svc) => (
                        <ServiceRow key={svc.key} svc={svc} locale={locale} liveOn={liveOn} s={s} />
                      ))}
                    </ul>
                  </li>
                )
              })}
          </ol>
        </>
      )}
      <p className="mt-6 text-sm text-ink-500">{note}</p>
    </div>
  )
}
