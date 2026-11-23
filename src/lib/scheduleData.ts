import scheduleJson from "@content/schedule.json"
import feastsJson from "@content/feasts.json"
import { site, tr } from "./site"
import type { CalendarStyle, ScheduleData } from "./calendar"

/** Schedule and feasts with every title resolved for one language, ready for client islands. */
export function scheduleData(lang: string): ScheduleData {
  const s = scheduleJson as any
  const f = feastsJson as any
  const svc = (x: any) => ({ ...x, title: tr(x.title, lang), note: x.note ? tr(x.note, lang) : undefined })
  return {
    style: (site.calendar?.style ?? "revised-julian") as CalendarStyle,
    recurring: s.recurring.map(svc),
    feastRules: {
      applyToRanks: s.feastRules.applyToRanks,
      eve: svc(s.feastRules.eve),
      day: svc(s.feastRules.day),
    },
    overrides: s.overrides.map((o: any) => ({
      feastId: o.feastId,
      eve: o.eve?.map(svc),
      day: o.day?.map(svc),
    })),
    special: s.special.map(svc),
    feasts: [...f.fixed, ...f.moveable].map((x: any) => ({ ...x, title: tr(x.title, lang) })),
  }
}

export function buildDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}
