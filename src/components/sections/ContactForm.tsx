import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitContactMessage } from "@/lib/handlers"
import { isCompletePhone, isEmail, maskPhone } from "@/lib/format"

export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export const inputClass = "h-11 rounded-xl bg-white px-3.5 text-base"

const topics = ["visit", "sacraments", "prayer", "other"] as const

export default function ContactForm({ s }: { s: Record<string, string> }) {
  const [values, setValues] = useState({ name: "", email: "", phone: "", topic: "visit", message: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<"idle" | "sending" | "done">("idle")
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [k]: k === "phone" ? maskPhone(e.target.value) : e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!values.name.trim()) next.name = s.formRequired
    if (!isEmail(values.email)) next.email = s.formInvalidEmail
    if (values.phone && !isCompletePhone(values.phone)) next.phone = s.invalidPhone
    if (!values.message.trim()) next.message = s.formRequired
    setErrors(next)
    if (Object.keys(next).length) {
      document.getElementById(`contact-${Object.keys(next)[0]}`)?.focus()
      return
    }
    setState("sending")
    await submitContactMessage(values)
    setState("done")
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-[1.75rem] border border-blue-line bg-blue-wash p-8">
        <span className="flex size-11 items-center justify-center rounded-full bg-blue text-white">
          <Check aria-hidden="true" />
        </span>
        <p className="mt-4 text-lg text-ink">{s.formSent}</p>
        <Button variant="outline" className="mt-6" onClick={() => { setValues({ name: "", email: "", phone: "", topic: "visit", message: "" }); setState("idle") }}>
          {s.formSendAnother}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 rounded-[1.75rem] border border-border bg-white p-5 shadow-[var(--mission-shadow-soft)] sm:grid-cols-2 sm:p-8">
      <Field id="contact-name" label={s.formName} error={errors.name}>
        <Input id="contact-name" autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "contact-name-error" : undefined} className={inputClass} />
      </Field>
      <Field id="contact-email" label={s.formEmail} error={errors.email}>
        <Input id="contact-email" type="email" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "contact-email-error" : undefined} className={inputClass} />
      </Field>
      <Field id="contact-phone" label={s.formPhone} error={errors.phone} hint={s.phoneFormat}>
        <Input id="contact-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(000)-000-0000" value={values.phone} onChange={set("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "contact-phone-error" : "contact-phone-hint"} className={inputClass} />
      </Field>
      <Field id="contact-topic" label={s.formTopic}>
        <select id="contact-topic" value={values.topic} onChange={set("topic")} className="h-11 w-full rounded-xl border border-input bg-white px-3 text-ink">
          {topics.map((t) => (
            <option key={t} value={t}>
              {s[`formTopic.${t}`]}
            </option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field id="contact-message" label={s.formMessage} error={errors.message}>
          <Textarea id="contact-message" rows={5} value={values.message} onChange={set("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "contact-message-error" : undefined} className="min-h-32 rounded-xl bg-white px-3.5 py-3 text-base" />
        </Field>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-500">{s.formSampleNote}</p>
        <Button type="submit" size="lg" disabled={state === "sending"}>
          {state === "sending" ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
          {state === "sending" ? s.formSending : s.formSend}
        </Button>
      </div>
    </form>
  )
}
