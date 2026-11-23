import { ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Item {
  id: string
  label: string
  text: string
  link?: { label: string; href: string }
}

export default function HeroNewcomer({ title, items }: { title: string; items: Item[] }) {
  if (items.length === 0) return null
  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-[var(--mission-shadow-soft)] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-6 bg-gold" />
        <h2 className="font-heading text-xl text-ink">{title}</h2>
      </div>
      <Tabs defaultValue={items[0].id} className="gap-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0 group-data-horizontal/tabs:h-auto">
          {items.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="h-auto flex-none rounded-full border border-border px-3.5 py-2 font-tradition text-[0.9rem] whitespace-normal text-ink-700 data-active:border-blue data-active:bg-blue data-active:text-white data-active:shadow-none"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {items.map((item) => (
          <TabsContent key={item.id} value={item.id} className="animate-in text-base duration-300 fade-in-0">
            <p className="leading-relaxed text-ink-700">{item.text}</p>
            {item.link ? (
              <a href={item.link.href} className="mt-3 inline-flex items-center gap-1.5 font-tradition text-[0.95rem] text-blue hover:text-blue-deep">
                {item.link.label}
                <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
              </a>
            ) : null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
