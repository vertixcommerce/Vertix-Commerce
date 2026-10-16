import { unstable_cache, revalidateTag } from "next/cache";

export const PUBLIC_CONTENT_TAG = "public-content-v2";
// Keep request APIs and error fallbacks outside this persistent cache.
export function readPublicContent<T>(keys: string[], load: () => Promise<T>): Promise<T> {
  return unstable_cache(load, [PUBLIC_CONTENT_TAG, ...keys], {
    tags: [PUBLIC_CONTENT_TAG], revalidate: 3600,
  })();
}

export function invalidatePublicContent(): void {
  revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 });
}
