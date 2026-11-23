import { useEffect, useMemo, useState } from "react"
import { ArrowRight, MapPin, Radio } from "lucide-react"
import { Pictogram } from "@/components/brand/Pictogram"
import { buttonVariants } from "@/components/ui/button"
import { addDays, buildDays, daysBetween, formatDate, formatTime, localToday, nextFeast, type ScheduleData } from "@/lib/calendar"
import { fill } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
  data: ScheduleData
  initialToday: string
  locale: string
  highlightRanks: string[]
  s: Record<string, string>
  scheduleHref: string
  directionsUrl: string
  addressLines: string[]
  live: { href: string } | null
  calendarConnected: boolean
}

export function useToday(initial: string) {
  const [today, setToday] = useState(initial)
  useEffect(() => setToday(localToday()), [])
  return today
}

export default function ThisWeekCard({ data, initialToday, locale, highlightRanks, s, scheduleHref, directionsUrl, addressLines, live, calendarConnected }: Props) {
  const today = useToday(initialToday)

  const upcoming = useMemo(() => {
    const days = buildDays(today, 7, data)
    const rows = days.flatMap((d) => d.services.filter((sv) => sv.showInHero !== false).map((sv) => ({ ...sv, date: d.date })))
    return rows.slice(0, 6)
  }, [today, data])

  const feastToday = useMemo(() => buildDays(today, 1, data)[0].feasts[0], [today, data])
  const coming = useMemo(() => (feastToday ? undefined : nextFeast(addDays(today, 1), data, 120, highlightRanks)), [today, data, feastToday, highlightRanks])

  const dayLabel = (date: string) => {
    const diff = daysBetween(today, date)
    if (diff === 0) return s.today
    if (diff === 1) return s.tomorrow
    return formatDate(date, locale, { weekday: "long" })
  }

  let lastDate = ""

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[var(--mission-shadow-lift)]">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <h2 className="font-heading text-xl text-ink">{s.thisWeeksServices}</h2>
        {live ? (
          <a href={live.href} className="inline-flex items-center gap-2 rounded-full bg-blue px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase hover:bg-blue-deep">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            {s.liveNow}
          </a>
        ) : null}
      </div>

      <ol className="mt-3 px-5 sm:px-6">
        {upcoming.map((row) => {
          const showDay = row.date !== lastDate
          lastDate = row.date
          return (
            <li key={row.key} className={cn(showDay && "border-t border-border/80 first:border-t-0")}>
              {showDay ? (
                <p className="pt-3 text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">
                  {dayLabel(row.date)}
                  <span className="ms-2 font-normal tracking-normal normal-case">{formatDate(row.date, locale, { month: "short", day: "numeric" })}</span>
                </p>
              ) : null}
              <div className="flex items-baseline gap-3 py-1.5">
                <span className="w-[4.6rem] shrink-0 font-tradition text-[0.95rem] text-blue-deep tabular-nums">{formatTime(row.time, locale)}</span>
                <span className="min-w-0 flex-1">
                  <span className="text-[0.97rem] text-ink">{row.title}</span>
                  {row.feastTitle ? <span className="mt-0.5 block text-sm text-gold">{row.feastTitle}</span> : null}
                </span>
                {row.livestream && live ? <Radio aria-label={s.streamed} className="size-4 shrink-0 text-blue" /> : null}
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mx-5 mt-3 flex items-start gap-3 rounded-2xl border border-gold-line bg-gold-wash px-4 py-3 sm:mx-6">
        <Pictogram name="bells" size={26} className="mt-0.5 shrink-0 text-gold" />
        <div className="min-w-0 text-sm">
          {feastToday ? (
            <>
              <p className="eyebrow !text-[0.68rem]">{s.feastToday}</p>
              <p className="mt-1 font-heading text-base text-ink">{feastToday.title}</p>
            </>
          ) : coming ? (
            <>
              <p className="eyebrow !text-[0.68rem]">{s.nextFeast}</p>
              <p className="mt-1 font-heading text-base text-ink">{coming.title}</p>
              <p className="text-ink-600">
                {formatDate(coming.date, locale, { weekday: "long", month: "long", day: "numeric" })},{" "}
                {daysBetween(today, coming.date) === 1 ? s.inOneDay : fill(s.inDays, { n: daysBetween(today, coming.date) })}
              </p>
            </>
          ) : null}
          {!calendarConnected ? <p className="mt-1.5 text-xs text-ink-500">{s.dailyCalendarNote}</p> : null}
        </div>
      </div>

      <div className="mt-5 border-t border-border bg-stone-50 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gold" />
          <address className="min-w-0 text-sm not-italic text-ink-700">
            {addressLines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a href={directionsUrl} target="_blank" rel="noopener" className={cn(buttonVariants({ size: "sm" }), "flex-1")}>
            {s.getDirections}
          </a>
          <a href={scheduleHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}>
            {s.fullSchedule}
            <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
          </a>
        </div>
      </div>
    </div>
  )
}
