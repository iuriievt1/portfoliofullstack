import { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm transition focus:border-accent",
        className
      )}
      {...props}
    />
  );
}

