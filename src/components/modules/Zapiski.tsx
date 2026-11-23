import { useId, useMemo, useState } from "react"
import { Check, Info, Loader2, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { OrthodoxCross } from "@/components/brand/OrthodoxCross"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cart } from "@/lib/cart"
import { startPayment, submitCommemorations } from "@/lib/handlers"
import { fill, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

type L = Record<string, string>

interface Option {
  id: string
  label: string
  labels: L
  appliesTo?: string[]
  description?: string
  suggestedDonation?: number
  price?: number
}

interface Props {
  lang: string
  locale: string
  currency: string
  maxNames: number
  maxSlips: number
  healthSlipInk: "red" | "black"
  types: Option[]
  commemorations: Option[]
  prefixes: Option[]
  candles: Option[]
  donationPresets: number[]
  hint: string
  consent: string
  storeOn: boolean
  cartHref: string | null
  lineTemplates: Record<string, { zapiskaLine: string; candleLine: string; donationLine: string }>
  s: Record<string, string>
}

interface NameRow {
  key: string
  prefix: string
  name: string
}

interface Slip {
  key: string
  type: string
  commemoration: string
  candle: string
  names: NameRow[]
}

let counter = 0
const uid = () => `k${++counter}`
const newRow = (): NameRow => ({ key: uid(), prefix: "none", name: "" })

function SlipCard({
  slip,
  index,
  props,
  canRemove,
  onChange,
  onRemove,
  showErrors,
}: {
  slip: Slip
  index: number
  props: Props
  canRemove: boolean
  onChange: (s: Slip) => void
  onRemove: () => void
  showErrors: boolean
}) {
  const { s, types, commemorations, prefixes, candles, maxNames, locale, currency, healthSlipInk } = props
  const baseId = useId().replace(/[^a-zA-Z0-9]/g, "")
  const money = (n: number) => formatMoney(n, locale, currency)
  const isRepose = slip.type === "repose"
  const ink = isRepose ? "text-repose" : healthSlipInk === "red" ? "text-health" : "text-ink"
  const allowedCommemorations = commemorations.filter((c) => !c.appliesTo || c.appliesTo.includes(slip.type))
  const allowedPrefixes = prefixes.filter((p) => !p.appliesTo || p.appliesTo.includes(slip.type))
  const filled = slip.names.filter((n) => n.name.trim()).length
  const typeLabel = types.find((t) => t.id === slip.type)?.label ?? ""

  const setType = (type: string) => {
    const allowedC = commemorations.filter((c) => !c.appliesTo || c.appliesTo.includes(type))
    const allowedP = prefixes.filter((p) => !p.appliesTo || p.appliesTo.includes(type)).map((p) => p.id)
    onChange({
      ...slip,
      type,
      commemoration: allowedC.some((c) => c.id === slip.commemoration) ? slip.commemoration : allowedC[0]?.id,
      names: slip.names.map((n) => (allowedP.includes(n.prefix) ? n : { ...n, prefix: "none" })),
    })
  }
  const setRow = (key: string, patch: Partial<NameRow>) => onChange({ ...slip, names: slip.names.map((n) => (n.key === key ? { ...n, ...patch } : n)) })

  return (
    <fieldset
      className={cn(
        "relative min-w-0 rounded-[1.25rem] bg-[#fffdf9] p-1.5 shadow-[var(--mission-shadow-soft)]",
        isRepose ? "border-[3px] border-repose" : healthSlipInk === "red" ? "border border-health/60" : "border border-ink-300",
      )}
    >
      <legend className="sr-only">{`${fill(s.slipNumber, { n: index + 1 })}: ${typeLabel}`}</legend>
      <div className={cn("rounded-[0.95rem] p-4 sm:p-6", isRepose ? "border border-repose/40" : healthSlipInk === "red" ? "border border-health/25" : "border border-border")}>
        <div className="flex items-start justify-between gap-3">
          <span className="font-tradition text-sm tracking-[0.18em] text-ink-500 uppercase">{fill(s.slipNumber, { n: index + 1 })}</span>
          {canRemove ? (
            <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-destructive">
              <Trash2 aria-hidden="true" className="size-4" />
              {s.removeSlip}
            </button>
          ) : null}
        </div>

        <div className={cn("mt-2 flex flex-col items-center text-center", ink)}>
          <OrthodoxCross size={40} />
          <p className="mt-2 font-tradition text-2xl tracking-[0.06em] sm:text-[1.7rem]" aria-hidden="true">
            {typeLabel}
          </p>
          <span aria-hidden="true" className={cn("mt-3 h-px w-28", isRepose ? "bg-repose/50" : healthSlipInk === "red" ? "bg-health/40" : "bg-gold-line")} />
        </div>

        <div role="radiogroup" aria-label={s.slipType} className="mx-auto mt-5 grid max-w-sm grid-cols-2 rounded-full bg-stone-100 p-1">
          {types.map((t) => (
            <label key={t.id} className={cn("flex min-h-10 cursor-pointer items-center justify-center rounded-full px-2 text-center font-tradition text-[0.9rem] leading-tight has-focus-visible:outline-2 has-focus-visible:outline-blue", slip.type === t.id ? "bg-white text-ink shadow-sm" : "text-ink-600")}>
              <input type="radio" className="sr-only" name={`${baseId}-type`} checked={slip.type === t.id} onChange={() => setType(t.id)} />
              {t.label}
            </label>
          ))}
        </div>

        <div className="mt-6">
          <p className="eyebrow mb-2.5" id={`${baseId}-comm`}>{s.commemoration}</p>
          <div role="radiogroup" aria-labelledby={`${baseId}-comm`} className="grid gap-2 sm:grid-cols-2">
            {allowedCommemorations.map((c) => {
              const active = slip.commemoration === c.id
              return (
                <label key={c.id} className={cn("flex cursor-pointer flex-col rounded-2xl border p-3 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-blue", active ? "border-blue bg-blue-wash" : "border-border bg-white hover:border-ink-300")}>
                  <input type="radio" className="sr-only" name={`${baseId}-commemoration`} checked={active} onChange={() => onChange({ ...slip, commemoration: c.id })} />
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-tradition text-[1.02rem] text-ink">{c.label}</span>
                    {active ? <Check aria-hidden="true" className="size-4 shrink-0 text-blue" /> : null}
                  </span>
                  {c.description ? <span className="mt-1 text-sm leading-snug text-ink-600">{c.description}</span> : null}
                  {c.suggestedDonation ? (
                    <span className="mt-2 text-xs font-medium text-ink-500">{fill(s.suggestedDonation, { amount: money(c.suggestedDonation) })}</span>
                  ) : null}
                </label>
              )
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="eyebrow mb-2.5">{s.namesLegend}</p>
          <ol className="space-y-2">
            {slip.names.map((row, i) => (
              <li key={row.key} className="grid grid-cols-[1.6rem_minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[1.6rem_minmax(0,11rem)_minmax(0,1fr)_auto]">
                <span aria-hidden="true" className={cn("col-start-1 row-start-1 text-end font-tradition tabular-nums", ink)}>{i + 1}.</span>
                <select
                  aria-label={fill(s.prefixN, { n: i + 1 })}
                  value={row.prefix}
                  onChange={(e) => setRow(row.key, { prefix: e.target.value })}
                  className="col-start-2 row-start-2 h-11 min-w-0 rounded-xl border border-input bg-white px-2.5 text-sm text-ink-700 sm:row-start-1"
                >
                  {allowedPrefixes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <Input
                  aria-label={fill(s.nameN, { n: i + 1 })}
                  placeholder={s.namePlaceholder}
                  value={row.name}
                  autoComplete="off"
                  onChange={(e) => setRow(row.key, { name: e.target.value.replace(/\s{2,}/g, " ") })}
                  aria-invalid={showErrors && filled === 0 && i === 0}
                  className="col-start-2 row-start-1 h-11 rounded-xl bg-white px-3.5 font-tradition text-lg sm:col-start-3"
                />
                <button
                  type="button"
                  onClick={() => onChange({ ...slip, names: slip.names.length > 1 ? slip.names.filter((n) => n.key !== row.key) : [newRow()] })}
                  aria-label={fill(s.removeName, { n: i + 1 })}
                  className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "col-start-3 row-start-1 text-ink-500 sm:col-start-4")}
                >
                  <X aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
          {slip.names.length < maxNames ? (
            <Button type="button" variant="ghost" size="sm" className="mt-3 text-blue" onClick={() => onChange({ ...slip, names: [...slip.names, newRow()] })}>
              <Plus aria-hidden="true" />
              {s.addName}
            </Button>
          ) : (
            <p className="mt-3 text-sm text-ink-500">{fill(s.maxNames, { n: maxNames })}</p>
          )}
          {showErrors && filled === 0 ? <p role="alert" className="mt-2 text-sm text-destructive">{s.needOneName}</p> : null}
        </div>

        {candles.length > 0 ? (
          <div className="mt-6">
            <p className="eyebrow mb-2.5" id={`${baseId}-candle`}>{s.candleLabel}</p>
            <div role="radiogroup" aria-labelledby={`${baseId}-candle`} className="flex flex-wrap gap-2">
              {[{ id: "none", label: s.noCandle, price: 0 } as Option, ...candles].map((c) => (
                <label key={c.id} className={cn("inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm has-focus-visible:outline-2 has-focus-visible:outline-blue", slip.candle === c.id ? "border-ink bg-ink text-white" : "border-border bg-white text-ink-700 hover:border-ink-300")}>
                  <input type="radio" className="sr-only" name={`${baseId}-candle`} checked={slip.candle === c.id} onChange={() => onChange({ ...slip, candle: c.id })} />
                  {c.label}
                  {c.price ? <span className={slip.candle === c.id ? "text-white/80" : "text-ink-500"}>{money(c.price)}</span> : null}
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </fieldset>
  )
}

export default function Zapiski(props: Props) {
  const { s, types, commemorations, prefixes, candles, maxSlips, donationPresets, locale, currency, hint, consent, storeOn, cartHref, lang, lineTemplates } = props
  const makeSlip = (type = types[0]?.id ?? "health"): Slip => ({
    key: uid(),
    type,
    commemoration: commemorations.find((c) => !c.appliesTo || c.appliesTo.includes(type))?.id ?? "",
    candle: "none",
    names: [newRow(), newRow(), newRow()],
  })
  const [slips, setSlips] = useState<Slip[]>(() => [makeSlip()])
  const [donation, setDonation] = useState<number | "other">(0)
  const [otherDonation, setOtherDonation] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [state, setState] = useState<"idle" | "sending" | "carted" | "submitted">("idle")
  const money = (n: number) => formatMoney(n, locale, currency)
  const extra = donation === "other" ? Number(otherDonation.replace(",", ".")) || 0 : donation

  const priced = useMemo(
    () =>
      slips.map((slip) => {
        const comm = commemorations.find((c) => c.id === slip.commemoration)
        const candle = candles.find((c) => c.id === slip.candle)
        const names = slip.names
          .filter((n) => n.name.trim())
          .map((n) => {
            const prefix = prefixes.find((p) => p.id === n.prefix && p.id !== "none")
            return prefix ? `${prefix.label} ${n.name.trim()}` : n.name.trim()
          })
        // Commemorations are free by default; only candle prices and optional extra donation add to the total.
        return { slip, comm, candle, names, amount: candle?.price ?? 0 }
      }),
    [slips, commemorations, candles, prefixes],
  )
  const total = priced.reduce((n, p) => n + p.amount, 0) + extra
  const valid = priced.every((p) => p.names.length > 0) && agreed

  function validate() {
    setShowErrors(true)
    return valid
  }

  function cartLines() {
    const langs = Object.keys(lineTemplates)
    const byLang = (fn: (lng: string) => string) => Object.fromEntries(langs.map((lng) => [lng, fn(lng)]))
    const lines: Parameters<typeof cart.addOfferings>[0] = []
    for (const p of priced) {
      const type = types.find((t) => t.id === p.slip.type)!
      lines.push({
        offeringType: "zapiska",
        title: byLang((lng) => fill(lineTemplates[lng].zapiskaLine, { type: type.labels[lng] ?? type.label, commemoration: p.comm?.labels[lng] ?? p.comm?.label ?? "" })),
        names: p.names,
        amount: 0,
      })
      if (p.candle && (p.candle.price ?? 0) > 0) {
        const candle = p.candle
        lines.push({ offeringType: "candle", title: byLang((lng) => fill(lineTemplates[lng].candleLine, { name: candle.labels[lng] ?? candle.label })), amount: candle.price ?? 0 })
      }
    }
    if (extra > 0) lines.push({ offeringType: "donation", title: byLang((lng) => lineTemplates[lng].donationLine), amount: extra })
    return lines
  }

  async function addToCart() {
    if (!validate()) return
    cart.addOfferings(cartLines())
    setState("carted")
  }

  async function donateAndSubmit() {
    if (!validate()) return
    setState("sending")
    const payment = await startPayment({ purpose: "offering", amount: total, currency, lines: cartLines(), metadata: { lang } })
    await submitCommemorations({ slips: priced.map((p) => ({ type: p.slip.type, commemoration: p.slip.commemoration, candle: p.slip.candle, names: p.names })), payment })
    setState("submitted")
  }

  const reset = () => {
    setSlips([makeSlip()])
    setDonation(0)
    setOtherDonation("")
    setAgreed(false)
    setShowErrors(false)
    setState("idle")
  }

  if (state === "carted" || state === "submitted") {
    return (
      <div role="status" className="mx-auto max-w-xl rounded-[1.75rem] border border-blue-line bg-blue-wash p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue text-white">
          <Check aria-hidden="true" />
        </span>
        <p className="mt-4 text-lg text-ink">{state === "carted" ? s.notesAdded : s.notesSubmitted}</p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          {state === "carted" && cartHref ? (
            <a href={cartHref} className={buttonVariants()}>
              <ShoppingBag aria-hidden="true" />
              {s.viewCart}
            </a>
          ) : null}
          <Button variant="outline" onClick={reset}>
            {s.writeAnother}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
      <div className="min-w-0 space-y-6">
        <p className="flex items-start gap-3 rounded-2xl border border-gold-line bg-gold-wash px-4 py-3.5 text-ink-700">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" />
          <span>{hint}</span>
        </p>
        {slips.map((slip, i) => (
          <SlipCard
            key={slip.key}
            slip={slip}
            index={i}
            props={props}
            canRemove={slips.length > 1}
            showErrors={showErrors}
            onChange={(next) => setSlips((all) => all.map((x) => (x.key === slip.key ? next : x)))}
            onRemove={() => setSlips((all) => all.filter((x) => x.key !== slip.key))}
          />
        ))}
        {slips.length < maxSlips ? (
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <Button key={t.id} type="button" variant="outline" onClick={() => setSlips((all) => [...all, makeSlip(t.id)])}>
                <Plus aria-hidden="true" />
                {s.addSlip}: {t.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      <aside className="min-w-0">
        <div className="space-y-5 rounded-[1.5rem] border border-border bg-white p-5 shadow-[var(--mission-shadow-soft)] lg:sticky lg:top-24">
          <h2 className="font-heading text-2xl text-ink">{s.notesSummary}</h2>
          <ul className="space-y-3 text-sm">
            {priced.map((p, i) => (
              <li key={p.slip.key} className="flex items-start justify-between gap-3 border-b border-border pb-3">
                <span className="min-w-0">
                  <span className="block font-medium text-ink">
                    {fill(s.slipNumber, { n: i + 1 })} · {types.find((t) => t.id === p.slip.type)?.label}
                  </span>
                  <span className="block text-ink-600">
                    {p.comm?.label} · {p.names.length === 1 ? s.oneName : fill(s.namesCount, { n: p.names.length })}
                  </span>
                  {p.candle ? <span className="block text-ink-500">{fill(s.candleLine, { name: p.candle.label })}</span> : null}
                </span>
                <span className="shrink-0 font-tradition text-ink tabular-nums">{money(p.amount)}</span>
              </li>
            ))}
          </ul>

          <fieldset>
            <legend className="eyebrow mb-2.5">{s.extraDonation}</legend>
            <div className="flex flex-wrap gap-2">
              {[0, ...donationPresets].map((d) => (
                <label key={d} className={cn("inline-flex h-9 cursor-pointer items-center rounded-full border px-3.5 text-sm has-focus-visible:outline-2 has-focus-visible:outline-blue", donation === d ? "border-ink bg-ink text-white" : "border-border text-ink-700")}>
                  <input type="radio" className="sr-only" name="zap-donation" checked={donation === d} onChange={() => setDonation(d)} />
                  {d === 0 ? s.noExtra : money(d)}
                </label>
              ))}
              <label className={cn("inline-flex h-9 min-w-0 items-center gap-1.5 rounded-full border ps-3 pe-1 text-sm", donation === "other" ? "border-ink" : "border-border")}>
                <input type="radio" className="sr-only" name="zap-donation" checked={donation === "other"} onChange={() => setDonation("other")} />
                <span className="shrink-0 text-ink-700">{s.otherAmount}</span>
                <input
                  inputMode="decimal"
                  aria-label={s.otherAmount}
                  value={otherDonation}
                  onFocus={() => setDonation("other")}
                  onChange={(e) => setOtherDonation(e.target.value.replace(/[^\d.,]/g, ""))}
                  placeholder={money(0)}
                  className="h-7 w-16 rounded-full bg-stone-100 px-2 text-end outline-none"
                />
              </label>
            </div>
          </fieldset>

          <p className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-medium text-ink">{s.total}</span>
            <span className="font-tradition text-2xl text-ink tabular-nums">{money(total)}</span>
          </p>

          <label className="flex items-start gap-3 text-sm text-ink-700">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--mission-blue)]" aria-invalid={showErrors && !agreed} />
            <span>{consent}</span>
          </label>
          {showErrors && !agreed ? <p role="alert" className="text-sm text-destructive">{s.consentRequired}</p> : null}

          <div className="grid gap-2">
            <Button size="lg" onClick={donateAndSubmit} disabled={state === "sending"} className="whitespace-normal">
              {state === "sending" ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
              {s.donateAndSubmit} · {money(total)}
            </Button>
            {storeOn ? (
              <Button size="lg" variant="outline" onClick={addToCart}>
                <ShoppingBag aria-hidden="true" />
                {s.addNotesToCart}
              </Button>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-ink-500">{s.donateSampleNote}</p>
        </div>
      </aside>
    </div>
  )
}
