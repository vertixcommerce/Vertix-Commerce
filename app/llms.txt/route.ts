import { getArticles } from "@/lib/editorial-content";
import { getSiteChrome } from "@/lib/site-content";
import { absoluteSiteURL } from "@/lib/site-url";

// Plain-language summary of the public site for AI assistants and other
// crawlers. Built from published CMS content so it never drifts from the pages.
export const revalidate = 3600;
export async function GET() {
  const [chrome, articles] = await Promise.all([getSiteChrome(), getArticles()]);
  const lines = [
    "# Vertix Commerce",
    "",
    "> Vertix Commerce is an ecommerce services agency. It provides store and account management for Amazon, eBay, Walmart and Shopify sellers: product listings, catalogue maintenance, advertising support, store content and day-to-day operations.",
    "",
    "Scope and pricing are agreed in writing before work begins. Marketplace fees, advertising spend and fulfilment charges are separate from management fees.",
    "",
    "## Services",
    ...chrome.services.map(service => `- [${service.title}](${absoluteSiteURL(`/services/${service.slug}`)}): ${service.text}`),
    "",
    "## Guides",
    ...articles.docs.map(article => `- [${article.title}](${absoluteSiteURL(`/blogs/${article.slug}`)}): ${article.excerpt}`),
    "",
    "## Company",
    `- [About Vertix Commerce](${absoluteSiteURL("/about")})`,
    `- [Contact and quotes](${absoluteSiteURL("/contact")})`,
    `- [Schedule a meeting](${absoluteSiteURL("/meeting")})`,
    ...(chrome.contact.email ? [`- Email: ${chrome.contact.email}`] : []),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
