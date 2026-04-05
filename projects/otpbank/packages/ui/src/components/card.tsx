import * as React from "react";

export function Card({ className = "", children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`border-b border-slate-100 px-6 py-4 ${className}`}>{children}</div>;
}

export function CardContent({ className = "", children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}
