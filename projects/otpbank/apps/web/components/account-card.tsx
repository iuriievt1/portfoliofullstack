import { Badge, Card, CardContent } from "@otpbank/ui";

export function AccountCard({ account }: { account: any }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-slate-500">{account.nickname ?? "Account"}</div>
            <div className="mt-1 text-lg font-semibold text-slate-950">{account.iban}</div>
          </div>
          <Badge>{account.status}</Badge>
        </div>
        <div>
          <div className="text-3xl font-semibold tracking-tight text-slate-950">
            {(Number(account.availableBalanceMinor) / 100).toFixed(2)} {account.currency}
          </div>
          <div className="mt-1 text-xs text-slate-500">Ledger-backed available balance</div>
        </div>
      </CardContent>
    </Card>
  );
}
