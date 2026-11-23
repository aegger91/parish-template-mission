import type { SVGProps } from "react"

/*
  The one cross used across the site. Eight-pointed (three-bar) Orthodox
  cross in a 40 x 56 box: titulus, main crossbar, and a slanted footrest
  whose end on the VIEWER'S LEFT is HIGHER (smaller y). Never mirror it,
  including in right-to-left layouts.
*/
const W = 40
const H = 56

function CrossShape() {
  return (
    <>
      <rect x="18" y="1" width="4" height="54" rx="0.6" />
      <rect x="12.5" y="8" width="15" height="3.2" rx="0.6" />
      <rect x="4" y="16.5" width="32" height="3.8" rx="0.6" />
      <polygon points="10,35.5 30,42 30,45.6 10,39.1" />
    </>
  )
}

function Inscription() {
  const text = { fontFamily: "var(--font-role-ornament)", fontSize: 6.4, textAnchor: "middle" as const, letterSpacing: 0.2 }
  return (
    <g aria-hidden="true">
      <text x="6.5" y="14.6" style={text}>IC</text>
      <text x="33.5" y="14.6" style={text}>XC</text>
      <rect x="3.2" y="7.4" width="6.6" height="0.8" />
      <rect x="30.2" y="7.4" width="6.6" height="0.8" />
      <text x="9" y="29.5" style={text}>NI</text>
      <text x="31" y="29.5" style={text}>KA</text>
    </g>
  )
}

interface CrossSvgProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number | string
  title?: string
  inscription?: boolean
}

export function OrthodoxCross({ size = 24, title, inscription = false, className, ...rest }: CrossSvgProps) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      height={size}
      width={typeof size === "number" ? (size * W) / H : undefined}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      style={{ transform: "none" }}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <CrossShape />
      {inscription ? <Inscription /> : null}
    </svg>
  )
}

/** The same cross placed inside another SVG. cx is the horizontal center, y the top edge. */
export function OrthodoxCrossGroup({ cx, y, height, fill = "currentColor" }: { cx: number; y: number; height: number; fill?: string }) {
  const scale = height / H
  return (
    <g transform={`translate(${cx - (W * scale) / 2} ${y}) scale(${scale})`} fill={fill} stroke="none">
      <CrossShape />
    </g>
  )
}
