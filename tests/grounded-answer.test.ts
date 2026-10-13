import { describe, expect, it } from "vitest";
import { verifiedPassages } from "@/lib/grounded-answer";
import { safeURL, socialURL } from "@/lib/public-config";
import { richTextToPlainText } from "@/lib/content-text";
describe("strict source grounding", () => {
  const docs = [{ id: "a", title: "Approved scope", body: "Listing support is included in the approved scope." }];
  it("accepts an exact approved passage", () => {
    expect(verifiedPassages(JSON.stringify({ passages: [{ id: "a", quote: docs[0].body }] }), docs)).toContain(docs[0].body);
  });
  it.each(["not JSON", '{"passages":[{"id":"a","quote":"We guarantee a 100% increase."}]}', '{"passages":[{"id":"unknown","quote":"Listing support is included in the approved scope."}]}', '{"passages":"bad"}'])("discards unverified output %s", raw => {
    expect(verifiedPassages(raw, docs)).toBe("");
  });
  it("extracts rich-text content without interpreting HTML", () => {
    expect(richTextToPlainText({ root: { children: [{ children: [{ text: "Approved scope" }, { text: " <script>not executable</script>" }] }] } })).toContain("Approved scope");
  });
});
describe("safe CMS links", () => {
  it.each(["javascript:alert(1)", "http://example.com", "//evil.example", "/\\evil.example", "/ bad", "https://user:password@example.com"])("rejects unsafe link %s", url => expect(safeURL(url, true)).toBe(""));
  it("allows local paths and HTTPS booking", () => {
    expect(safeURL("/contact?service=demo", true)).toBe("/contact?service=demo");
    expect(safeURL("https://example.com/book")).toBe("https://example.com/book");
  });
  it("does not label unrelated websites as social profiles", () => {
    expect(socialURL("facebook", "https://variosoft.us/page")).toBe("");
    expect(socialURL("facebook", "https://facebook.com.evil.example/page")).toBe("");
    expect(socialURL("linkedin", "https://www.linkedin.com/company/vertix")).toContain("linkedin.com");
  });
});
