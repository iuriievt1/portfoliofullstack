"use client";

import { formatDate } from "@/lib/utils";
import type { NotificationRecord } from "@/types";

type NotificationsPanelProps = {
  notifications: NotificationRecord[];
  onOpenNotification: (notification: NotificationRecord) => Promise<void>;
};

export function NotificationsPanel({
  notifications,
  onOpenNotification
}: NotificationsPanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Notifikace</h3>
          <p className="mt-1 text-sm text-slate-500">Přijatá sdílení a nové události v portálu.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {notifications.filter((notification) => !notification.isRead).length} nepřečtených
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => void onOpenNotification(notification)}
            className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
              notification.isRead
                ? "border-slate-200 bg-white hover:bg-slate-50"
                : "border-teal-200 bg-teal-50 hover:bg-teal-100/70"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                {notification.sender ? (
                  <p className="mt-2 text-xs text-slate-400">
                    Odesílatel: {notification.sender.name} · ID {notification.sender.publicId}
                  </p>
                ) : null}
              </div>
              {!notification.isRead ? (
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-600" />
              ) : null}
            </div>
            <p className="mt-3 text-xs text-slate-400">{formatDate(notification.createdAt)}</p>
          </button>
        ))}

        {!notifications.length ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Zatím nemáte žádné notifikace.
          </div>
        ) : null}
      </div>
    </section>
  );
}
