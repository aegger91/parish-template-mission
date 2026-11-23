import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { Pictogram } from "@/components/brand/Pictogram"
import { cn } from "@/lib/utils"

interface Card {
  id: string
  icon: string
  title: string
  summary: string
  detail: string
}

export default function WhatToExpect({ items, s }: { items: Card[]; s: Record<string, string> }) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setFlipped((f) => ({ ...f, [id]: !f[id] }))

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {items.map((card, index) => {
        const isFlipped = !!flipped[card.id]
        const detailId = `expect-detail-${card.id}`
        return (
          <li key={card.id} className="flip-scene">
            <button
              type="button"
              onClick={() => toggle(card.id)}
              aria-expanded={isFlipped}
              aria-controls={detailId}
              className="group block w-full rounded-[1.5rem] text-start focus-visible:outline-offset-4"
            >
              <span className="flip-inner grid min-h-[17rem]" data-flipped={isFlipped}>
                <span
                  aria-hidden={isFlipped}
                  className="flip-face flip-front col-start-1 row-start-1 flex flex-col rounded-[1.5rem] border border-border bg-white p-6 transition-shadow group-hover:shadow-[var(--mission-shadow-soft)]"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="kiot-arch flex h-16 w-13 items-center justify-center border border-gold-line bg-blue-wash text-blue">
                      <Pictogram name={card.icon} size={32} strokeWidth={1.2} />
                    </span>
                    <span className="font-tradition text-sm text-ink-300 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="mt-auto block pt-8">
                    <span className="block font-heading text-2xl text-ink">{card.title}</span>
                    <span className="mt-1.5 block text-ink-600">{card.summary}</span>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue">
                      <span aria-hidden="true" className="h-px w-4 bg-gold" />
                      {s.tapToRead}
                    </span>
                  </span>
                </span>
                <span
                  id={detailId}
                  aria-hidden={!isFlipped}
                  className="flip-face flip-back col-start-1 row-start-1 flex flex-col rounded-[1.5rem] border border-blue bg-blue p-6 text-white"
                >
                  <span className="flex items-center gap-3">
                    <Pictogram name={card.icon} size={22} strokeWidth={1.4} className="text-white/80" />
                    <span className="font-heading text-xl">{card.title}</span>
                  </span>
                  <span className="mt-4 block leading-relaxed text-white/90">{card.detail}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm text-white/75">
                    <RotateCcw aria-hidden="true" className="size-3.5" />
                    {s.tapToReturn}
                  </span>
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
