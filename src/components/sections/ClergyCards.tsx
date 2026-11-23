import { useState } from "react"
import { ChevronDown, Mail, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

interface Person {
  id: string
  name: string
  role: string
  initials: string
  photo: string | null
  email?: string
  phone?: string
  summary: string
  bio: string[]
}

export default function ClergyCards({ people, s }: { people: Person[]; s: Record<string, string> }) {
  const [open, setOpen] = useState<string | null>(people[0]?.id ?? null)
  return (
    <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {people.map((p) => {
        const expanded = open === p.id
        const bioId = `bio-${p.id}`
        return (
          <li key={p.id} className="flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-stone-200/90 bg-paper p-2 shadow-[var(--mission-shadow-soft)]">
            <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-[1.1rem] border border-gold-line/50 bg-stone-50">
              {p.photo ? (
                <img src={p.photo} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span aria-hidden="true" className="font-tradition text-6xl tracking-[0.08em] text-blue/70">
                  {p.initials}
                </span>
              )}
              <span className="absolute start-2.5 bottom-2.5 rounded-md bg-ink/70 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-white uppercase backdrop-blur-sm">
                {s.replacePhoto}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="eyebrow">{p.role}</p>
              <h3 className="mt-2 text-2xl text-ink">{p.name}</h3>
              <p className="mt-2 text-ink-600">{p.summary}</p>
              <div id={bioId} hidden={!expanded} className="prose-mission mt-4 border-t border-border pt-4 leading-relaxed text-ink-700">
                {p.bio.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={bioId}
                  onClick={() => setOpen(expanded ? null : p.id)}
                  className="inline-flex items-center gap-1.5 font-tradition text-blue hover:text-blue-deep"
                >
                  {expanded ? s.hideBio : s.readBio}
                  <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform", expanded && "rotate-180")} />
                </button>
                {p.email ? (
                  <a href={`mailto:${p.email}`} className="inline-flex min-w-0 items-center gap-1.5 text-sm text-ink-600 hover:text-blue">
                    <Mail aria-hidden="true" className="size-4 shrink-0" />
                    <span className="break-all">{p.email}</span>
                  </a>
                ) : null}
                {p.phone ? (
                  <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-blue">
                    <Phone aria-hidden="true" className="size-4" />
                    {p.phone}
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
