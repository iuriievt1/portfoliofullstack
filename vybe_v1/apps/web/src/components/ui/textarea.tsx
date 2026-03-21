import { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm transition focus:border-accent",
        className
      )}
      {...props}
    />
  );
}

