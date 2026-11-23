// Checks every file in content/ against its JSON Schema, then checks the links
// between files (page ids, categories, speakers) and a few copy rules.
// Run with: npm run validate
import { readFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import Ajv from "ajv"
import addFormats from "ajv-formats"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"))
const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
for (const f of readdirSync(join(root, "schemas"))) ajv.addSchema(read(`schemas/${f}`), f)

const errors = []
const fail = (file, msg) => errors.push(`${file}: ${msg}`)
const content = {}

for (const f of readdirSync(join(root, "content")).filter((f) => f.endsWith(".json"))) {
  const data = read(`content/${f}`)
  const name = f.replace(/\.json$/, "")
  content[name] = data
  const validate = ajv.getSchema(`${name}.schema.json`)
  if (!validate) {
    fail(f, "no matching schema in schemas/")
    continue
  }
  if (!validate(data)) for (const e of validate.errors) fail(f, `${e.instancePath || "/"} ${e.message}`)
}

const { site, pages, ui } = content
const langs = site.languages.map((l) => l.code)
if (!langs.includes(site.defaultLanguage)) fail("site.json", `defaultLanguage "${site.defaultLanguage}" is not in languages`)

const unique = (file, list, label = "id") => {
  const seen = new Set()
  for (const x of list) {
    if (seen.has(x[label])) fail(file, `duplicate ${label} "${x[label]}"`)
    seen.add(x[label])
  }
  return seen
}

const pageIds = new Set()
const sectionIds = new Set()
const links = []
const walk = (nodes) => {
  for (const p of nodes) {
    if (pageIds.has(p.id)) fail("pages.json", `duplicate page id "${p.id}"`)
    pageIds.add(p.id)
    for (const s of p.sections) {
      if (sectionIds.has(s.id)) fail("pages.json", `duplicate section id "${s.id}"`)
      sectionIds.add(s.id)
      for (const k of ["cta", "primaryCta", "secondaryCta", "shortcut"]) if (s[k]) links.push([`${p.id}/${s.id}.${k}`, s[k]])
      for (const i of s.newcomer?.items ?? []) if (i.link) links.push([`${p.id}/${s.id}.newcomer.${i.id}`, i.link])
    }
    if (p.children) walk(p.children)
  }
}
walk(pages.pages)
for (const [where, link] of links) {
  if (link.pageId && !pageIds.has(link.pageId)) fail("pages.json", `${where} links to unknown page "${link.pageId}"`)
  if (!link.pageId && !link.href) fail("pages.json", `${where} needs pageId or href`)
}
for (const [role, id] of Object.entries(site.pages ?? {})) if (!pageIds.has(id)) fail("site.json", `pages.${role} points to unknown page "${id}"`)

const checkCategories = (file, cats, items, key = "category") => {
  const ids = unique(file, cats)
  for (const x of items) if (!ids.has(x[key])) fail(file, `"${x.id}" uses unknown category "${x[key]}"`)
}
checkCategories("news.json", content.news.categories, content.news.posts)
unique("news.json", content.news.posts, "slug")
checkCategories("gallery.json", content.gallery.categories, content.gallery.items)
checkCategories("products.json", content.products.categories, content.products.products)
unique("products.json", content.products.products, "slug")
checkCategories("events.json", content.events.categories, content.events.events)
checkCategories("needs.json", content.needs.categories, content.needs.needs)
for (const p of content.products.products) unique("products.json", p.variants)

const clergyIds = unique("clergy.json", content.clergy.people)
for (const s of content.sermons.sermons) if (!clergyIds.has(s.speakerId)) fail("sermons.json", `"${s.id}" speaker "${s.speakerId}" is not in clergy.json`)

for (const e of content.events.events) if (e.signups > e.capacity) fail("events.json", `"${e.id}" has more signups than capacity`)
for (const n of content.needs.needs) for (const s of n.slots) if (s.signups > s.capacity) fail("needs.json", `"${s.id}" has more signups than capacity`)

const recipients = Object.keys(content.requests.recipients)
for (const s of content.requests.services) {
  for (const r of s.recipients ?? []) if (!recipients.includes(r)) fail("requests.json", `"${s.id}" uses unknown recipient "${r}"`)
  if (s.action.type === "page" && !pageIds.has(s.action.pageId)) fail("requests.json", `"${s.id}" links to unknown page "${s.action.pageId}"`)
}

const feastIds = new Set([...content.feasts.fixed, ...content.feasts.moveable].map((f) => f.id))
for (const o of content.schedule.overrides ?? []) if (!feastIds.has(o.feastId)) fail("schedule.json", `override for unknown feast "${o.feastId}"`)

for (const [key, value] of Object.entries(ui.strings)) {
  if (typeof value === "object" && !value[site.defaultLanguage]) fail("ui.json", `"${key}" has no ${site.defaultLanguage} text`)
}

// Copy rules: no em or en dashes, no cross glyphs (the site draws its own cross).
for (const [name, data] of Object.entries(content)) {
  const text = JSON.stringify(data)
  if (/[\u2013\u2014]/.test(text)) fail(`${name}.json`, "contains an em or en dash; use a comma, colon or period")
  if (/[\u2626\u271D\u271E\u2020]/.test(text)) fail(`${name}.json`, "contains a cross character; the site draws the cross itself")
}

if (errors.length) {
  console.error(`Content check failed (${errors.length}):\n  ` + errors.join("\n  "))
  process.exit(1)
}
console.log(`Content OK: ${Object.keys(content).length} files, ${pageIds.size} pages, ${langs.length} languages.`)
