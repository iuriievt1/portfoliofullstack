import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const variants: Record<string, string> = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`} {...props} />
  );
}
