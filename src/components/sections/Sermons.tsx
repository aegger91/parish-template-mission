import { useMemo, useState } from "react"
import { BookOpen, Headphones, Search, Video } from "lucide-react"
import { OrthodoxCross } from "@/components/brand/OrthodoxCross"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { FilterChips } from "./Gallery"

interface Sermon {
  id: string
  date: string
  dateLabel: string
  speakerId: string
  speaker: string
  format: "audio" | "video" | "text"
  mediaUrl: string | null
  duration: string | null
  scripture: string
  title: string
  summary: string
  text: string[]
}

const icons = { audio: Headphones, video: Video, text: BookOpen }

export default function Sermons({ sermons, speakers, s }: { sermons: Sermon[]; speakers: { id: string; label: string }[]; s: Record<string, string> }) {
  const [format, setFormat] = useState("all")
  const [speaker, setSpeaker] = useState("all")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(sermons[0]?.id)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sermons.filter(
      (x) =>
        (format === "all" || x.format === format) &&
        (speaker === "all" || x.speakerId === speaker) &&
        (!q || `${x.title} ${x.scripture} ${x.summary} ${x.speaker}`.toLowerCase().includes(q)),
    )
  }, [sermons, format, speaker, query])

  const selected = sermons.find((x) => x.id === selectedId) ?? visible[0]
  const actionLabel = (f: Sermon["format"]) => (f === "audio" ? s.listen : f === "video" ? s.watch : s.read)

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="min-w-0 lg:order-2">
        {selected ? (
          <div className="sticky top-24 overflow-hidden rounded-[1.75rem] border border-border bg-white">
            <div className={cn("relative flex items-center justify-center bg-ink text-white/80", selected.format === "video" ? "aspect-video" : "h-40")}>
              <div aria-hidden="true" className="kiot-arch absolute inset-y-4 start-1/2 w-28 -translate-x-1/2 border border-white/15 rtl:translate-x-1/2" />
              {selected.mediaUrl && selected.format === "video" ? (
                <video src={selected.mediaUrl} controls className="absolute inset-0 h-full w-full" />
              ) : (
                <OrthodoxCross size={44} className="relative text-white/70" />
              )}
            </div>
            <div className="p-6">
              <p className="eyebrow">{s.nowPlaying}</p>
              <h3 className="mt-2 text-2xl leading-snug text-ink">{selected.title}</h3>
              <p className="mt-1 text-sm text-ink-500">
                {selected.speaker} · {selected.dateLabel} · {selected.scripture}
              </p>
              {selected.format === "audio" && selected.mediaUrl ? <audio src={selected.mediaUrl} controls className="mt-5 w-full" /> : null}
              {selected.format === "text" ? (
                <div className="prose-mission mt-5 max-h-80 overflow-y-auto leading-relaxed text-ink-700">
                  {selected.text.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <>
                  <p className="mt-4 text-ink-700">{selected.summary}</p>
                  {!selected.mediaUrl ? <p className="mt-4 rounded-xl bg-stone-100 px-4 py-3 text-sm text-ink-600">{s.mediaPlaceholder}</p> : null}
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="min-w-0 lg:order-1">
        <div className="space-y-4">
          <label className="relative block">
            <span className="sr-only">{s.sermonSearch}</span>
            <Search aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={s.sermonSearch} className="h-11 rounded-full bg-white ps-10" />
          </label>
          <FilterChips
            label={s.filterLabel}
            value={format}
            onChange={setFormat}
            options={(["all", "audio", "video", "text"] as const).map((f) => ({ id: f, label: s[`sermonFormat.${f}`] }))}
          />
          {speakers.length > 1 ? (
            <label className="flex flex-wrap items-center gap-3 text-sm text-ink-600">
              {s.sermonSpeaker}
              <select value={speaker} onChange={(e) => setSpeaker(e.target.value)} className="h-9 min-w-0 rounded-full border border-border bg-white px-3 text-ink">
                <option value="all">{s.allSpeakers}</option>
                {speakers.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        {visible.length === 0 ? <p className="mt-6 text-ink-500">{s.noResults}</p> : null}
        <ul className="mt-6 space-y-3">
          {visible.map((x) => {
            const Icon = icons[x.format]
            const active = selected?.id === x.id
            return (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(x.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-2xl border p-4 text-start transition-colors",
                    active ? "border-blue bg-blue-wash" : "border-border bg-white hover:border-ink-300",
                  )}
                >
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", active ? "bg-blue text-white" : "bg-stone-100 text-ink-700")}>
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-lg leading-snug text-ink">{x.title}</span>
                    <span className="mt-0.5 block text-sm text-ink-500">
                      {x.dateLabel} · {x.speaker}
                      {x.duration ? ` · ${x.duration}` : ""}
                    </span>
                    <span className="mt-1 block text-sm text-ink-600">{x.scripture}</span>
                  </span>
                  <span className="hidden shrink-0 self-center font-tradition text-sm text-blue sm:block">{actionLabel(x.format)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
