export type Localized = string | Record<string, string | undefined>

export interface LanguageInfo {
  code: string
  label: string
  nativeName: string
  shortLabel?: string
  locale: string
  dir: "ltr" | "rtl"
}

/**
 * Resolve a translatable field. Fallback order: exact code, base code
 * ("es-MX" to "es"), the site default language, then any available value.
 */
export function resolveLocalized(value: Localized | null | undefined, lang: string, defaultLang: string): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  const base = lang.split("-")[0]
  return value[lang] ?? value[base] ?? value[defaultLang] ?? Object.values(value).find((v) => !!v) ?? ""
}

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
}
