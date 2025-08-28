import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        fire: "border-transparent bg-fire-red text-white hover:bg-fire-red/80",
        rock: "border-transparent bg-electric-yellow text-void-black hover:bg-electric-yellow/80",
        mind_blown: "border-transparent bg-neon-purple text-white hover:bg-neon-purple/80",
        heart: "border-transparent bg-neon-pink text-white hover:bg-neon-pink/80",
        reputation: "border-transparent bg-gradient-to-r from-fire-red to-electric-yellow text-white",
        achievement: "border-2 border-golden-yellow bg-gradient-to-r from-lava-orange to-amber text-void-black",
      },
      size: {
        default: "h-5",
        sm: "h-4 text-xs",
        lg: "h-6 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }