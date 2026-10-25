import { after } from "next/server";
import { revalidatePath } from "next/cache";
import type { CollectionConfig, GlobalConfig } from "payload";
import { invalidatePublicContent } from "../lib/public-content-cache";

function refreshPublicContent({ req }: { req: { payload: { logger: { warn: (message: string) => void } } } }) {
  const invalidate = () => {
    try {
      invalidatePublicContent();
      // The sitemap is a prerendered metadata route. Its XML needs its own
      // path invalidation when a published page is added or changed.
      revalidatePath("/sitemap.xml");
    }
    catch { req.payload.logger.warn("Public content cache refresh unavailable; timed refresh will apply. This is expected in standalone CMS scripts."); }
  };
  // Payload afterChange runs before its transaction commits. Wait for the
  // response so another visitor cannot refill the cache from the old records.
  try { after(invalidate); }
  catch { invalidate(); }
}

export function withPublicCollectionCache(collection: CollectionConfig): CollectionConfig {
  return { ...collection, hooks: { ...collection.hooks,
    afterChange: [...(collection.hooks?.afterChange || []), refreshPublicContent],
    afterDelete: [...(collection.hooks?.afterDelete || []), refreshPublicContent],
  } };
}
export function withPublicGlobalCache(global: GlobalConfig): GlobalConfig {
  return { ...global, hooks: { ...global.hooks,
    afterChange: [...(global.hooks?.afterChange || []), refreshPublicContent],
  } };
}
