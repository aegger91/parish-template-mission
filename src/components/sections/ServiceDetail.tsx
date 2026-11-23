"use client"

import { CalendarPlus, ExternalLink, MapPin, Radio } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/calendar"
import { downloadIcs, googleCalendarUrl } from "@/lib/calendarLinks"
import { cn } from "@/lib/utils"

export interface ServiceDetailItem {
  id: string
  title: string
  date: string
  time: string
  place: string
  note?: string
  dateLabel?: string
  livestreamHref?: string | null
}

interface Props {
  item: ServiceDetailItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: string
  directionsUrl: string
  s: Record<string, string>
}

export default function ServiceDetail({ item, open, onOpenChange, locale, directionsUrl, s }: Props) {
  if (!item) return null
  const dateLabel =
    item.dateLabel ?? formatDate(item.date, locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  const cal = {
    title: item.title,
    date: item.date,
    time: item.time,
    location: item.place,
    description: item.note ?? "",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-[1.5rem] p-0 sm:max-w-md" showCloseButton>
        <DialogHeader className="space-y-1 border-b border-border px-5 py-4 text-start">
          <DialogTitle className="font-heading text-2xl text-ink">{item.title}</DialogTitle>
          <DialogDescription className="text-ink-600">{dateLabel}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-5 py-4 text-ink-700">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">{s.time}</dt>
              <dd className="mt-1 font-tradition text-lg text-blue-deep tabular-nums">{formatTime(item.time, locale)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">{s.location}</dt>
              <dd className="mt-1">{item.place}</dd>
            </div>
            {item.note ? (
              <div>
                <dt className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">{s.notes}</dt>
                <dd className="mt-1 leading-relaxed">{item.note}</dd>
              </div>
            ) : null}
          </dl>
          <div className="flex flex-col gap-2 pt-1">
            <Button
              type="button"
              onClick={() => downloadIcs(cal, `${item.title.replace(/\s+/g, "-").toLowerCase()}.ics`)}
              className="justify-start"
            >
              <CalendarPlus aria-hidden="true" />
              {s.addToCalendar}
            </Button>
            <a
              href={googleCalendarUrl(cal)}
              target="_blank"
              rel="noopener"
              className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
            >
              <ExternalLink aria-hidden="true" />
              {s.googleCalendar}
            </a>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener"
              className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
            >
              <MapPin aria-hidden="true" />
              {s.getDirections}
            </a>
            {item.livestreamHref ? (
              <a href={item.livestreamHref} className={cn(buttonVariants({ variant: "secondary" }), "justify-start")}>
                <Radio aria-hidden="true" />
                {s.watchLive}
              </a>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
