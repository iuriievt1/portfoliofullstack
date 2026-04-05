import * as React from "react";

export function Badge({ className = "", children }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ${className}`}>{children}</span>;
}
