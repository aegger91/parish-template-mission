import { cn } from "@/lib/utils"
import { Pictogram } from "./Pictogram"

const tones: Record<string, { bg: string; ink: string }> = {
  blue: { bg: "linear-gradient(155deg, #f3f6fb 0%, #e3eaf5 100%)", ink: "var(--mission-blue)" },
  stone: { bg: "linear-gradient(155deg, #faf9f6 0%, #ebe7de 100%)", ink: "var(--mission-slate-600)" },
  slate: { bg: "linear-gradient(155deg, #f1f3f6 0%, #dfe3ea 100%)", ink: "var(--mission-slate-700)" },
  gold: { bg: "linear-gradient(155deg, #fcf9f2 0%, #f1e8d4 100%)", ink: "#8a6a2e" },
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

/** Drawn stand-in for parish photos. When src is set, the real image is shown instead. */
export function PlaceholderArt({ motif, tone = "stone", src, alt, label, className, iconSize = "34%", arch = true }: PlaceholderArtProps) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />
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
        <span className="absolute start-2.5 bottom-2.5 rounded-full bg-white/80 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-ink-500 uppercase backdrop-blur-sm">
          {label}
        </span>
      ) : null}
    </div>
  )
}
