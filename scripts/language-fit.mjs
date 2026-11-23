// Loads every built page in every language at 360 / 768 / 1280 and flags text
// that overflows its box (scrollWidth/Height) or overlaps siblings.
// Build first, then: npm run language-fit
import { readdirSync, statSync, readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"
import { chromium } from "playwright-core"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dist = join(root, "dist")
const port = Number(process.env.QA_PORT ?? 4640)
const widths = (process.env.FIT_WIDTHS ?? "360,768,1280").split(",").map(Number)
const site = JSON.parse(readFileSync(join(root, "content/site.json"), "utf8"))
const langs = (site.languages ?? []).map((l) => l.code)

function routes(dir, prefix = "/") {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      if (name.startsWith("_") || name === "brand") continue
      out.push(...routes(full, `${prefix}${name}/`))
    } else if (name === "index.html") out.push(prefix)
  }
  return out
}

function langOf(path) {
  const parts = path.split("/").filter(Boolean)
  if (parts.length === 0) return site.defaultLanguage ?? "en"
  return langs.includes(parts[0]) ? parts[0] : site.defaultLanguage ?? "en"
}

const server = spawn(join(root, "node_modules/.bin/astro"), ["preview", "--force", "--port", String(port), "--host", "127.0.0.1"], {
  cwd: root,
  stdio: "ignore",
})
const base = `http://127.0.0.1:${port}`
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(base)).ok) break
  } catch {}
  await new Promise((r) => setTimeout(r, 250))
}

const list = routes(dist).filter((p) => p !== "/404.html")
const byLang = Object.fromEntries(langs.map((l) => [l, []]))
for (const path of list) byLang[langOf(path)]?.push(path)

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/local/bin/google-chrome" })
const problems = []
const counts = { pages: 0, overflowX: 0, overflowY: 0, overlap: 0 }
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await context.newPage()
    for (const lang of langs) {
      for (const path of byLang[lang] ?? []) {
        counts.pages++
        await page.goto(base + path, { waitUntil: "networkidle" })
        await page.waitForTimeout(120)
        const found = await page.evaluate(() => {
          const skip = (el) => {
            const st = getComputedStyle(el)
            if (st.visibility === "hidden" || st.display === "none" || st.opacity === "0") return true
            if (el.closest("[aria-hidden='true'],.sr-only,[inert],script,style,svg,path,noscript")) return true
            // Decorative pulse / absolute children are not text fit issues
            if (el.classList.contains("animate-ping") || el.classList.contains("animate-pulse")) return true
            if ([...el.children].every((c) => c.getAttribute("aria-hidden") === "true" || getComputedStyle(c).position === "absolute") && !(el.textContent || "").trim()) return true
            return false
          }
          const textish = (el) => {
            const tag = el.tagName.toLowerCase()
            const text = (el.textContent || "").trim()
            if (!text && !["input", "textarea", "select", "button", "a"].includes(tag)) return false
            if (["input", "textarea", "select", "button", "a", "label", "p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th", "span", "dt", "dd", "figcaption", "legend", "summary"].includes(tag)) return true
            if (el.getAttribute("role") === "button" || el.getAttribute("role") === "link") return true
            return text.length > 0 && el.children.length === 0
          }
          const overflowX = []
          const overflowY = []
          const overlap = []
          const rects = []
          for (const el of document.body.querySelectorAll("*")) {
            if (skip(el) || !textish(el)) continue
            const r = el.getBoundingClientRect()
            if (r.width < 2 || r.height < 2) continue
            const st = getComputedStyle(el)
            // Intentionally scrollable regions are fine
            if (/(auto|scroll)/.test(st.overflowX) || /(auto|scroll)/.test(st.overflowY)) continue
            if (el.scrollWidth > el.clientWidth + 1) {
              overflowX.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 48)} sw=${el.scrollWidth}>cw=${el.clientWidth}`)
            }
            if (el.scrollHeight > el.clientHeight + 2 && st.overflowY === "hidden") {
              overflowY.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 48)} sh=${el.scrollHeight}>ch=${el.clientHeight}`)
            }
            if (rects.length < 400) rects.push({ el, r, label: `${el.tagName.toLowerCase()}:${(el.textContent || "").trim().slice(0, 24)}` })
          }
          // Pairwise overlap of nearby header/nav/button text (same-line collisions)
          for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < Math.min(rects.length, i + 40); j++) {
              const a = rects[i]
              const b = rects[j]
              if (a.el.contains(b.el) || b.el.contains(a.el)) continue
              if (!(a.el.textContent || "").trim() || !(b.el.textContent || "").trim()) continue
              const ar = a.r
              const br = b.r
              const ix = Math.max(0, Math.min(ar.right, br.right) - Math.max(ar.left, br.left))
              const iy = Math.max(0, Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top))
              if (ix > 2 && iy > 2) {
                const area = ix * iy
                if (area > 24 && Math.min(ar.width * ar.height, br.width * br.height) > 0) {
                  // Ignore large stacked blocks; focus on compact control collisions
                  if (Math.max(ar.height, br.height) < 48 && Math.max(ar.width, br.width) < 320) {
                    overlap.push(`${a.label} ∩ ${b.label}`)
                    if (overlap.length >= 5) break
                  }
                }
              }
            }
            if (overlap.length >= 5) break
          }
          return {
            overflowX: overflowX.slice(0, 5),
            overflowY: overflowY.slice(0, 5),
            overlap: overlap.slice(0, 5),
          }
        })
        if (found.overflowX.length) {
          counts.overflowX += found.overflowX.length
          problems.push(`${width}px [${lang}] ${path} overflowX: ${found.overflowX.join(" | ")}`)
        }
        if (found.overflowY.length) {
          counts.overflowY += found.overflowY.length
          problems.push(`${width}px [${lang}] ${path} overflowY: ${found.overflowY.join(" | ")}`)
        }
        if (found.overlap.length) {
          counts.overlap += found.overlap.length
          problems.push(`${width}px [${lang}] ${path} overlap: ${found.overlap.join(" | ")}`)
        }
      }
    }
    await context.close()
  }
} finally {
  await browser.close()
  server.kill()
}

const summary = `Language-fit: ${counts.pages} page×width loads across ${langs.join(",")} @ ${widths.join("/")}. Flags — overflowX: ${counts.overflowX}, overflowY: ${counts.overflowY}, overlap: ${counts.overlap}.`
if (problems.length) {
  console.error(`${summary}\n${problems.length} problem line(s):\n  ` + problems.join("\n  "))
  process.exit(1)
}
console.log(`${summary} Clean.`)
