// Desktop and mobile screenshots of the main screens, taken from the built site.
// Build first, then: node scripts/screenshots.mjs [outDir]
import { mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"
import { chromium } from "playwright-core"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const out = process.argv[2] ?? join(root, "screenshots")
mkdirSync(out, { recursive: true })
const port = 4639
const base = `http://127.0.0.1:${port}`
const server = spawn(join(root, "node_modules/.bin/astro"), ["preview", "--force", "--port", String(port), "--host", "127.0.0.1"], { cwd: root, stdio: "ignore" })
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(base)).ok) break
  } catch {}
  await new Promise((r) => setTimeout(r, 250))
}

const sampleCart = [
  { kind: "product", key: "prd-icon-pantocrator:v-4x6", productId: "prd-icon-pantocrator", variantId: "v-4x6", title: { en: "Christ the Pantocrator, mounted print", es: "Cristo Pantocrátor, lámina montada" }, variantLabel: { en: "4 x 6 in", es: "10 x 15 cm" }, unitPrice: 18, quantity: 1, maxQuantity: 12, motif: "icon-frame" },
  { kind: "product", key: "prd-tapers:v-thin", productId: "prd-tapers", variantId: "v-thin", title: { en: "Beeswax taper candles", es: "Velas de cera de abeja" }, variantLabel: { en: "Thin, box of 50", es: "Finas, caja de 50" }, unitPrice: 12, quantity: 2, maxQuantity: 40, motif: "candle" },
  { kind: "offering", key: "offering-sample-0", offeringType: "zapiska", title: { en: "For Health: Proskomedia", es: "Por la salud: Proskomidia" }, names: ["John", "Mary", "infant Peter"], amount: 5, quantity: 1 },
  { kind: "offering", key: "offering-sample-1", offeringType: "candle", title: { en: "Candle: Medium candle", es: "Vela: Vela mediana" }, amount: 5, quantity: 1 },
]

const shots = [
  { name: "home-en", path: "/" },
  { name: "home-es", path: "/es/" },
  { name: "schedule-weekly", path: "/services/" },
  { name: "schedule-monthly", path: "/services/?view=month" },
  { name: "schedule-weekly-es", path: "/es/services/" },
  { name: "donate", path: "/donate/" },
  { name: "our-parish-clergy", path: "/our-parish/clergy/" },
  { name: "store-grid", path: "/store/" },
  { name: "store-product", path: "/store/christ-pantocrator-print/" },
  { name: "store-cart", path: "/store/cart/", cart: true },
  { name: "store-checkout", path: "/store/checkout/", cart: true },
  { name: "request-a-service", path: "/services/request/" },
  {
    name: "request-a-service-form",
    path: "/services/request/",
    viewportOnly: true,
    action: async (page) => {
      await page.locator("#request-grid button", { hasText: "Request" }).nth(1).click()
      await page.getByRole("dialog").waitFor()
      await page.getByRole("dialog").locator("input[type=tel]").fill("5555550142")
      await page.waitForTimeout(400)
    },
  },
  {
    name: "zapiski",
    path: "/services/zapiski/",
    action: async (page) => {
      const inputs = page.locator("#zapiski-form input[type=text], #zapiski-form input:not([type])")
      const names = ["John", "Mary", "Peter"]
      for (let i = 0; i < names.length; i++) await inputs.nth(i).fill(names[i])
      await page.locator("#zapiski-form button", { hasText: "For the Repose" }).last().click()
      await page.waitForTimeout(300)
      const more = page.locator("#zapiski-form input[type=text], #zapiski-form input:not([type])")
      const count = await more.count()
      if (count > 3) await more.nth(3).fill("Anna")
      await page.waitForTimeout(300)
    },
  },
  { name: "zapiski-es", path: "/es/services/zapiski/" },
  { name: "get-involved", path: "/get-involved/" },
  { name: "events-list", path: "/get-involved/events/" },
  {
    name: "events-calendar",
    path: "/get-involved/events/",
    action: async (page) => {
      await page.locator("#events-board button", { hasText: "Calendar" }).click()
      await page.waitForTimeout(300)
    },
  },
  {
    name: "events-rsvp",
    path: "/get-involved/events/",
    viewportOnly: true,
    action: async (page) => {
      await page.locator("#events-board button", { hasText: "RSVP" }).first().click()
      await page.getByRole("dialog").waitFor()
      await page.waitForTimeout(400)
    },
  },
  { name: "volunteer-needs", path: "/get-involved/volunteer/" },
  {
    name: "menu-drawer",
    path: "/",
    viewportOnly: true,
    mobileOnly: true,
    action: async (page) => {
      await page.getByRole("button", { name: "Menu" }).click()
      await page.waitForTimeout(500)
    },
  },
]

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/usr/local/bin/google-chrome" })
try {
  for (const device of [
    { id: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    { id: "mobile", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  ]) {
    for (const shot of shots) {
      if (shot.mobileOnly && device.id !== "mobile") continue
      const context = await browser.newContext({ viewport: device.viewport, deviceScaleFactor: device.deviceScaleFactor, isMobile: device.isMobile, hasTouch: device.hasTouch })
      if (shot.cart) await context.addInitScript((lines) => localStorage.setItem("mission-cart-v1", JSON.stringify(lines)), sampleCart)
      const page = await context.newPage()
      await page.goto(base + shot.path, { waitUntil: "networkidle" })
      await page.evaluate(() => document.fonts.ready)
      if (!shot.viewportOnly) {
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 60))
          }
          window.scrollTo(0, 0)
        })
        await page.waitForTimeout(400)
      }
      if (shot.action) await shot.action(page)
      if (!shot.viewportOnly) {
        // Full-page captures would stamp the fixed bottom bar mid-page; pin it to the end instead.
        await page.addStyleTag({ content: "body{position:relative}[data-mobile-bar]{position:absolute!important}" })
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.waitForTimeout(400)
      }
      const file = join(out, `${shot.name}-${device.id}.png`)
      await page.screenshot({ path: file, fullPage: !shot.viewportOnly })
      console.log(file)
      await context.close()
    }
  }
} finally {
  await browser.close()
  server.kill()
}
