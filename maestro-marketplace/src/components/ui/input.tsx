import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => {
    return <input ref={ref} type={type} className={cn("flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30", className)} {...props} />;
  }
);

Input.displayName = "Input";
