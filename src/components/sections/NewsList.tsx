import { useState } from "react"
import { PlaceholderArt } from "@/components/brand/PlaceholderArt"
import { FilterChips } from "./Gallery"

interface Post {
  id: string
  href: string
  date: string
  dateLabel: string
  category: string
  categoryLabel: string
  motif: string
  title: string
  excerpt: string
}

export default function NewsList({ posts, categories, s }: { posts: Post[]; categories: { id: string; label: string }[]; s: Record<string, string> }) {
  const [filter, setFilter] = useState("all")
  const visible = filter === "all" ? posts : posts.filter((p) => p.category === filter)
  const [lead, ...rest] = visible
  return (
    <div>
      <FilterChips label={s.filterLabel} value={filter} onChange={setFilter} options={[{ id: "all", label: s.all }, ...categories]} />
      {visible.length === 0 ? <p className="mt-8 text-ink-500">{s.noResults}</p> : null}
      {lead ? (
        <a href={lead.href} className="group mt-8 grid overflow-hidden rounded-[1.75rem] border border-border bg-white transition-shadow hover:shadow-[var(--mission-shadow-lift)] md:grid-cols-2">
          <div className="aspect-[16/10] md:aspect-auto md:min-h-[18rem]">
            <PlaceholderArt motif={lead.motif} tone="blue" alt={lead.title} label={s.sampleImage} iconSize="24%" />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <p className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
              <span className="rounded-full bg-blue-wash px-2.5 py-0.5 text-xs font-medium text-blue-deep">{lead.categoryLabel}</span>
              <time dateTime={lead.date}>{lead.dateLabel}</time>
            </p>
            <h2 className="mt-4 text-3xl leading-tight text-ink group-hover:text-blue-deep">{lead.title}</h2>
            <p className="mt-3 text-lg text-ink-600">{lead.excerpt}</p>
            <span className="mt-6 font-tradition text-blue">{s.readPost}</span>
          </div>
        </a>
      ) : null}
      {rest.length > 0 ? (
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((p) => (
            <li key={p.id} className="min-w-0">
              <a href={p.href} className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-white transition-shadow hover:shadow-[var(--mission-shadow-lift)]">
                <div className="aspect-[16/10]">
                  <PlaceholderArt motif={p.motif} tone="stone" alt={p.title} label={s.sampleImage} iconSize="28%" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
                    <span className="rounded-full bg-blue-wash px-2.5 py-0.5 text-xs font-medium text-blue-deep">{p.categoryLabel}</span>
                    <time dateTime={p.date}>{p.dateLabel}</time>
                  </p>
                  <h3 className="mt-3 text-xl leading-snug text-ink group-hover:text-blue-deep">{p.title}</h3>
                  <p className="mt-2 text-ink-600">{p.excerpt}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
