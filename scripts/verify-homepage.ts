import assert from "node:assert/strict";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getPayload, type SanitizedConfig, type Where } from "payload";
import { sqliteAdapter, type SQLiteAdapter } from "@payloadcms/db-sqlite";
import sharp from "sharp";
import config from "../payload.config";

// Run saves against a brand-new isolated DB, never the user's working homepage.
export const script = async () => {
  assert(!process.env.S3_BUCKET && !process.env.GEMINI_API_KEY && !process.env.RESEND_API_KEY, "Run this offline test without external provider/storage keys.");
  const temporary = await mkdtemp(path.join(os.tmpdir(), "vertix-homepage-qa-"));
  let payload: Awaited<ReturnType<typeof getPayload>> | undefined;
  let checks = 0;
  const passed = (label: string) => { checks++; console.log(`PASS ${label}`); };
  try {
    const base = await config;
    const isolated: SanitizedConfig = { ...base, db: { ...sqliteAdapter({ client: { url: "file::memory:" } }), allowIDOnCreate: false, name: "sqlite" },
      collections: base.collections.map(collection => collection.slug === "media" ? { ...collection, upload: { ...collection.upload, staticDir: path.join(temporary, "media") } } : collection) };
    payload = await getPayload({ config: isolated, key: `homepage-qa-${randomBytes(6).toString("hex")}` });
    const owner = await payload.create({ collection: "users", data: { displayName: "Fictional QA owner", email: "homepage-qa@example.invalid", password: randomBytes(24).toString("hex"), roles: ["owner"] } });
    const imageBytes = await sharp({ create: { width: 1800, height: 1200, channels: 3, background: "#0a64f0" } }).png().toBuffer();
    const media = await payload.create({ collection: "media", user: owner, overrideAccess: false, data: { alt: "Fictional QA image" }, file: { data: imageBytes, mimetype: "image/png", name: "fictional-homepage-qa.png", size: imageBytes.length } });
    assert.equal(media.mimeType, "image/webp");
    assert.equal(media.sizes?.mobile?.width, 640); assert.equal(media.sizes?.tablet?.width, 960); assert.equal(media.sizes?.desktop?.width, 1600);
    passed("authenticated upload, WebP conversion and three proportional responsive sizes");
    await assert.rejects(payload.create({ collection: "media", overrideAccess: false, data: { alt: "Forbidden" }, file: { data: imageBytes, mimetype: "image/png", name: "anonymous.png", size: imageBytes.length } }));
    passed("anonymous uploads denied");
    await assert.rejects(payload.create({ collection: "media", user: owner, overrideAccess: false, data: { alt: "Oversize" }, file: { data: imageBytes, mimetype: "image/png", name: "oversize.png", size: 5 * 1024 * 1024 } }));
    await assert.rejects(payload.create({ collection: "media", user: owner, overrideAccess: false, data: { alt: "Forbidden SVG" }, file: { data: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'), mimetype: "image/svg+xml", name: "forbidden.svg", size: 42 } }));
    passed("oversized images and unsafe formats denied");
    await payload.updateGlobal({ slug: "website-settings", user: owner, overrideAccess: false, data: {
      businessName: "Fictional QA", heroTitle: "Editable hero", heroLayout: "centered", heroMedia: { image: media.id, imageFit: "contain", imageRatio: "landscape", mobileImageRatio: "portrait", imagePositionX: 25 }, homepageLayoutMode: "custom",
      homepageSections: [{ blockType: "cta", sectionName: "First", heading: "First heading", buttons: [{ label: "Contact", url: "/contact" }] }, { blockType: "imageText", sectionName: "Second", enabled: false, image: media.id }],
    } });
    let saved = await payload.findGlobal({ slug: "website-settings", depth: 2 });
    assert.equal(saved.heroTitle, "Editable hero"); assert.equal(saved.heroLayout, "centered"); assert.equal(saved.heroMedia?.mobileImageRatio, "portrait");
    assert.equal(typeof saved.heroMedia?.image, "object"); assert.equal(saved.homepageSections?.[1].enabled, false);
    passed("hero settings and reusable blocks persist with populated media");
    await payload.updateGlobal({ slug: "website-settings", user: owner, overrideAccess: false, data: { homepageSections: [saved.homepageSections![1], { ...saved.homepageSections![0], sectionName: "Renamed section", heading: "Edited heading" }] } });
    saved = await payload.findGlobal({ slug: "website-settings" });
    assert.equal(saved.homepageSections?.[0].blockType, "imageText"); assert.equal(saved.homepageSections?.[1].sectionName, "Renamed section"); assert.equal(saved.homepageSections?.[1].heading, "Edited heading");
    passed("sections reorder and rename without losing hidden content");
    await assert.rejects(payload.updateGlobal({ slug: "website-settings", user: owner, overrideAccess: false, data: { homepageSections: [{ blockType: "cta", sectionName: "Unsafe", buttons: [{ label: "Bad", url: "javascript:alert(1)" }] }] } }));
    passed("unsafe section links rejected on save");
    await assert.rejects(payload.updateGlobal({ slug: "website-settings", overrideAccess: false, data: { heroTitle: "Unauthorized" } }));
    passed("unauthorized website edits denied");
    await payload.updateGlobal({ slug: "website-settings", user: owner, overrideAccess: false, data: { homepageSections: [] } });
    saved = await payload.findGlobal({ slug: "website-settings" });
    assert.equal(saved.homepageLayoutMode, "custom"); assert.deepEqual(saved.homepageSections, []);
    passed("manual section removal preserves intentional empty custom layout");
    await payload.updateGlobal({slug:"website-settings",user:owner,overrideAccess:false,data:{homepageLayoutMode:"reference",referenceHomepage:{markets:[{country:"germany",title:"Fictional QA market",image:media.id}],steps:[{title:"Fictional QA step"}],whyMedia:{image:media.id,mobileImageRatio:"portrait"},reviews:[{approved:false,name:"Fictional QA reviewer",quote:"Private QA feedback"}],extraNavigation:[{label:"QA section",url:"/#reviews"}]}}});
    saved=await payload.findGlobal({slug:"website-settings",depth:1});
    assert.equal(saved.homepageLayoutMode,"reference");
    assert.equal(saved.referenceHomepage?.markets?.[0].title,"Fictional QA market");
    assert.equal(typeof saved.referenceHomepage?.whyMedia?.image,"object");
    assert.equal(saved.referenceHomepage?.reviews?.[0].approved,false);
    assert.deepEqual(saved.homepageSections,[]);
    passed("reference design settings, SQL enum names, images and draft review approval persist without losing custom blocks");
    await payload.updateGlobal({slug:"website-settings",user:owner,overrideAccess:false,data:{referenceHomepage:{reviewsHeading:"QA review heading",reviews:[{name:"QA approved reviewer",quote:"Fictional consented QA feedback",approved:true,portrait:media.id,rating:5},{name:"QA draft reviewer",quote:"Private QA feedback",approved:false}]}}});
    saved=await payload.findGlobal({slug:"website-settings",depth:1});
    assert.equal(saved.referenceHomepage?.reviews?.[0].approved,true);
    assert.equal(typeof saved.referenceHomepage?.reviews?.[0].portrait,"object");
    assert.equal(saved.referenceHomepage?.reviews?.[1].approved,false);
    assert.equal(saved.referenceHomepage?.reviewsHeading,"QA review heading");
    passed("review approval, portrait, rating and editable heading persist under unchanged group paths");
    await payload.updateGlobal({slug:"website-settings",user:owner,overrideAccess:false,data:{referenceHomepage:{reviews:[saved.referenceHomepage!.reviews![1],saved.referenceHomepage!.reviews![0]]}}});
    saved=await payload.findGlobal({slug:"website-settings"});
    assert.equal(saved.referenceHomepage?.reviews?.[0].name,"QA draft reviewer");
    await payload.updateGlobal({slug:"website-settings",user:owner,overrideAccess:false,data:{referenceHomepage:{reviews:[],reviewsEnabled:false}}});
    saved=await payload.findGlobal({slug:"website-settings"});
    assert.deepEqual(saved.referenceHomepage?.reviews,[]);
    assert.equal(saved.referenceHomepage?.reviewsEnabled,false);
    assert.equal(saved.referenceHomepage?.reviewsHeading,"QA review heading");
    passed("reviews reorder, remove and hide without losing section headings");
    await payload.updateGlobal({slug:"website-settings",user:owner,overrideAccess:false,data:{referenceHomepage:{markets:[],steps:[],servicesEnabled:false}}});
    saved=await payload.findGlobal({slug:"website-settings"});
    assert.deepEqual(saved.referenceHomepage?.markets,[]);assert.deepEqual(saved.referenceHomepage?.steps,[]);assert.equal(saved.referenceHomepage?.servicesEnabled,false);
    passed("reference card removal and visibility switches persist");
    await payload.updateGlobal({ slug: "about-page", user: owner, overrideAccess: false, data: { heroTitle: "Fictional About hero", heroMedia: { image: media.id }, cardHeading: "Fictional introduction", meetingURL: "https://example.invalid/book" } });
    const about = await payload.findGlobal({ slug: "about-page", depth: 1 });
    assert.equal(about.heroTitle, "Fictional About hero"); assert.equal(typeof about.heroMedia?.image, "object");
    passed("About hero, image, booking and introduction settings persist");
    const content = { root: { type: "root", version: 1, format: "" as const, indent: 0, direction: null, children: [{ type: "paragraph", version: 1, children: [{ type: "text", version: 1, text: "Fictional isolated QA article." }] }] } };
    const draft = await payload.create({ collection: "articles", user: owner, overrideAccess: false, draft: true, data: { title: "Private article", slug: "private-article", excerpt: "Fictional draft", content, status: "draft" } });
    const published: Where = { and: [{ status: { equals: "published" } }, { _status: { equals: "published" } }] };
    assert.equal((await payload.find({ collection: "articles", overrideAccess: false, draft: false })).totalDocs, 0);
    passed("draft articles remain private");
    for (let i = 0; i < 13; i++) await payload.create({ collection: "articles", user: owner, overrideAccess: false, data: { title: `Fictional article ${i}`, slug: `fictional-article-${i}`, excerpt: "Isolated test", content, status: "published", _status: "published", coverImage: media.id } });
    const firstPage = await payload.find({ collection: "articles", overrideAccess: false, where: published, draft: false, page: 1, limit: 12, sort: "-publishedAt" });
    const secondPage = await payload.find({ collection: "articles", overrideAccess: false, where: published, draft: false, page: 2, limit: 12, sort: "-publishedAt" });
    assert.equal(firstPage.totalDocs, 13); assert.equal(firstPage.totalPages, 2); assert.equal(firstPage.docs.length, 12); assert.equal(secondPage.docs.length, 1); assert(firstPage.docs.every(article => article.publishedAt));
    passed("published article library expands into multiple pages without a catalogue cap");
    await payload.update({ collection: "articles", id: firstPage.docs[0].id, user: owner, overrideAccess: false, data: { title: "Edited published article" } });
    assert.equal((await payload.findByID({ collection: "articles", id: firstPage.docs[0].id })).title, "Edited published article");
    await assert.rejects(payload.update({ collection: "articles", id: draft.id, overrideAccess: false, data: { title: "Forbidden edit" } }));
    passed("article edits persist and anonymous edits are rejected");
    console.log(`Isolated homepage checks passed: ${checks}`);
  } finally {
    if (payload) { (payload.db as unknown as SQLiteAdapter).client.close(); await payload.destroy(); }
    const resolved = await realpath(temporary);
    const parent = await realpath(os.tmpdir());
    assert.equal(path.dirname(resolved), parent); assert(path.basename(resolved).startsWith("vertix-homepage-qa-"));
    await rm(resolved, { recursive: true, force: true });
    console.log("Removed only the isolated temporary QA database and generated images.");
  }
};
