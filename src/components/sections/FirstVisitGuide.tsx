import { useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Lightbulb, RotateCcw } from "lucide-react"
import { Pictogram } from "@/components/brand/Pictogram"
import { Button, buttonVariants } from "@/components/ui/button"
import { fill } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  icon: string
  title: string
  text: string
  tip?: string
}

export default function FirstVisitGuide({ steps, s, cta }: { steps: Step[]; s: Record<string, string>; cta: { label: string; href: string } | null }) {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const total = steps.length
  const step = steps[active]

  const go = (index: number, focus = false) => {
    const next = Math.max(0, Math.min(total - 1, index))
    setDirection(next >= active ? 1 : -1)
    setActive(next)
    if (focus) tabRefs.current[next]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const rtl = document.documentElement.dir === "rtl"
    const forward = rtl ? "ArrowLeft" : "ArrowRight"
    const back = rtl ? "ArrowRight" : "ArrowLeft"
    if (e.key === forward || e.key === "ArrowDown") {
      e.preventDefault()
      go(active + 1, true)
    } else if (e.key === back || e.key === "ArrowUp") {
      e.preventDefault()
      go(active - 1, true)
    } else if (e.key === "Home") {
      e.preventDefault()
      go(0, true)
    } else if (e.key === "End") {
      e.preventDefault()
      go(total - 1, true)
    }
  }

  const progress = total > 1 ? (active / (total - 1)) * 100 : 100

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
      <div className="min-w-0">
        <div role="tablist" aria-orientation="vertical" aria-label={fill(s.stepOf, { n: active + 1, total })} onKeyDown={onKeyDown} className="relative flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
          <span aria-hidden="true" className="absolute start-[1.15rem] top-5 bottom-5 hidden w-px bg-stone-200 lg:block" />
          <span aria-hidden="true" className="absolute start-[1.15rem] top-5 hidden w-px bg-gold transition-[height] duration-500 lg:block" style={{ height: `calc((100% - 2.5rem) * ${progress / 100})` }} />
          {steps.map((st, i) => {
            const selected = i === active
            const done = i < active
            return (
              <button
                key={st.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                role="tab"
                id={`visit-tab-${st.id}`}
                aria-selected={selected}
                aria-controls="visit-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => go(i)}
                className={cn(
                  "relative flex shrink-0 items-center gap-3 rounded-full py-2 pe-4 ps-1 text-start transition-colors lg:rounded-2xl lg:py-2.5",
                  selected ? "bg-blue-wash text-blue-deep" : "text-ink-600 hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border font-tradition text-sm transition-colors",
                    selected ? "border-blue bg-blue text-white" : done ? "border-gold bg-gold-wash text-ink" : "border-stone-300 bg-white text-ink-500",
                  )}
                >
                  {i + 1}
                </span>
                <span className="font-tradition text-[0.95rem] whitespace-nowrap lg:whitespace-normal">{st.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-w-0">
        <div
          id="visit-panel"
          role="tabpanel"
          aria-labelledby={`visit-tab-${step.id}`}
          aria-live="polite"
          className="relative overflow-hidden rounded-[1.75rem] border border-border bg-white p-6 shadow-[var(--mission-shadow-soft)] sm:p-10"
        >
          <div key={step.id} className={cn("animate-in duration-500 fade-in-0", direction === 1 ? "slide-in-from-right-6 rtl:slide-in-from-left-6" : "slide-in-from-left-6 rtl:slide-in-from-right-6", "motion-reduce:animate-none")}>
            <div className="flex flex-wrap items-center gap-4">
              <span className="kiot-arch flex h-20 w-16 items-center justify-center border border-gold-line bg-stone-50 text-blue">
                <Pictogram name={step.icon} size={38} strokeWidth={1.1} />
              </span>
              <div className="min-w-0">
                <p className="eyebrow">{fill(s.stepOf, { n: active + 1, total })}</p>
                <h3 className="mt-1 text-[1.9rem] leading-tight text-ink sm:text-4xl">{step.title}</h3>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">{step.text}</p>
            {step.tip ? (
              <p className="mt-6 flex max-w-2xl items-start gap-3 rounded-2xl bg-gold-wash px-4 py-3 text-ink-700">
                <Lightbulb aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>
                  <span className="font-semibold">{s.tip}: </span>
                  {step.tip}
                </span>
              </p>
            ) : null}
          </div>

          <div className="mt-8 h-1 overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
            <div className="h-full rounded-full bg-blue transition-[width] duration-500" style={{ width: `${((active + 1) / total) * 100}%` }} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => go(active - 1)} disabled={active === 0}>
              <ArrowLeft aria-hidden="true" className="rtl:rotate-180" />
              {s.back}
            </Button>
            {active < total - 1 ? (
              <Button onClick={() => go(active + 1)}>
                {s.next}
                <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
              </Button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => go(0)}>
                  <RotateCcw aria-hidden="true" />
                  {s.startOver}
                </Button>
                {cta ? (
                  <a href={cta.href} className={buttonVariants()}>
                    {cta.label}
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
