"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/providers/session";

export function RequireTable({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { tableCode, sessionReady, sessionError } = useSession();

  useEffect(() => {
    if (sessionReady) return;

    // не редиректим мгновенно, пока provider ещё восстанавливает session
    if (!tableCode && sessionError) {
      router.replace("/table");
    }
  }, [sessionReady, tableCode, sessionError, router]);

  if (sessionReady) {
    return <>{children}</>;
  }

  // если реально нет table/session — тогда уже ведём на /table
  if (!tableCode && sessionError) {
    return (
      <div className="mx-auto max-w-md p-4">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
          <div className="text-sm font-semibold text-white">Table required</div>
          <div className="mt-2 text-xs text-white/70">Redirecting to table selection…</div>

          <button
            className="mt-3 w-full rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-black"
            onClick={() => router.replace("/table")}
          >
            Select table
          </button>
        </div>
      </div>
    );
  }

  // во время обычного перехода между вкладками ничего не мигает
  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-5">
      <div className="flex min-h-[40vh] items-start justify-center pt-10">
        <div className="flex flex-col items-center">
          <img
            src="/logo.svg"
            alt="Loft N8"
            className="h-12 w-12 animate-pulse opacity-90"
          />
          <div className="mt-3 text-sm font-medium text-white/85">Loading</div>
          <div className="mt-1 text-xs text-white/50">Restoring your table session…</div>
        </div>
      </div>
    </div>
  );
} 