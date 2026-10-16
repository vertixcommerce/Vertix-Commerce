# Public content performance

Published CMS data is shared through Next.js Data Cache for up to 3600 seconds. Public collection changes/deletes and global saves invalidate the shared tag after the CMS response, so a cache miss cannot read the previous uncommitted transaction. Draft filters remain in public queries. Temporary storage failures opt into request rendering rather than persisting a fallback page.

Home, About, Services and Meeting use the Full Route Cache with a one-hour refresh. Service/article detail pages opt into first-request ISR using an empty generateStaticParams result; new published slugs do not require a rebuild. Contact query parameters and blog pagination retain dynamic rendering while reusing public data.

Public navigation uses Next Link and its default browser Router Cache. Automatic link prefetch is disabled to avoid fetching every catalogue page. Layouts and previously visited static segments can be reused; browser back/forward uses Next navigation. An already-open tab can retain an older segment until its default cache period ends or the user refreshes. Server publishing invalidates server data/pages, not a remote browser's memory instantly. Dynamic browser pages retain the default zero stale time.

Only the public media upload collection sets public Cache-Control: browser 300s, shared cache 3600s, stale-while-revalidate 60s. Responsive image URLs include a version derived from the media update timestamp. Metadata and all other API responses default to private, no-store. Admin, inquiry submissions, chats, authentication and private records are never wrapped in public data caching.

The header receives only category names and service titles/slugs, rather than full service documents. The assistant UI is a separate lazy chunk and is not loaded when disabled; contact links remain available.

Calendly uses the same Inline embed parameters as its official widget without the extra loader script. Trusted origin-and-frame readiness messages remove the loading overlay when its event page is ready; iframe load remains a fallback. The scheduler is eager and uses early connections. Availability is not cached or proxied, no API token is used, and the requested direct booking link remains removed. Calendly/network response time remains outside this site's control.
