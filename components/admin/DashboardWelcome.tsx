import type { AdminViewServerProps, CollectionSlug, Where } from "payload";
import { Gutter } from "@payloadcms/ui";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AdminIcon } from "./AdminIcon";
import { WorkspaceGroups } from "./WorkspaceGroups";
import { launchReadiness } from "@/lib/launch-readiness";

export async function DashboardWelcome({ initPageResult }: AdminViewServerProps) {
  const { req, permissions } = initPageResult;
  if (!req.user) return null;
  const { payload, user } = req;
  const canRead = (slug: CollectionSlug) => permissions.collections?.[slug]?.read === true;
  const count = async (slug: CollectionSlug, where?: Where) => {
    if (!canRead(slug)) return null;
    try { return (await payload.count({ collection: slug, where, user, overrideAccess: false, req })).totalDocs; }
    catch { return null; }
  };
  const [newLeads, published, waiting, knowledge] = await Promise.all([
    count("leads", { leadStatus: { equals: "new" } }),
    count("services", { status: { equals: "published" } }),
    count("conversations", { followUpRequired: { equals: true } }),
    count("knowledge", { and: [{ approved: { equals: true } }, { status: { equals: "published" } }] }),
  ]);
  let recent: { id: number | string; name: string; service: string; leadStatus: string; createdAt: string }[] = [];
  let leadsUnavailable = false;
  if (canRead("leads")) {
    try {
      const result = await payload.find({ collection: "leads", limit: 5, sort: "-createdAt", depth: 0, user, overrideAccess: false, req, select: { name: true, service: true, leadStatus: true, createdAt: true } });
      recent = result.docs;
    } catch { leadsUnavailable = true; }
  }
  const metrics = [
    { slug: "leads", label: "New inquiries", value: newLeads, hint: "Ready for your first response", icon: "inbox" },
    { slug: "services", label: "Published services", value: published, hint: "Managed in your content library", icon: "store" },
    { slug: "conversations", label: "Needs follow-up", value: waiting, hint: "Conversations flagged by your team", icon: "chat" },
    { slug: "knowledge", label: "Approved articles", value: knowledge, hint: "Published assistant knowledge", icon: "book" },
  ].filter(metric => canRead(metric.slug as CollectionSlug));
  const firstName = user.displayName?.split(" ")[0] || "there";
  let readiness: ReturnType<typeof launchReadiness> = [];
  if (user.roles.some(role => role === "owner" || role === "administrator")) {
    try {
      const website = await payload.findGlobal({ slug: "website-settings", user, overrideAccess: false, req });
      const approvedCount = async (locale: "en" | "de") => {
        const counts = await Promise.all((["knowledge", "services", "faqs"] as const).map(collection => payload.count({ collection, where: { and: [{ [collection === "knowledge" ? "approved" : "assistantApproved"]: { equals: true } }, { status: { equals: "published" } }, ...(collection === "faqs" ? [] : [{ _status: { equals: "published" } }]), { locale: { equals: locale } }] }, req })));
        return counts.reduce((sum, result) => sum + result.totalDocs, 0);
      };
      readiness = launchReadiness(website, await approvedCount("en"), await approvedCount("de"));
    } catch { /* Native collection editors remain available if diagnostics fail. */ }
  }
  return <Gutter className="vx-dashboard">
    <header className="vx-welcome">
      <div><span className="vx-eyebrow">YOUR COMMERCE WORKSPACE</span><h1>Welcome back, {firstName}.</h1><p>A clear view of your content, customers, and daily priorities.</p></div>
    </header>
    {metrics.length > 0 && <div className="vx-metrics">{metrics.map(metric => <div className="vx-metric" key={metric.slug}>
      <span className="vx-metric-top"><span>{metric.label}</span><span className="vx-icon"><AdminIcon name={metric.icon}/></span></span>
      <strong>{metric.value === null ? "—" : metric.value}</strong><small>{metric.value === null ? "Temporarily unavailable" : metric.hint}</small>
    </div>)}</div>}
    <div className="vx-dashboard-columns">
      <div className="vx-main-column">
        {canRead("leads") && <section className="vx-panel">
          <div className="vx-panel-heading"><div><h2>Recent inquiries</h2><p>Your five newest customer inquiries to review.</p></div><Link href="/admin/collections/leads">View all <ArrowRight size={15}/></Link></div>
          {leadsUnavailable ? <div className="vx-empty">Inquiries could not load. Open Customer inquiries to try again.</div> : recent.length ? <div className="vx-table-scroll"><table className="vx-table"><thead><tr><th>Customer</th><th>Service</th><th>Status</th><th>Received</th></tr></thead><tbody>{recent.map(lead => <tr key={lead.id}><td><Link href={"/admin/collections/leads/" + lead.id}>{lead.name}</Link></td><td>{lead.service}</td><td><span className={"vx-badge vx-badge--" + lead.leadStatus}>{lead.leadStatus.replaceAll("-", " ")}</span></td><td>{new Date(lead.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "short" })}</td></tr>)}</tbody></table></div> : <div className="vx-empty"><InboxIllustration/><h3>No inquiries yet</h3><p>Accepted website inquiries will appear here. You can then assign a follow-up status and add private notes.</p></div>}
        </section>}
        <WorkspaceGroups permissions={permissions} />
      </div>
      <aside className="vx-side-column">
        {readiness.length > 0 && <details className="vx-panel vx-checklist vx-dashboard-help"><summary><span className="vx-eyebrow">LAUNCH READINESS</span><h2>{readiness.filter(item => item.ready).length} / {readiness.length} configured</h2><span className="vx-help-toggle">View setup checklist</span></summary><p>Configuration checks only—not a live delivery or scheduler test. No secrets are displayed.</p><ul className="vx-readiness">{readiness.map(item => <li key={item.label}><span className={item.ready ? "vx-ready" : "vx-pending"}>{item.ready ? "✓" : "!"}</span><div><strong>{item.label}</strong><p>{item.ready ? "Configured" : "Setup or approval needed"}</p></div></li>)}</ul></details>}
        <details className="vx-panel vx-checklist vx-dashboard-help"><summary><span className="vx-eyebrow">QUICK GUIDE</span><h2>Make a website update</h2><span className="vx-help-toggle">View publishing steps</span></summary><ol><li><span>1</span><div><strong>Choose a section</strong><p>Open services, categories, countries, or FAQs.</p></div></li><li><span>2</span><div><strong>Edit and save</strong><p>Use the tabs to find content, visibility, and search settings.</p></div></li><li><span>3</span><div><strong>Publish when ready</strong><p>Review the content and set its publication status before publishing.</p></div></li><li><CheckCircle2 size={22}/><div><strong>Check your website</strong><p>Open the public page to confirm the result.</p></div></li></ol></details>
      </aside>
    </div>
  </Gutter>;
}
function InboxIllustration() { return <span className="vx-empty-icon"><AdminIcon name="inbox"/></span>; }
