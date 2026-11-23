/** Client-side calendar helpers: .ics download and Google Calendar deep link. */

export interface CalendarEventInput {
  title: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  durationMinutes?: number
  location?: string
  description?: string
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function toUtcStamp(date: string, time: string): string {
  const [y, m, d] = date.split("-").map(Number)
  const [h, min] = time.split(":").map(Number)
  return `${y}${pad(m)}${pad(d)}T${pad(h)}${pad(min)}00`
}

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const [y, m, d] = date.split("-").map(Number)
  const [h, min] = time.split(":").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d, h, min + minutes))
  return {
    date: `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`,
    time: `${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}`,
  }
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;")
}

export function buildIcs(event: CalendarEventInput): string {
  const duration = event.durationMinutes ?? 90
  const end = addMinutes(event.date, event.time, duration)
  const uid = `${event.date}-${event.time.replace(":", "")}-${encodeURIComponent(event.title).slice(0, 40)}@parish`
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Parish Template Mission//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toUtcStamp(event.date, event.time)}Z`,
    `DTSTART:${toUtcStamp(event.date, event.time)}`,
    `DTEND:${toUtcStamp(end.date, end.time)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
  ]
  if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`)
  if (event.description) lines.push(`DESCRIPTION:${escapeIcs(event.description)}`)
  lines.push("END:VEVENT", "END:VCALENDAR")
  return lines.join("\r\n")
}

export function downloadIcs(event: CalendarEventInput, filename = "service.ics") {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function googleCalendarUrl(event: CalendarEventInput): string {
  const duration = event.durationMinutes ?? 90
  const end = addMinutes(event.date, event.time, duration)
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toUtcStamp(event.date, event.time)}/${toUtcStamp(end.date, end.time)}`,
  })
  if (event.location) params.set("location", event.location)
  if (event.description) params.set("details", event.description)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
