import { getPayload, type SanitizedConfig } from "payload";
import { services, serviceGroups } from "../lib/content";

// Explicit one-time import; never runs on startup or after admin deletions.
// Existing service libraries and category customizations are left untouched.
export async function script(config: SanitizedConfig) {
  const payload = await getPayload({ config });
  const existing = await payload.count({ collection: "services" });
  if (existing.totalDocs > 0) {
    console.log("Existing service library retained. No starter items were imported.");
    return;
  }
  const categoryIDs = new Map<string, number>();
  for (const [index, group] of serviceGroups.entries()) {
    const result = await payload.find({ collection: "service-categories", where: { slug: { equals: group.slug } }, limit: 1 });
    const category = result.docs[0] || await payload.create({ collection: "service-categories", data: { name: group.name, slug: group.slug, enabled: true, displayOrder: (index + 1) * 10 } });
    categoryIDs.set(group.slug, category.id);
  }
  for (const [index, service] of services.entries()) {
    const category = categoryIDs.get(service.categorySlug);
    if (!category) throw new Error("Missing catalogue category.");
    await payload.create({ collection: "services", data: {
      name: service.title, slug: service.slug, shortDescription: service.text, category,
      status: /ebay/i.test(service.slug) ? "published" : "draft", _status: /ebay/i.test(service.slug) ? "published" : "draft", navigationVisible: true, locale: "en", assistantApproved: false,
      featured: service.featured === true, displayOrder: (index + 1) * 10,
    } });
  }
  console.log(`Imported ${services.length} editable services. Hide unwanted links in Services > Menu & homepage.`);
}

