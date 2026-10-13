"use client";
import { useFormFields } from "@payloadcms/ui";
import { MessageSquareQuote } from "lucide-react";

export function ReviewsHelp() {
  const mode = useFormFields(([fields]) => fields.homepageLayoutMode?.value);
  return <div className="vx-settings-help"><MessageSquareQuote size={24} aria-hidden="true"/><div>
    <h3>What Our Clients Say</h3>
    <p>Add genuine feedback below, optionally upload a portrait and choose a rating. Check “Permission obtained and review approved” to publish the card, then Save changes.</p>
    {mode !== "reference" && <p role="status">These cards appear in the screenshot-style homepage. Select that layout in Brand &amp; homepage to display them. Your other layout content is preserved.</p>}
    <p>Unapproved cards stay hidden. Turn off “Show review section” to hide the entire section.</p>
  </div></div>;
}
