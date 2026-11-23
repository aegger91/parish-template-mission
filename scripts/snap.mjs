// Quick screenshot helper: node scripts/snap.mjs <url-path> <width> <out.png> [fullPage=1]
import { chromium } from "playwright-core"

const [, , path = "/", width = "1280", out = "/tmp/snap.png", full = "1"] = process.argv
const base = process.env.BASE ?? "http://127.0.0.1:4637"
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/local/bin/google-chrome" })
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(width) < 700 ? 800 : 900 }, deviceScaleFactor: Number(width) < 700 ? 2 : 1 })
const errors = []
page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
page.on("pageerror", (e) => errors.push(String(e)))
await page.goto(base + path, { waitUntil: "networkidle" })
await page.waitForTimeout(600)
if (process.env.SEL) await page.locator(process.env.SEL).first().screenshot({ path: out })
else await page.screenshot({ path: out, fullPage: full === "1" })
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
console.log(JSON.stringify({ path, width, overflow, errors }))
await browser.close()
