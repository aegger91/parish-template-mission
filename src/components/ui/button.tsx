import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-transparent bg-clip-padding font-tradition text-[0.95rem] tracking-[0.03em] whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-blue text-white shadow-[0_1px_0_rgb(255_255_255/0.15)_inset] hover:bg-blue-deep",
        outline: "border-blue-line bg-white text-blue-deep hover:border-blue hover:bg-blue-wash aria-expanded:bg-blue-wash",
        secondary: "bg-stone-100 text-ink hover:bg-stone-200 aria-expanded:bg-stone-200",
        ghost: "text-ink-700 hover:bg-stone-100 hover:text-ink aria-expanded:bg-stone-100",
        gold: "border-gold-line bg-gold-wash text-ink hover:border-gold",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "rounded-none px-0 text-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        xs: "h-7 gap-1 px-2.5 text-xs",
        sm: "h-9 px-4 text-[0.875rem]",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
