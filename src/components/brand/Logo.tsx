import { useId } from "react"
import { cn } from "@/lib/utils"
import { OrthodoxCross, OrthodoxCrossGroup } from "./OrthodoxCross"

export type LogoStyle = "wordmark" | "seal" | "kiot" | "square"

export interface LogoProps {
  style: LogoStyle
  name: string
  line1: string
  line2: string
  image?: string | null
  imageAlt?: string
  showCross?: boolean
  condensed?: boolean
  className?: string
}

function Wordmark({ line1, line2, showCross, condensed }: LogoProps) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      {showCross ? <OrthodoxCross size={condensed ? 26 : 28} className="shrink-0 text-blue" /> : null}
      <span className="flex min-w-0 flex-col justify-center">
        <span className={cn("font-tradition leading-[1.15] tracking-[0.02em] text-ink", condensed ? "text-[1.15rem]" : "text-[1.25rem] sm:text-[1.35rem]")}>
          {line1}
        </span>
        {line2 ? (
          <span className="mt-0.5 hidden min-w-0 items-center gap-2 sm:flex">
            <span aria-hidden="true" className="h-px w-3.5 shrink-0 bg-gold" />
            <span className="min-w-0 whitespace-nowrap font-tradition text-[0.68rem] leading-[1.4] tracking-[0.1em] text-ink-500 uppercase">
              {line2}
            </span>
          </span>
        ) : null}
      </span>
    </span>
  )
}

function Seal({ name, condensed }: LogoProps) {
  const size = condensed ? 40 : 44
  const id = `seal-${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="shrink-0 text-blue" aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="var(--mission-gold)" strokeWidth="0.8" />
      <defs>
        <path id={id} d="M50 50 m-41 0 a41 41 0 1 1 82 0 a41 41 0 1 1 -82 0" />
      </defs>
      <text style={{ fontFamily: "var(--font-role-ornament)", fontSize: 8.6, letterSpacing: 1.2 }} fill="currentColor">
        <textPath href={`#${id}`} startOffset="0">
          {name.toUpperCase()}
        </textPath>
      </text>
      <OrthodoxCrossGroup cx={50} y={30} height={40} />
    </svg>
  )
}

function Kiot({ image, imageAlt, condensed }: LogoProps) {
  return (
    <span
      className={cn(
        "kiot-arch flex shrink-0 items-center justify-center overflow-hidden border border-gold bg-blue-wash text-blue",
        condensed ? "h-10 w-8" : "h-11 w-9",
      )}
    >
      {image ? <img src={image} alt={imageAlt ?? ""} className="h-full w-full object-cover" /> : <OrthodoxCross size={condensed ? 20 : 24} />}
    </span>
  )
}

function Square({ image, imageAlt, condensed }: LogoProps) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white", condensed ? "size-9" : "size-10")}>
      {image ? <img src={image} alt={imageAlt ?? ""} className="h-full w-full object-contain" /> : <OrthodoxCross size={22} className="text-blue" />}
    </span>
  )
}

export function Logo(props: LogoProps) {
  const { style, className } = props
  if (style === "wordmark") {
    return (
      <span className={cn("inline-flex min-w-0", className)}>
        <Wordmark {...props} />
      </span>
    )
  }
  const Mark = style === "seal" ? Seal : style === "kiot" ? Kiot : Square
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <Mark {...props} />
      <Wordmark {...props} showCross={false} />
    </span>
  )
}
