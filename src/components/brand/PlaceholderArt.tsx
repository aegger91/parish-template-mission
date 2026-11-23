import { cn } from "@/lib/utils"
import { Pictogram } from "./Pictogram"

const tones: Record<string, { bg: string; ink: string }> = {
  blue: { bg: "linear-gradient(155deg, #e8eef6 0%, #c5d3e6 100%)", ink: "var(--mission-blue)" },
  stone: { bg: "linear-gradient(155deg, #f3eee4 0%, #d9cebc 100%)", ink: "var(--mission-slate-600)" },
  slate: { bg: "linear-gradient(155deg, #e8ecf1 0%, #c5ced9 100%)", ink: "var(--mission-slate-700)" },
  gold: { bg: "linear-gradient(155deg, #f7f0de 0%, #e2d2ad 100%)", ink: "#8a6a2e" },
}

interface PlaceholderArtProps {
  motif: string
  tone?: string
  src?: string | null
  alt: string
  label?: string
  className?: string
  iconSize?: string
  arch?: boolean
}

/** Photo slot for parish images. When src is set, the image is shown with one optional corner tag. */
export function PlaceholderArt({ motif, tone = "stone", src, alt, label, className, iconSize = "34%", arch = true }: PlaceholderArtProps) {
  if (src) {
    return (
      <div className={cn("relative isolate h-full w-full overflow-hidden", className)}>
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
        {label ? (
          <span className="pointer-events-none absolute start-2.5 bottom-2.5 rounded-md bg-ink/75 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-white uppercase backdrop-blur-sm">
            {label}
          </span>
        ) : null}
      </div>
    )
  }
  const t = tones[tone] ?? tones.stone
  return (
    <div role="img" aria-label={alt} className={cn("relative isolate flex h-full w-full items-center justify-center overflow-hidden", className)} style={{ background: t.bg }}>
      {arch ? (
        <div
          aria-hidden="true"
          className="kiot-arch absolute inset-x-[18%] top-[12%] bottom-[12%] border border-gold-line"
          style={{ borderBottomColor: "transparent" }}
        />
      ) : null}
      <div aria-hidden="true" className="absolute inset-x-[10%] bottom-[12%] h-px bg-gold-line" />
      <div className="relative flex aspect-square items-center justify-center" style={{ width: iconSize, color: t.ink }}>
        <Pictogram name={motif} size={96} strokeWidth={0.9} className="h-full w-full" />
      </div>
      {label ? (
        <span className="pointer-events-none absolute start-2.5 bottom-2.5 rounded-md bg-ink/75 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-white uppercase backdrop-blur-sm">
          {label}
        </span>
      ) : null}
    </div>
  )
}
