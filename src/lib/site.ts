import siteJson from "@content/site.json"
import pagesJson from "@content/pages.json"
import uiJson from "@content/ui.json"
import newsJson from "@content/news.json"
import productsJson from "@content/products.json"
import { interpolate, resolveLocalized, type LanguageInfo, type Localized } from "./i18n"

export type { Localized, LanguageInfo }

export const site = siteJson as any
export const languages = site.languages as LanguageInfo[]
export const defaultLang: string = site.defaultLanguage ?? languages[0].code

const uiStrings = (uiJson as any).strings as Record<string, Localized>

export function tr(value: Localized | null | undefined, lang: string): string {
  return resolveLocalized(value, lang, defaultLang)
}

export function t(key: string, lang: string, vars?: Record<string, string | number>): string {
  const entry = uiStrings[key]
  if (entry == null) return key
  return interpolate(tr(entry, lang), vars)
}

/** Resolve a set of ui keys for passing into client islands. */
export function strings<K extends string>(lang: string, keys: readonly K[]): Record<K, string> {
  const out = {} as Record<K, string>
  for (const key of keys) out[key] = tr(uiStrings[key], lang)
  return out
}

export function langInfo(code: string): LanguageInfo {
  return languages.find((l) => l.code === code) ?? languages[0]
}

export function isFeatureOn(name?: string | null): boolean {
  if (!name) return true
  const feature = site.features?.[name]
  return feature ? feature.enabled !== false : true
}

export interface SectionNode {
  id: string
  type: string
  enabled?: boolean
  feature?: string
  [key: string]: any
}

export interface PageNode {
  id: string
  slug: string
  title: Localized
  navLabel?: Localized
  navOverviewLabel?: Localized
  intro?: Localized
  description?: Localized
  icon?: string
  showInNav?: boolean
  navDesktop?: boolean
  navPriority?: "primary" | "secondary"
  navPlacement?: "link" | "button"
  showPageHeader?: boolean
  feature?: string
  collection?: "news" | "products"
  enabled?: boolean
  sections: SectionNode[]
  children?: PageNode[]
}

export interface FlatPage {
  node: PageNode
  path: string
  parentIds: string[]
  depth: number
}

export const pageTree = (pagesJson as any).pages as PageNode[]

export function isPageEnabled(node: PageNode): boolean {
  return node.enabled !== false && isFeatureOn(node.feature)
}

function flatten(nodes: PageNode[], parentPath: string[], parentIds: string[], out: FlatPage[]) {
  for (const node of nodes) {
    if (!isPageEnabled(node)) continue
    const segments = node.slug ? [...parentPath, node.slug] : parentPath
    out.push({ node, path: segments.join("/"), parentIds, depth: parentIds.length })
    if (node.children) flatten(node.children, segments, [...parentIds, node.id], out)
  }
  return out
}

export const flatPages: FlatPage[] = flatten(pageTree, [], [], [])

export function pageById(id: string): FlatPage | undefined {
  return flatPages.find((p) => p.node.id === id)
}

export function enabledSections(node: PageNode): SectionNode[] {
  return node.sections.filter((s) => s.enabled !== false && isFeatureOn(s.feature))
}

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/?$/, "/")

export function langPrefix(lang: string): string {
  return lang === defaultLang ? "" : lang
}

export function href(lang: string, path: string, anchor?: string): string {
  const parts = [langPrefix(lang), path].filter(Boolean).join("/")
  const url = parts ? `${BASE}${parts}/` : BASE
  return anchor ? `${url}#${anchor.replace(/^#/, "")}` : url
}

export function pageHref(id: string, lang: string, anchor?: string): string {
  const page = pageById(id)
  if (!page) return href(lang, "", anchor)
  return href(lang, page.path, anchor)
}

export function specialPageHref(key: string, lang: string, anchor?: string): string | null {
  const id = site.pages?.[key]
  if (!id || !pageById(id)) return null
  return pageHref(id, lang, anchor)
}

export interface LinkConfig {
  label?: Localized
  href?: string
  pageId?: string
  anchor?: string
  feature?: string
}

export function resolveLink(link: LinkConfig | undefined, lang: string): { label: string; href: string; external: boolean } | null {
  if (!link || !isFeatureOn(link.feature)) return null
  const label = tr(link.label, lang)
  if (link.pageId) {
    if (!pageById(link.pageId)) return null
    return { label, href: pageHref(link.pageId, lang, link.anchor), external: false }
  }
  const raw = link.href ?? "#"
  return { label, href: raw, external: /^https?:/.test(raw) }
}

export function navLabel(node: PageNode, lang: string): string {
  return tr(node.navLabel ?? node.title, lang)
}

export interface NavItem {
  id: string
  label: string
  href: string
  current: boolean
  desktop: boolean
  priority: "primary" | "secondary"
  placement: "link" | "button"
  overviewLabel?: string
  children: NavItem[]
}

export function buildNav(lang: string, currentPath: string): NavItem[] {
  const build = (nodes: PageNode[], parentPath: string[]): NavItem[] =>
    nodes
      .filter((n) => isPageEnabled(n) && n.showInNav !== false)
      .map((n) => {
        const segments = n.slug ? [...parentPath, n.slug] : parentPath
        const path = segments.join("/")
        return {
          id: n.id,
          label: navLabel(n, lang),
          href: href(lang, path),
          current: path === "" ? currentPath === "" : currentPath === path || currentPath.startsWith(`${path}/`),
          desktop: n.navDesktop !== false,
          priority: n.navPriority ?? "primary",
          placement: n.navPlacement ?? "link",
          overviewLabel: n.navOverviewLabel ? tr(n.navOverviewLabel, lang) : undefined,
          children: n.children ? build(n.children, segments) : [],
        }
      })
  return build(pageTree, [])
}

export const newsData = newsJson as any
export const productsData = productsJson as any

export interface Route {
  lang: string
  path: string
  page: FlatPage
  item?: { kind: "news" | "products"; id: string; slug: string }
}

export function allRoutes(): Route[] {
  const routes: Route[] = []
  for (const lang of languages) {
    for (const page of flatPages) {
      routes.push({ lang: lang.code, path: page.path, page })
      if (page.node.collection === "news") {
        for (const post of newsData.posts) {
          routes.push({ lang: lang.code, path: `${page.path}/${post.slug}`, page, item: { kind: "news", id: post.id, slug: post.slug } })
        }
      }
      if (page.node.collection === "products") {
        for (const product of productsData.products) {
          routes.push({ lang: lang.code, path: `${page.path}/${product.slug}`, page, item: { kind: "products", id: product.id, slug: product.slug } })
        }
      }
    }
  }
  return routes
}

export function alternatesFor(path: string): { lang: string; href: string; info: LanguageInfo }[] {
  return languages.map((l) => ({ lang: l.code, href: href(l.code, path), info: l }))
}

export function connectLink(kind: string, itemId?: string): string {
  const oc = site.orthodoxConnect ?? {}
  const template: string = oc.deepLinks?.[kind] ?? "{appUrl}"
  return template
    .replace("{appUrl}", oc.appUrl ?? "")
    .replace("{parishId}", encodeURIComponent(oc.parishId ?? ""))
    .replace("{itemId}", encodeURIComponent(itemId ?? ""))
}

export function formatAddressLines(lang: string): string[] {
  const a = site.contact.address
  return [a.street, `${a.city}, ${a.region} ${a.postalCode}`, tr(a.country, lang)].filter(Boolean)
}
