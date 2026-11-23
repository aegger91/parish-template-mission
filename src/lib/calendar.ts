/*
  Church calendar and service schedule engine. Pure functions on ISO dates
  ("YYYY-MM-DD"), safe to run at build time and in the browser.

  calendar.style (builder setting, not visitor-facing):
    new  Revised Julian — fixed feasts on civil dates, Orthodox Pascha
    old  Julian — fixed feasts on the Julian calendar (shown as civil + O.S.), Orthodox Pascha
  Legacy values julian / revised-julian / gregorian are still accepted and normalized.
*/

export type CalendarStyle = "new" | "old"

/** Accept legacy schema values from older content files. */
export type CalendarStyleInput = CalendarStyle | "julian" | "revised-julian" | "gregorian"

export function normalizeCalendarStyle(style: CalendarStyleInput | string | undefined | null): CalendarStyle {
  if (style === "old" || style === "julian") return "old"
  return "new"
}

export interface FeastDef {
  id: string
  rank: string
  title: string
  month?: number
  day?: number
  offset?: number
}

export interface Feast {
  id: string
  rank: string
  title: string
  date: string
  /** Julian month/day when style is old and the feast is fixed (for O.S. labels). */
  oldStyleMonth?: number
  oldStyleDay?: number
}

const pad = (n: number) => String(n).padStart(2, "0")

export function isoDate(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`
}

export function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number)
  return { y, m, d }
}

function toUtc(iso: string): Date {
  const { y, m, d } = parseIso(iso)
  return new Date(Date.UTC(y, m - 1, d))
}

function fromUtc(date: Date): string {
  return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

export function addDays(iso: string, days: number): string {
  const date = toUtc(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return fromUtc(date)
}

export function weekday(iso: string): number {
  return toUtc(iso).getUTCDay()
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b).getTime() - toUtc(a).getTime()) / 86400000)
}

export function localToday(now = new Date()): string {
  return isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function startOfWeek(iso: string, weekStartsOn = 0): string {
  const diff = (weekday(iso) - weekStartsOn + 7) % 7
  return addDays(iso, -diff)
}

export function startOfMonth(iso: string): string {
  const { y, m } = parseIso(iso)
  return isoDate(y, m, 1)
}

export function addMonths(iso: string, months: number): string {
  const { y, m } = parseIso(iso)
  const total = y * 12 + (m - 1) + months
  return isoDate(Math.floor(total / 12), (total % 12) + 1, 1)
}

export function daysInMonth(iso: string): number {
  const { y, m } = parseIso(iso)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

function julianToJdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12)
  const yy = y + 4800 - a
  const mm = m + 12 * a - 3
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - 32083
}

function jdnToGregorian(jdn: number): string {
  const a = jdn + 32044
  const b = Math.floor((4 * a + 3) / 146097)
  const c = a - Math.floor((146097 * b) / 4)
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor((1461 * d) / 4)
  const m = Math.floor((5 * e + 2) / 153)
  const day = e - Math.floor((153 * m + 2) / 5) + 1
  const month = m + 3 - 12 * Math.floor(m / 10)
  const year = 100 * b + d - 4800 + Math.floor(m / 10)
  return isoDate(year, month, day)
}

/** Civil (Gregorian) date of a Julian calendar date. */
export function julianToCivil(y: number, m: number, d: number): string {
  return jdnToGregorian(julianToJdn(y, m, d))
}

/** Orthodox Pascha as a civil date (Meeus Julian algorithm). */
export function orthodoxPascha(year: number): string {
  const a = year % 4
  const b = year % 7
  const c = year % 19
  const d = (19 * c + 15) % 30
  const e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31)
  const day = ((d + e + 114) % 31) + 1
  return julianToCivil(year, month, day)
}

/** Gregorian Pascha (anonymous Gregorian algorithm). */
export function gregorianPascha(year: number): string {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return isoDate(year, month, day)
}

export function paschaFor(year: number, _style: CalendarStyle): string {
  // New and Old Calendar share Orthodox Pascha (Julian algorithm → civil date).
  return orthodoxPascha(year)
}

export function feastsForYear(year: number, style: CalendarStyle, defs: FeastDef[]): Feast[] {
  const pascha = paschaFor(year, style)
  return defs.map((def) => {
    if (typeof def.offset === "number") {
      return { id: def.id, rank: def.rank, title: def.title, date: addDays(pascha, def.offset) }
    }
    if (style === "old") {
      return {
        id: def.id,
        rank: def.rank,
        title: def.title,
        date: julianToCivil(year, def.month!, def.day!),
        oldStyleMonth: def.month,
        oldStyleDay: def.day,
      }
    }
    return { id: def.id, rank: def.rank, title: def.title, date: isoDate(year, def.month!, def.day!) }
  })
}

export function feastsBetween(start: string, end: string, style: CalendarStyle, defs: FeastDef[]): Feast[] {
  const y0 = parseIso(start).y - 1
  const y1 = parseIso(end).y
  const out: Feast[] = []
  for (let y = y0; y <= y1; y++) {
    for (const f of feastsForYear(y, style, defs)) if (f.date >= start && f.date <= end) out.push(f)
  }
  return out.sort((a, b) => a.date.localeCompare(b.date))
}

/** Civil date label, with Old Style parenthetical when applicable. */
export function formatFeastDateLabel(
  feast: Feast,
  locale: string,
  oldStyleAbbr: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  const civil = formatDate(feast.date, locale, options)
  if (feast.oldStyleMonth == null || feast.oldStyleDay == null) return civil
  const os = formatDate(isoDate(2000, feast.oldStyleMonth, feast.oldStyleDay), locale, { month: "short", day: "numeric" })
  return `${civil} (${os} ${oldStyleAbbr})`
}

export interface ServiceDef {
  id?: string
  time: string
  type: string
  title: string
  note?: string
  livestream?: boolean
  showInHero?: boolean
}

export interface RecurringService extends ServiceDef {
  id: string
  weekday: number
}

export interface FeastRule extends ServiceDef {
  replacesTypes: string[]
}

export interface ScheduleData {
  recurring: RecurringService[]
  feastRules: { applyToRanks: string[]; eve: FeastRule; day: FeastRule }
  overrides: { feastId: string; eve?: ServiceDef[]; day?: ServiceDef[] }[]
  special: (ServiceDef & { id: string; date: string })[]
  feasts: FeastDef[]
  style: CalendarStyle
}

export interface DayService extends ServiceDef {
  key: string
  feastTitle?: string
  isFeast?: boolean
}

export interface DaySchedule {
  date: string
  feasts: Feast[]
  services: DayService[]
}

export function buildDays(start: string, count: number, data: ScheduleData): DaySchedule[] {
  const end = addDays(start, count)
  const feasts = feastsBetween(start, end, data.style, data.feasts)
  const byDate = new Map<string, Feast[]>()
  for (const f of feasts) byDate.set(f.date, [...(byDate.get(f.date) ?? []), f])

  const days: DaySchedule[] = []
  for (let i = 0; i < count; i++) {
    const date = addDays(start, i)
    const today = byDate.get(date) ?? []
    const tomorrow = byDate.get(addDays(date, 1)) ?? []
    let services: DayService[] = data.recurring
      .filter((r) => r.weekday === weekday(date))
      .map((r) => ({ ...r, key: `${date}-${r.id}` }))

    for (const feast of today) {
      const override = data.overrides.find((o) => o.feastId === feast.id)
      if (override?.day) {
        services = override.day.map((s, n) => ({ ...s, key: `${date}-${feast.id}-day-${n}`, feastTitle: feast.title, isFeast: true }))
      } else if (data.feastRules.applyToRanks.includes(feast.rank)) {
        const rule = data.feastRules.day
        services = services.filter((s) => !rule.replacesTypes.includes(s.type))
        services.push({ ...rule, key: `${date}-${feast.id}-day`, feastTitle: feast.title, isFeast: true })
      }
    }

    for (const feast of tomorrow) {
      const override = data.overrides.find((o) => o.feastId === feast.id)
      if (override?.eve) {
        services = override.eve.map((s, n) => ({ ...s, key: `${date}-${feast.id}-eve-${n}`, feastTitle: feast.title, isFeast: true }))
      } else if (data.feastRules.applyToRanks.includes(feast.rank)) {
        const rule = data.feastRules.eve
        services = services.filter((s) => !rule.replacesTypes.includes(s.type))
        services.push({ ...rule, key: `${date}-${feast.id}-eve`, feastTitle: feast.title, isFeast: true })
      }
    }

    for (const s of data.special.filter((sp) => sp.date === date)) services.push({ ...s, key: `${date}-${s.id}` })

    services.sort((a, b) => a.time.localeCompare(b.time))
    days.push({ date, feasts: today, services })
  }
  return days
}

export function nextFeast(from: string, data: Pick<ScheduleData, "style" | "feasts">, withinDays = 120, ranks?: string[]): Feast | undefined {
  return feastsBetween(from, addDays(from, withinDays), data.style, data.feasts).find((f) => !ranks || ranks.includes(f.rank))
}

export function formatTime(time: string, locale: string): string {
  const [h, m] = time.split(":").map(Number)
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(Date.UTC(2000, 0, 1, h, m)))
}

export function formatDate(iso: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(toUtc(iso))
}

export function weekdayNames(locale: string, weekStartsOn: number, style: "short" | "long" | "narrow" = "short"): string[] {
  const base = Date.UTC(2023, 0, 1)
  return Array.from({ length: 7 }, (_, i) => {
    const day = (weekStartsOn + i) % 7
    return new Intl.DateTimeFormat(locale, { weekday: style, timeZone: "UTC" }).format(new Date(base + day * 86400000))
  })
}
