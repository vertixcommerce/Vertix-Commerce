"use client";
import { useFormFields } from "@payloadcms/ui";
import { AlertTriangle } from "lucide-react";
import { socialURL } from "@/lib/public-config";

export function SocialLinksHelp() {
  const fields = useFormFields(([fields]) => fields);
  const problems = Object.entries(fields).flatMap(([key, field]) => {
    const match = /^socialLinks\.(\d+)\.url$/.exec(key);
    if (!match || !field.value) return [];
    const platform = fields[`socialLinks.${match[1]}.platform`]?.value;
    return typeof platform === "string" && !socialURL(platform, field.value) ? [`Row ${Number(match[1]) + 1}: enter a complete HTTPS ${platform} profile URL. The icon is hidden until its destination matches the selected platform.`] : [];
  });
  if (!problems.length) return null;
  return <div role="status" className="vx-social-warning"><AlertTriangle size={20} aria-hidden="true"/><div><strong>Some social icons cannot be shown</strong>{problems.map(problem => <p key={problem}>{problem}</p>)}</div></div>;
}
