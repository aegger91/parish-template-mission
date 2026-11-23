export function formatMoney(amount: number, locale: string, currency: string): string {
  const whole = Number.isInteger(amount)
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Formats any input as (000)-000-0000 while typing. */
export function maskPhone(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 10)
  if (digits.length === 0) return ""
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)})-${digits.slice(3)}`
  return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function isCompletePhone(value: string): boolean {
  return value.replace(/\D/g, "").length === 10
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

export function pick(value: Record<string, string> | string | undefined, lang: string, fallback: string): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  return value[lang] ?? value[fallback] ?? Object.values(value)[0] ?? ""
}
