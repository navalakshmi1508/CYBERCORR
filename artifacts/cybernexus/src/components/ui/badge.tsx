import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_10px_rgba(0,245,255,0.5)]",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive/20 text-destructive border-destructive/50 shadow-[0_0_10px_rgba(255,45,85,0.3)]",
        outline: "text-foreground",
        cyan: "border-transparent bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(0,245,255,0.3)]",
        blue: "border-transparent bg-accent/20 text-accent border-accent/50 shadow-[0_0_10px_rgba(0,102,255,0.3)]",
        gold: "border-transparent bg-[#ffd60a]/20 text-[#ffd60a] border-[#ffd60a]/50 shadow-[0_0_10px_rgba(255,214,10,0.3)]",
        green: "border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }