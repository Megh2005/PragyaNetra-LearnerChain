import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-cyan-500/30 bg-black/50 px-4 py-2 text-sm md:text-base text-white ring-offset-black file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-cyan-400 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-cyan-500/50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
