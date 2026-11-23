import { useEffect, useRef, useState } from "react"
import { ChevronDown, Globe, Menu, ShoppingBag, X } from "lucide-react"
import { Logo, type LogoProps } from "@/components/brand/Logo"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cartCount, useCart } from "@/lib/cart"
import { fill } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface HeaderNavItem {
  id: string
  label: string
  href: string
  current: boolean
  desktop: boolean
  priority: "primary" | "secondary"
  placement: "link" | "button"
  overviewLabel?: string
  children: HeaderNavItem[]
}

export interface HeaderLanguage {
  code: string
  nativeName: string
  short: string
  href: string
  current: boolean
}

interface SiteHeaderProps {
  logo: LogoProps
  homeHref: string
  nav: HeaderNavItem[]
  languages: HeaderLanguage[]
  donate: { label: string; href: string } | null
  cartHref: string | null
  live: { label: string; href: string } | null
  dir: "ltr" | "rtl"
  s: Record<string, string>
}

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > threshold))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
    }
  }, [threshold])
  return scrolled
}

function DesktopDropdown({ item, s, className }: { item: HeaderNavItem; s: Record<string, string>; className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const panelId = `nav-panel-${item.id}`
  const entries: { label: string; href: string; current: boolean; depth: number }[] = []
  if (item.href) entries.push({ label: item.overviewLabel ?? item.label, href: item.href, current: item.current && !item.children.some((c) => c.current), depth: 0 })
  const walk = (children: HeaderNavItem[], depth: number) => {
    for (const child of children) {
      entries.push({ label: child.label, href: child.href, current: child.current, depth })
      walk(child.children, depth + 1)
    }
  }
  walk(item.children, 0)

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return
        window.clearTimeout(closeTimer.current)
        setOpen(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return
        closeTimer.current = window.setTimeout(() => setOpen(false), 160)
      }}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-full px-3 text-[0.94rem] text-ink-700 transition-colors hover:bg-stone-100 hover:text-ink",
          item.current && "text-blue-deep",
        )}
      >
        <span className={cn(item.current && "underline decoration-gold decoration-1 underline-offset-[10px]")}>{item.label}</span>
        <ChevronDown aria-hidden="true" className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute start-0 top-full z-50 pt-2"
      >
        <ul className="w-64 rounded-2xl border border-border bg-white p-2 shadow-[var(--mission-shadow-lift)]">
          {entries.map((entry, i) => (
            <li key={entry.href + i}>
              <a
                href={entry.href}
                aria-current={entry.current ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-[0.94rem] text-ink-700 transition-colors hover:bg-blue-wash hover:text-blue-deep",
                  entry.depth > 0 && "ps-7 text-[0.88rem]",
                  entry.current && "bg-blue-wash text-blue-deep",
                )}
              >
                {entry.label}
              </a>
              {i === 0 && item.href && entries.length > 1 ? <div aria-hidden="true" className="hairline-gold mx-3 my-1.5" /> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function TopLink({ item, className }: { item: HeaderNavItem; className?: string }) {
  return (
    <a
      href={item.href}
      aria-current={item.current ? "page" : undefined}
      className={cn(
        "inline-flex h-10 items-center rounded-full px-3 text-[0.94rem] text-ink-700 transition-colors hover:bg-stone-100 hover:text-ink",
        item.current && "text-blue-deep",
        className,
      )}
    >
      <span className={cn(item.current && "underline decoration-gold decoration-1 underline-offset-[10px]")}>{item.label}</span>
    </a>
  )
}

function MoreMenu({ items, s }: { items: HeaderNavItem[]; s: Record<string, string> }) {
  if (items.length === 0) return null
  const flat: HeaderNavItem = {
    id: "more",
    label: s.more,
    href: "",
    current: items.some((i) => i.current),
    desktop: true,
    priority: "primary",
    placement: "link",
    children: items,
  }
  return <DesktopDropdown item={flat} s={s} className="xl:hidden" />
}

function LanguageSwitcher({ languages, s, compact }: { languages: HeaderLanguage[]; s: Record<string, string>; compact?: boolean }) {
  if (languages.length <= 1) return null
  const current = languages.find((l) => l.current) ?? languages[0]
  if (languages.length <= 3) {
    return (
      <nav aria-label={s.language} className="flex items-center rounded-full border border-border bg-white p-0.5">
        {languages.map((l) => (
          <a
            key={l.code}
            href={l.href}
            hrefLang={l.code}
            lang={l.code}
            title={l.nativeName}
            aria-current={l.current ? "true" : undefined}
            className={cn(
              "inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded-full px-2.5 font-tradition text-[0.78rem] leading-none tracking-[0.08em] transition-colors",
              l.current ? "bg-ink text-white" : "text-ink-600 hover:bg-stone-100 hover:text-ink",
            )}
          >
            <span aria-hidden="true" className="whitespace-nowrap">
              {l.short}
            </span>
            <span className="sr-only">{l.nativeName}</span>
          </a>
        ))}
      </nav>
    )
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${s.language}: ${current.nativeName}`}
        className={cn(buttonVariants({ variant: "outline", size: compact ? "icon-sm" : "sm" }), "gap-1.5")}
      >
        <Globe aria-hidden="true" />
        {compact ? null : <span>{current.short}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((l) => (
          <DropdownMenuItem key={l.code} render={<a href={l.href} hrefLang={l.code} lang={l.code} />} className={cn(l.current && "font-semibold text-blue-deep")}>
            {l.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CartLink({ href, s }: { href: string; s: Record<string, string> }) {
  const lines = useCart()
  const count = cartCount(lines)
  return (
    <a
      href={href}
      aria-label={fill(s.cartCount, { n: count })}
      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "relative")}
    >
      <ShoppingBag aria-hidden="true" className="size-[1.15rem]" />
      {count > 0 ? (
        <span aria-hidden="true" className="absolute -end-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-blue px-1 text-[0.65rem] leading-4.5 font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </a>
  )
}

function DrawerGroup({ item }: { item: HeaderNavItem }) {
  const [open, setOpen] = useState(item.current)
  const id = `drawer-group-${item.id}`
  return (
    <li className="border-b border-border/70">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-start font-tradition text-[1.15rem] text-ink"
      >
        <span className="min-w-0">{item.label}</span>
        <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 text-ink-500 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <ul id={id} hidden={!open} className="mb-3 space-y-0.5 border-s border-gold-line ps-3">
        <li>
          <a href={item.href} aria-current={item.current && !item.children.some((c) => c.current) ? "page" : undefined} className="block rounded-lg px-3 py-2 text-[0.98rem] text-ink-700 aria-[current=page]:bg-blue-wash aria-[current=page]:text-blue-deep">
            {item.overviewLabel ?? item.label}
          </a>
        </li>
        {item.children.map((child) => (
          <li key={child.id}>
            <a href={child.href} aria-current={child.current ? "page" : undefined} className="block rounded-lg px-3 py-2 text-[0.98rem] text-ink-700 aria-[current=page]:bg-blue-wash aria-[current=page]:text-blue-deep">
              {child.label}
            </a>
            {child.children.length > 0 ? (
              <ul className="ms-3 border-s border-border ps-2">
                {child.children.map((g) => (
                  <li key={g.id}>
                    <a href={g.href} aria-current={g.current ? "page" : undefined} className="block rounded-lg px-3 py-1.5 text-[0.92rem] text-ink-600 aria-[current=page]:text-blue-deep">
                      {g.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </li>
  )
}

export default function SiteHeader({ logo, homeHref, nav, languages, donate, cartHref, live, dir, s }: SiteHeaderProps) {
  const scrolled = useScrolled()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const desktopItems = nav.filter((i) => i.desktop && i.placement !== "button")
  const secondary = desktopItems.filter((i) => i.priority === "secondary")

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-[var(--mission-header-h)] border-b bg-white transition-[border-color,box-shadow,background-color] duration-200",
        scrolled ? "border-border shadow-[0_8px_30px_-22px_rgb(28_36_48/0.45)]" : "border-transparent",
      )}
    >
      <div className="container-mission flex h-full items-center gap-3">
        <a href={homeHref} className="me-auto flex min-w-0 shrink items-center rounded-lg py-1" aria-label={`${logo.name}, ${s.homeLink}`}>
          <Logo {...logo} condensed={false} />
        </a>

        <nav aria-label={s.mainNav} className="hidden items-center lg:flex">
          <ul className="flex items-center gap-0.5">
            {desktopItems.map((item) => (
              <li key={item.id} className={cn(item.priority === "secondary" && "hidden xl:block")}>
                {item.children.length > 0 ? <DesktopDropdown item={item} s={s} /> : <TopLink item={item} />}
              </li>
            ))}
            {secondary.length > 0 ? (
              <li className="xl:hidden">
                <MoreMenu items={secondary} s={s} />
              </li>
            ) : null}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {live ? (
            <a href={live.href} className="hidden items-center gap-1.5 rounded-full border border-blue-line bg-blue-wash px-2.5 py-1 text-xs font-semibold text-blue-deep md:inline-flex lg:hidden 2xl:inline-flex">
              <span aria-hidden="true" className="relative inline-flex size-2 shrink-0 overflow-visible">
                <span className="absolute inset-0 animate-ping rounded-full bg-blue opacity-50 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-blue" />
              </span>
              {live.label}
            </a>
          ) : null}
          <div className="hidden md:block">
            <LanguageSwitcher languages={languages} s={s} />
          </div>
          {cartHref ? <CartLink href={cartHref} s={s} /> : null}
          {donate ? (
            <a href={donate.href} className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
              {donate.label}
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 px-3.5 lg:hidden")}
          >
            <Menu aria-hidden="true" />
            <span>{s.menu}</span>
          </button>
        </div>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          id="mobile-drawer"
          side={dir === "rtl" ? "left" : "right"}
          showCloseButton={false}
          className="w-[min(24rem,92vw)] max-w-none gap-0 overflow-y-auto bg-white p-0 data-[side=left]:sm:max-w-none data-[side=right]:sm:max-w-none"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <SheetTitle className="min-w-0">
              <Logo {...logo} condensed />
            </SheetTitle>
            <button type="button" onClick={() => setDrawerOpen(false)} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label={s.closeMenu}>
              <X aria-hidden="true" />
            </button>
          </div>
          <nav aria-label={s.mainNav} className="px-5">
            <ul>
              {nav.map((item) =>
                item.children.length > 0 ? (
                  <DrawerGroup key={item.id} item={item} />
                ) : (
                  <li key={item.id} className="border-b border-border/70">
                    <a
                      href={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className="block py-3.5 font-tradition text-[1.15rem] text-ink aria-[current=page]:text-blue-deep"
                    >
                      {item.label}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </nav>
          <div className="mt-auto space-y-4 px-5 py-6">
            {donate ? (
              <a href={donate.href} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                {donate.label}
              </a>
            ) : null}
            {languages.length > 1 ? (
              <div>
                <p className="eyebrow mb-2">{s.language}</p>
                <ul className="flex flex-wrap gap-2">
                  {languages.map((l) => (
                    <li key={l.code}>
                      <a
                        href={l.href}
                        hrefLang={l.code}
                        lang={l.code}
                        aria-current={l.current ? "true" : undefined}
                        className={cn(
                          "inline-flex h-10 items-center rounded-full border px-4 text-sm",
                          l.current ? "border-ink bg-ink text-white" : "border-border text-ink-700 hover:border-ink-300",
                        )}
                      >
                        {l.nativeName}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
