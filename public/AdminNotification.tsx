import React from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export type AdminNotificationTone = "loading" | "success" | "error" | "info";
export type AdminNotificationState = { tone: AdminNotificationTone; message: string };

export function AdminNotification({ notification, onDismiss }: { notification: AdminNotificationState; onDismiss: () => void }) {
  if (!notification.message) return null;
  const isLoading = notification.tone === "loading";
  const isSuccess = notification.tone === "success";
  const isError = notification.tone === "error";
  const Icon = isSuccess ? CheckCircle2 : isError ? CircleAlert : Info;
  return (
    <div role={isError ? "alert" : "status"} aria-live="polite" className={`fixed inset-x-4 top-4 z-[100] mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md sm:inset-x-auto sm:right-6 sm:left-auto ${isLoading ? "border-[#d4ad32]/50 bg-[#fff9df] text-[#77551d]" : isSuccess ? "border-[#2f7d59]/30 bg-[#e8f5ec] text-[#245b2b]" : isError ? "border-[#9c3d3d]/30 bg-[#fff0f0] text-[#7b263d]" : "border-[#16283f]/15 bg-white text-[#16283f]"}`}>
      {isLoading ? <Spinner className="size-5 shrink-0" /> : <Icon size={19} className="shrink-0" />}
      <p className="min-w-0 flex-1 text-sm font-bold leading-5">{notification.message}</p>
      {!isLoading && <Button type="button" onClick={onDismiss} variant="outline" className="h-8 shrink-0 rounded-full border-current bg-transparent px-3 text-xs font-black">OK</Button>}
      {isLoading && <X aria-label="Close" className="size-4 shrink-0 opacity-30" />}
    </div>
  );
}
