import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground bg-blue-600 text-white [a&]:hover:bg-primary/90 [a&]:hover:bg-blue-700",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white [a&]:hover:bg-secondary/90 [a&]:hover:bg-gray-200 dark:[a&]:hover:bg-gray-600",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground bg-red-600 text-white [a&]:hover:bg-destructive/90 [a&]:hover:bg-red-700 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-400/40",
        outline:
          "text-foreground border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white [a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:bg-gray-100 dark:[a&]:hover:bg-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
