import { useState } from "react"
import { Check, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { startPayment } from "@/lib/handlers"
import { fill, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
  presets: number[]
  defaultPreset: number
  minimum: number
  currency: string
  locale: string
  funds: { id: string; label: string }[]
  frequencies: ("one-time" | "monthly")[]
  s: Record<string, string>
}

export default function DonateForm({ presets, defaultPreset, minimum, currency, locale, funds, frequencies, s }: Props) {
  const [frequency, setFrequency] = useState<"one-time" | "monthly">(frequencies[0] ?? "one-time")
  const [preset, setPreset] = useState<number | "other">(defaultPreset)
  const [other, setOther] = useState("")
  const [fund, setFund] = useState(funds[0]?.id ?? "general")
  const [state, setState] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState("")

  const amount = preset === "other" ? Number(other.replace(",", ".")) || 0 : preset
  const money = (n: number) => formatMoney(n, locale, currency)
  const fundLabel = funds.find((f) => f.id === fund)?.label ?? ""

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (amount < minimum) {
      setError(fill(s.minimumAmount, { amount: money(minimum) }))
      return
    }
    setError("")
    setState("sending")
    await startPayment({ purpose: "donation", amount, currency, frequency, fund })
    setState("done")
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-[1.75rem] border border-blue-line bg-blue-wash p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue text-white">
          <Check aria-hidden="true" />
        </span>
        <p className="mt-4 font-heading text-2xl text-ink">
          {fill(frequency === "monthly" ? s.donateSummaryMonthly : s.donateSummary, { amount: money(amount), fund: fundLabel })}
        </p>
        <p className="mx-auto mt-2 max-w-md text-ink-700">{s.donateThanks}</p>
        <Button variant="outline" className="mt-6" onClick={() => setState("idle")}>
          {s.donateAgain}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-[1.75rem] border border-border bg-white p-5 shadow-[var(--mission-shadow-soft)] sm:p-8">
      {frequencies.length > 1 ? (
        <fieldset>
          <legend className="eyebrow mb-3">{s.frequency}</legend>
          <div className="grid grid-cols-2 rounded-full bg-stone-100 p-1">
            {frequencies.map((f) => (
              <label key={f} className={cn("flex h-11 cursor-pointer items-center justify-center rounded-full font-tradition transition-colors has-focus-visible:outline-2 has-focus-visible:outline-blue", frequency === f ? "bg-white text-ink shadow-sm" : "text-ink-600")}>
                <input type="radio" name="frequency" value={f} checked={frequency === f} onChange={() => setFrequency(f)} className="sr-only" />
                {f === "monthly" ? s.monthlyGift : s.oneTime}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="mt-7">
        <legend className="eyebrow mb-3">{s.amount}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {presets.map((p) => (
            <label key={p} className={cn("flex h-14 cursor-pointer items-center justify-center rounded-2xl border font-tradition text-xl transition-colors has-focus-visible:outline-2 has-focus-visible:outline-blue", preset === p ? "border-blue bg-blue text-white" : "border-border text-ink hover:border-ink-300")}>
              <input type="radio" name="amount" value={p} checked={preset === p} onChange={() => setPreset(p)} className="sr-only" />
              {money(p)}
            </label>
          ))}
        </div>
        <label className={cn("mt-2 flex h-14 items-center gap-3 rounded-2xl border px-4 transition-colors", preset === "other" ? "border-blue" : "border-border")}>
          <input type="radio" name="amount" value="other" checked={preset === "other"} onChange={() => setPreset("other")} className="size-4 accent-[var(--mission-blue)]" />
          <span className="shrink-0 text-ink-700">{s.otherAmount}</span>
          <Input
            inputMode="decimal"
            aria-label={s.otherAmount}
            value={other}
            onFocus={() => setPreset("other")}
            onChange={(e) => setOther(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder={money(minimum * 10)}
            className="h-10 min-w-0 flex-1 border-0 text-end font-tradition text-lg shadow-none focus-visible:ring-0"
          />
        </label>
      </fieldset>

      {funds.length > 1 ? (
        <label className="mt-7 block">
          <span className="eyebrow mb-3 block">{s.fund}</span>
          <select value={fund} onChange={(e) => setFund(e.target.value)} className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-ink">
            {funds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" className="mt-8 w-full whitespace-normal" disabled={state === "sending"}>
        {state === "sending" ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Lock aria-hidden="true" />}
        {fill(frequency === "monthly" ? s.giveMonthly : s.giveOnce, { amount: money(amount || 0) })}
      </Button>
      <p className="mt-4 text-center text-xs leading-relaxed text-ink-500">{s.donateSampleNote}</p>
      <p className="mt-1 text-center text-xs text-ink-500">{s.donateTax}</p>
    </form>
  )
}
