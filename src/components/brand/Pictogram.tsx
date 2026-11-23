import type { ReactNode } from "react"
import { Mail, Utensils } from "lucide-react"
import { OrthodoxCrossGroup } from "./OrthodoxCross"

/*
  Orthodox line pictograms on a 24 x 24 grid. Every cross inside them comes
  from OrthodoxCrossGroup so there is exactly one cross drawing in the site.
  Pictograms are never mirrored for right-to-left languages.
*/

export type PictogramName =
  | "church"
  | "chalice"
  | "censer"
  | "candle"
  | "prayer-rope"
  | "gospel"
  | "icon-frame"
  | "bells"
  | "cross"
  | "lampada"
  | "slip"
  | "font"
  | "analogion"
  | "chrism"
  | "crowns"
  | "unction"
  | "holy-water"
  | "kanun"
  | "utensils"
  | "mail"

const flame = (cx: number, top: number, h = 2.6) =>
  `M${cx} ${top} C${cx + h * 0.45} ${top + h * 0.45} ${cx + h * 0.45} ${top + h * 0.8} ${cx} ${top + h} C${cx - h * 0.45} ${top + h * 0.8} ${cx - h * 0.45} ${top + h * 0.45} ${cx} ${top} Z`

const drawings: Record<string, ReactNode> = {
  church: (
    <>
      <path d="M3 21H21" />
      <path d="M5 21V13.2H19V21" />
      <path d="M4.2 13.2H19.8" />
      <path d="M9 13.2V9.6H15V13.2" />
      <path d="M9 9.6C8 8 9.2 6.6 10.6 5.8C11.4 5.3 11.8 4.9 12 4.4C12.2 4.9 12.6 5.3 13.4 5.8C14.8 6.6 16 8 15 9.6Z" />
      <path d="M10.6 21V17.6A1.4 1.4 0 0 1 13.4 17.6V21" />
      <path d="M6.8 16V18M17.2 16V18" />
      <OrthodoxCrossGroup cx={12} y={0.6} height={3.9} />
    </>
  ),
  chalice: (
    <>
      <path d="M6.5 3.8H17.5C17.5 8.4 15.2 11 12 11C8.8 11 6.5 8.4 6.5 3.8Z" />
      <path d="M12 11V16.4" />
      <circle cx="12" cy="13.6" r="0.9" />
      <path d="M8 20.4C8.5 17.6 10 16.4 12 16.4C14 16.4 15.5 17.6 16 20.4Z" />
      <OrthodoxCrossGroup cx={12} y={4.8} height={4.4} />
    </>
  ),
  censer: (
    <>
      <circle cx="12" cy="2.6" r="0.9" />
      <path d="M11.6 3.4L7.8 10.4M12.4 3.4L16.2 10.4M12 3.5V7.4" />
      <path d="M8 10.4C8.4 8.2 15.6 8.2 16 10.4" />
      <path d="M7.4 10.8H16.6C16.6 14.4 14.6 16.4 12 16.4C9.4 16.4 7.4 14.4 7.4 10.8Z" />
      <path d="M10.6 16.4L10.2 18.6H13.8L13.4 16.4" />
      <path d="M19 12.5C20 11.6 18.4 10.6 19.4 9.6C20.4 8.6 18.8 7.6 19.8 6.6" />
    </>
  ),
  candle: (
    <>
      <path d={flame(12, 2.8, 4.2)} />
      <rect x="10.8" y="8.2" width="2.4" height="10.4" rx="0.5" />
      <path d="M7.5 18.6H16.5L15.6 20.6H8.4Z" />
    </>
  ),
  "prayer-rope": (
    <>
      {Array.from({ length: 13 }, (_, i) => {
        const angle = (90 + (i + 1) * (360 / 14)) * (Math.PI / 180)
        return <circle key={i} cx={(12 + 6 * Math.cos(angle)).toFixed(2)} cy={(9.4 + 6 * Math.sin(angle)).toFixed(2)} r="0.95" />
      })}
      <OrthodoxCrossGroup cx={12} y={15.6} height={4.6} />
      <path d="M11.3 20.4L10.9 23M12 20.4V23.2M12.7 20.4L13.1 23" />
    </>
  ),
  gospel: (
    <>
      <rect x="5.6" y="2.8" width="12.8" height="18.4" rx="1" />
      <path d="M7.6 2.8V21.2" />
      <circle cx="10" cy="5.4" r="0.7" />
      <circle cx="16" cy="5.4" r="0.7" />
      <circle cx="10" cy="18.6" r="0.7" />
      <circle cx="16" cy="18.6" r="0.7" />
      <OrthodoxCrossGroup cx={13} y={7.2} height={9.6} />
    </>
  ),
  "icon-frame": (
    <>
      <path d="M5.8 21.2V9C5.8 5.5 8.6 2.8 12 2.8C15.4 2.8 18.2 5.5 18.2 9V21.2Z" />
      <path d="M8 19.4V9.4C8 7 9.8 5 12 5C14.2 5 16 7 16 9.4V19.4Z" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M9.4 19.4Q12 13.4 14.6 19.4" />
    </>
  ),
  bells: (
    <>
      <path d="M4 21.2V9C4 5.6 7.6 3.4 12 3.4C16.4 3.4 20 5.6 20 9V21.2" />
      <path d="M4 9.2H20" />
      <path d="M6.6 15.2C6.6 12.2 7.4 10.4 8.6 10.4C9.8 10.4 10.6 12.2 10.6 15.2Z" />
      <path d="M13.4 15.2C13.4 12.2 14.2 10.4 15.4 10.4C16.6 10.4 17.4 12.2 17.4 15.2Z" />
      <path d="M6 15.2H11.2M12.8 15.2H18" />
      <circle cx="8.6" cy="16.4" r="0.6" />
      <circle cx="15.4" cy="16.4" r="0.6" />
      <path d="M2.8 21.2H21.2" />
      <OrthodoxCrossGroup cx={12} y={0} height={3.6} />
    </>
  ),
  cross: <OrthodoxCrossGroup cx={12} y={1.5} height={21} />,
  lampada: (
    <>
      <path d="M12 2V5.6M11.6 2.4L8.4 9.2M12.4 2.4L15.6 9.2" />
      <path d="M8 9.4H16C16 13.4 14.3 15.4 12 15.4C9.7 15.4 8 13.4 8 9.4Z" />
      <path d={flame(12, 6, 3)} />
      <path d="M12 15.4V17.8" />
      <circle cx="12" cy="18.8" r="0.9" />
    </>
  ),
  slip: (
    <>
      <path d="M6 2.6H18V21.4H6Z" />
      <OrthodoxCrossGroup cx={12} y={4} height={4.8} />
      <path d="M8.6 11.2H15.4M8.6 14H15.4M8.6 16.8H13.6" />
    </>
  ),
  font: (
    <>
      <path d="M4 9H20" />
      <path d="M4.6 9H19.4C19.4 13.2 16.2 15.6 12 15.6C7.8 15.6 4.6 13.2 4.6 9Z" />
      <path d="M7.4 11.2C8.4 10.6 9.4 11.8 10.4 11.2C11.4 10.6 12.4 11.8 13.4 11.2C14.4 10.6 15.4 11.8 16.4 11.2" />
      <path d="M10.6 15.6V19H13.4V15.6" />
      <path d="M8.4 21.2H15.6L14.8 19H9.2Z" />
      <path d="M6.6 9V6.2M12 9V6.2M17.4 9V6.2" />
      <path d={flame(6.6, 3.4, 2.2)} />
      <path d={flame(12, 3.4, 2.2)} />
      <path d={flame(17.4, 3.4, 2.2)} />
    </>
  ),
  analogion: (
    <>
      <path d="M7 10.2H17L16.2 21.2H7.8Z" />
      <path d="M7.4 12.6H16.6" />
      <rect x="8.2" y="7.2" width="7.6" height="3" rx="0.4" />
      <OrthodoxCrossGroup cx={12} y={1.6} height={5.4} />
    </>
  ),
  chrism: (
    <>
      <path d="M9 9.4C6.8 11 6.8 18.8 9.2 20.6H14.8C17.2 18.8 17.2 11 15 9.4Z" />
      <path d="M10.4 9.4V6.8H13.6V9.4" />
      <path d="M9.8 6.8C9.8 5 14.2 5 14.2 6.8Z" />
      <path d="M8.4 14.4H15.6" />
      <OrthodoxCrossGroup cx={12} y={1.2} height={3.6} />
    </>
  ),
  crowns: (
    <>
      <path d="M4 15.4C4 11.2 11 11.2 11 15.4" />
      <path d="M4 15.4H11V18H4Z" />
      <path d="M13 15.4C13 11.2 20 11.2 20 15.4" />
      <path d="M13 15.4H20V18H13Z" />
      <path d="M3 21H21" />
      <OrthodoxCrossGroup cx={7.5} y={7.6} height={4.6} />
      <OrthodoxCrossGroup cx={16.5} y={7.6} height={4.6} />
    </>
  ),
  unction: (
    <>
      <path d="M4.6 14H19.4C19.4 18 16.2 20.4 12 20.4C7.8 20.4 4.6 18 4.6 14Z" />
      {[6.6, 8.4, 10.2, 12, 13.8, 15.6, 17.4].map((x) => (
        <g key={x}>
          <path d={`M${x} 14V8.4`} />
          <path d={flame(x, 5.2, 2.2)} />
        </g>
      ))}
    </>
  ),
  "holy-water": (
    <>
      <path d="M3.6 11.6H16.4C16.4 15.6 13.8 17.8 10 17.8C6.2 17.8 3.6 15.6 3.6 11.6Z" />
      <path d="M8 17.8L7.6 20.2H12.4L12 17.8" />
      <path d="M14.4 9.8L20.2 3.4" />
      <path d="M13.2 11.2C12.6 10.4 13.6 9 14.6 9.6C15.4 10.2 14.6 11.8 13.2 11.2Z" />
      <circle cx="18.4" cy="9.4" r="0.6" />
      <circle cx="20" cy="11.6" r="0.6" />
      <OrthodoxCrossGroup cx={10} y={12.4} height={4.2} />
    </>
  ),
  kanun: (
    <>
      <path d="M3.4 13H20.6V15H3.4Z" />
      <path d="M5 15V21.2M19 15V21.2" />
      {[5.6, 7.8, 16.2, 18.4].map((x) => (
        <g key={x}>
          <path d={`M${x} 13V10`} />
          <path d={flame(x, 7.4, 2)} />
        </g>
      ))}
      <OrthodoxCrossGroup cx={12} y={2.4} height={10.6} />
    </>
  ),
}

interface PictogramProps {
  name: string
  size?: number
  className?: string
  title?: string
  strokeWidth?: number
}

export function Pictogram({ name, size = 24, className, title, strokeWidth = 1.35 }: PictogramProps) {
  if (name === "utensils") return <Utensils size={size} className={className} strokeWidth={strokeWidth} aria-hidden={!title} aria-label={title} />
  if (name === "mail") return <Mail size={size} className={className} strokeWidth={strokeWidth} aria-hidden={!title} aria-label={title} />
  const drawing = drawings[name] ?? drawings.church
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {drawing}
    </svg>
  )
}
