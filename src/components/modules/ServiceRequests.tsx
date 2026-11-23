import { useState } from "react"
import { ArrowRight, Check, Clock, Loader2, Send } from "lucide-react"
import { PlaceholderArt } from "@/components/brand/PlaceholderArt"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, inputClass } from "@/components/sections/ContactForm"
import { submitServiceRequest } from "@/lib/handlers"
import { fill, isCompletePhone, isEmail, maskPhone } from "@/lib/format"
import { cn } from "@/lib/utils"

interface ServiceItem {
  id: string
  motif: string
  title: string
  summary: string
  price: "free" | "donation"
  duration: string
  recipients: string[]
  recipientLabels: string
  href?: string
}

const empty = { name: "", phone: "", email: "", date: "", time: "", notes: "" }

function RequestForm({ item, s, onDone }: { item: ServiceItem; s: Record<string, string>; onDone: () => void }) {
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<"idle" | "sending" | "done">("idle")
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: k === "phone" ? maskPhone(e.target.value) : e.target.value }))
  const id = (k: string) => `req-${item.id}-${k}`

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!values.name.trim()) next.name = s.formRequired
    if (!isCompletePhone(values.phone)) next.phone = s.invalidPhone
    if (values.email && !isEmail(values.email)) next.email = s.formInvalidEmail
    setErrors(next)
    if (Object.keys(next).length) {
      document.getElementById(id(Object.keys(next)[0]))?.focus()
      return
    }
    setState("sending")
    await submitServiceRequest({ serviceId: item.id, recipients: item.recipients, fields: values })
    setState("done")
  }

  if (state === "done") {
    return (
      <div role="status" className="py-4 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue text-white">
          <Check aria-hidden="true" />
        </span>
        <p className="mt-4 text-lg text-ink">{s.requestSent}</p>
        <Button variant="outline" className="mt-6" onClick={onDone}>
          {s.close}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field id={id("name")} label={s.formName} error={errors.name}>
          <Input id={id("name")} autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={!!errors.name} className={inputClass} />
        </Field>
      </div>
      <Field id={id("phone")} label={s.phoneRequired} error={errors.phone} hint={s.phoneFormat}>
        <Input id={id("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="(000)-000-0000" value={values.phone} onChange={set("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${id("phone")}-error` : `${id("phone")}-hint`} className={inputClass} />
      </Field>
      <Field id={id("email")} label={s.formEmail} error={errors.email}>
        <Input id={id("email")} type="email" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={!!errors.email} className={inputClass} />
      </Field>
      <Field id={id("date")} label={s.preferredDate}>
        <Input id={id("date")} type="date" value={values.date} onChange={set("date")} className={inputClass} />
      </Field>
      <Field id={id("time")} label={s.preferredTime}>
        <Input id={id("time")} type="time" value={values.time} onChange={set("time")} className={inputClass} />
      </Field>
      <div className="sm:col-span-2">
        <Field id={id("notes")} label={s.notes} hint={s.notesHint}>
          <Textarea id={id("notes")} rows={3} value={values.notes} onChange={set("notes")} aria-describedby={`${id("notes")}-hint`} className="min-h-24 rounded-xl bg-white px-3.5 py-3 text-base" />
        </Field>
      </div>
      <div className="space-y-3 sm:col-span-2">
        <p className="text-sm text-ink-600">{fill(s.requestGoesTo, { to: item.recipientLabels })}</p>
        <Button type="submit" size="lg" className="w-full" disabled={state === "sending"}>
          {state === "sending" ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Send aria-hidden="true" />}
          {s.sendRequest}
        </Button>
        <p className="text-center text-xs text-ink-500">{s.requestSampleNote}</p>
      </div>
    </form>
  )
}

export default function ServiceRequests({ items, s }: { items: ServiceItem[]; s: Record<string, string> }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const current = items.find((i) => i.id === openId)

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="flex min-w-0 flex-col rounded-[1.5rem] border border-border bg-white p-2 transition-shadow hover:shadow-[var(--mission-shadow-soft)]">
            <div className="h-40 overflow-hidden rounded-[1.1rem]">
              <PlaceholderArt motif={item.motif} tone={item.price === "free" ? "blue" : "gold"} alt="" iconSize="30%" />
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", item.price === "free" ? "bg-blue-wash text-blue-deep" : "bg-gold-wash text-ink-700 ring-1 ring-gold-line")}>
                  {item.price === "free" ? s.priceFree : s.priceDonation}
                </span>
                <span className="inline-flex items-center gap-1 text-ink-500">
                  <Clock aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">{s.duration}: </span>
                  {item.duration}
                </span>
              </div>
              <h3 className="mt-3 text-[1.35rem] leading-snug text-ink">{item.title}</h3>
              <p className="mt-2 flex-1 text-ink-600">{item.summary}</p>
              {item.href ? (
                <a href={item.href} className={cn(buttonVariants({ variant: "outline" }), "mt-5 w-full")}>
                  {s.writeNote}
                  <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
                </a>
              ) : (
                <Button variant="outline" className="mt-5 w-full" onClick={() => setOpenId(item.id)}>
                  {s.requestThis}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={!!current} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[92dvh] max-w-[calc(100%-1.5rem)] gap-0 overflow-y-auto rounded-[1.5rem] bg-white p-5 sm:max-w-xl sm:p-7">
          {current ? (
            <>
              <DialogTitle className="pe-8 font-heading text-2xl font-normal text-ink">{fill(s.requestFormTitle, { name: current.title })}</DialogTitle>
              <DialogDescription className="mt-2 mb-5 text-ink-600">{current.summary}</DialogDescription>
              <RequestForm key={current.id} item={current} s={s} onDone={() => setOpenId(null)} />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
