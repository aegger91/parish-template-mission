import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { connectSignup } from "@/lib/handlers"

export interface ConnectTarget {
  itemType: "event" | "need"
  itemId: string
  slotId?: string
  title: string
  subtitle?: string
  allowGuests?: boolean
  maxGuests?: number
}

export function ConnectBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-line bg-white px-2 py-0.5 text-[0.7rem] font-semibold text-blue-deep">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-blue" />
      {label}
    </span>
  )
}

export function CapacityBar({ signups, capacity, s }: { signups: number; capacity: number; s: Record<string, string> }) {
  const left = Math.max(0, capacity - signups)
  const pct = capacity > 0 ? Math.min(100, (signups / capacity) * 100) : 0
  return (
    <div>
      <div className="flex flex-wrap justify-between gap-2 text-xs text-ink-500">
        <span>{s.signedUpCount.replace("{n}", String(signups)).replace("{cap}", String(capacity))}</span>
        <span className={left === 0 ? "font-semibold text-ink-700" : left <= 2 ? "font-semibold text-gold" : ""}>
          {left === 0 ? s.full : left === 1 ? s.oneSpotLeft : s.spotsLeft.replace("{n}", String(left))}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100" role="presentation">
        <div className={left === 0 ? "h-full rounded-full bg-ink-300" : "h-full rounded-full bg-blue"} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ConnectDialog({ target, parishId, s, onClose, onConfirmed }: { target: ConnectTarget | null; parishId: string; s: Record<string, string>; onClose: () => void; onConfirmed: (t: ConnectTarget, guests: number) => void }) {
  const [guests, setGuests] = useState(1)
  const [sending, setSending] = useState(false)

  async function confirm() {
    if (!target) return
    setSending(true)
    await connectSignup({ parishId, itemType: target.itemType, itemId: target.itemId, slotId: target.slotId, guests: target.allowGuests ? guests : undefined })
    setSending(false)
    onConfirmed(target, target.allowGuests ? guests : 1)
    setGuests(1)
  }

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[1.5rem] bg-white p-6 sm:max-w-md">
        {target ? (
          <>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-blue font-tradition text-white">OC</span>
              <DialogTitle className="font-heading text-xl font-normal text-ink">{s.connectSignInTitle}</DialogTitle>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="font-heading text-lg text-ink">{target.title}</p>
              {target.subtitle ? <p className="text-sm text-ink-600">{target.subtitle}</p> : null}
            </div>
            {target.allowGuests ? (
              <label className="flex items-center justify-between gap-3 text-sm text-ink-700">
                {s.peopleComing}
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="h-10 rounded-xl border border-input bg-white px-3">
                  {Array.from({ length: Math.max(1, target.maxGuests ?? 6) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <DialogDescription className="text-sm text-ink-600">{s.connectSignInText}</DialogDescription>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={onClose}>
                {s.cancel}
              </Button>
              <Button onClick={confirm} disabled={sending}>
                {sending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
                {s.connectContinue}
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
