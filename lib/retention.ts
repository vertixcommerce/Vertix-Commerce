import type { Payload } from "payload";
export async function expirePrivateRecords(payload: Payload, dryRun = true, now = new Date()) {
  const expiry = { retentionExpiresAt: { less_than_equal: now.toISOString() } };
  const results: Record<string, number> = {};
  for (const collection of ["leads", "conversations"] as const) {
    if (dryRun) { results[collection] = (await payload.count({ collection, where: expiry })).totalDocs; continue; }
    // Bounded batches. Delete-time expiry predicate prevents removal of renewed records.
    const found = await payload.find({ collection, where: expiry, limit: 100, depth: 0 });
    if (!found.docs.length) { results[collection] = 0; continue; }
    const deleted = await payload.delete({ collection, where: { and: [expiry, { id: { in: found.docs.map(doc => doc.id) } }] } });
    results[collection] = deleted.docs.length;
  }
  return results;
}
