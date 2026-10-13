"use client";
import { useState } from "react";
import { useDocumentInfo, useField } from "@payloadcms/ui";
export function NotificationRetry() {
  const { id } = useDocumentInfo();
  const { value, setValue } = useField<string>({ path: "notificationStatus" });
  const [pending, setPending] = useState(false), [message, setMessage] = useState("");
  if (!id || value === "sent") return null;
  async function retry() {
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/admin/notifications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: Number(id) }), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Retry unavailable.");
      setValue(result.status);
      setMessage(result.status === "sent" ? "Notification sent." : result.status === "not-configured" ? "Configure the verified email sender and notification inbox first." : "Delivery failed. Check the email provider configuration before retrying.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Retry unavailable."); }
    finally { setPending(false); }
  }
  return <div className="vx-notification-retry"><button type="button" onClick={retry} disabled={pending}>{pending ? "Sending…" : "Retry inbox notification"}</button><p role="status">{message || "Sends an inquiry reference only. Customer details and chat transcripts are not emailed."}</p></div>;
}
