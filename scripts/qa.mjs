// Loads every built page at each test width and reports horizontal overflow
// and console errors. Build first, then: npm run qa
// Uses a local Chrome; set CHROME to its path if it is not /usr/local/bin/google-chrome.
import { readdirSync, statSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"
import { chromium } from "playwright-core"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dist = join(root, "dist")
const port = Number(process.env.QA_PORT ?? 4638)
const widths = (process.env.QA_WIDTHS ?? "360,390,768,1280,1440").split(",").map(Number)

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

const server = spawn(join(root, "node_modules/.bin/astro"), ["preview", "--force", "--port", String(port), "--host", "127.0.0.1"], { cwd: root, stdio: "ignore" })
const base = `http://127.0.0.1:${port}`
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(base)).ok) break
  } catch {}
  await new Promise((r) => setTimeout(r, 250))
}

const list = [...routes(dist), "/404.html"]
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/local/bin/google-chrome" })
const problems = []
let checks = 0
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 860 } })
    const page = await context.newPage()
    let errors = []
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
    page.on("pageerror", (e) => errors.push(String(e)))
    for (const path of list) {
      errors = []
      await page.goto(base + path, { waitUntil: "load" })
      await page.waitForTimeout(150)
      const offenders = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth
        const contained = (el) => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const ox = getComputedStyle(p).overflowX
            if (ox !== "visible") {
              const r = p.getBoundingClientRect()
              return r.left >= -1 && r.right <= vw + 1
            }
          }
          return false
        }
        const found = []
        for (const el of document.body.querySelectorAll("*")) {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          if (r.right <= vw + 1 && r.left >= -1) continue
          const st = getComputedStyle(el)
          if (st.position === "fixed" || st.visibility === "hidden" || el.closest("[aria-hidden='true'],.sr-only,[inert]")) continue
          if (contained(el)) continue
          found.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} (${Math.round(r.left)}..${Math.round(r.right)} of ${vw})`)
          if (found.length >= 3) break
        }
        return found
      })
      checks++
      if (offenders.length) problems.push(`${width}px ${path} overflow: ${offenders.join(" | ")}`)
      const real = errors.filter((e) => !/favicon|404 \(Not Found\)/.test(e) || path !== "/404.html")
      if (real.length) problems.push(`${width}px ${path} console: ${real.slice(0, 2).join(" | ")}`)
    }
    await context.close()
  }
} finally {
  await browser.close()
  server.kill()
}

if (problems.length) {
  console.error(`QA found ${problems.length} problem(s) in ${checks} page loads:\n  ` + problems.join("\n  "))
  process.exit(1)
}
console.log(`QA OK: ${list.length} pages x ${widths.length} widths = ${checks} page loads, no overflow, no console errors.`)
