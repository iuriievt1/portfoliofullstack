export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    correlationId?: string;
    page?: number;
    pageSize?: number;
    total?: number;
  };
};

export type Role = "USER" | "ADMIN" | "SUPPORT" | "RISK_ANALYST" | "COMPLIANCE_OFFICER";
export type Currency = "CZK" | "EUR" | "USD";
export type TransferStatus = "PENDING_REVIEW" | "PROCESSING" | "POSTED" | "REJECTED" | "FAILED" | "REVERSED";
