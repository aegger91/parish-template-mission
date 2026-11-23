import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { subscribeNewsletter } from "@/lib/handlers"
import { isEmail } from "@/lib/format"

interface Props {
  s: Record<string, string>
  listId: string
  parishId: string
}

export default function NewsletterForm({ s, listId, parishId }: Props) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmail(email)) {
      setError(s.formInvalidEmail)
      return
    }
    setError("")
    setState("sending")
    await subscribeNewsletter({ email, listId, parishId })
    setState("done")
  }

  return (
    <div className="grid items-center gap-6 md:grid-cols-[1fr_minmax(0,28rem)]">
      <div className="min-w-0">
        <h2 className="font-heading text-2xl text-ink">{s.newsletterTitle}</h2>
        <p className="mt-1.5 text-ink-600">{s.newsletterText}</p>
      </div>
      {state === "done" ? (
        <p role="status" className="flex items-center gap-2 rounded-2xl border border-blue-line bg-blue-wash px-4 py-3 text-blue-deep">
          <Check aria-hidden="true" className="size-4 shrink-0" />
          {s.newsletterDone}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="min-w-0">
          <label htmlFor="newsletter-email" className="sr-only">
            {s.newsletterEmail}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder={s.newsletterEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
              aria-describedby="newsletter-help"
              className="h-11 rounded-full bg-white px-4"
            />
            <Button type="submit" disabled={state === "sending"} className="sm:w-auto">
              {state === "sending" ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
              {s.newsletterSubscribe}
            </Button>
          </div>
          <p id="newsletter-help" className={error ? "mt-2 text-sm text-destructive" : "mt-2 text-xs text-ink-500"}>
            {error || s.newsletterVia}
          </p>
        </form>
      )}
    </div>
  )
}
