import { Card, CardContent } from "@otpbank/ui";

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-semibold tracking-tight text-slate-950">{value}</div>
        {hint ? <div className="text-xs text-slate-400">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}
