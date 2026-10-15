import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const braces = require("braces");

describe("braces stack exhaustion mitigation", () => {
  it("keeps normal file patterns and ranges working", () => {
    expect(braces.expand("app/{about,blogs}/page.{ts,tsx}")).toEqual(["app/about/page.ts", "app/about/page.tsx", "app/blogs/page.ts", "app/blogs/page.tsx"]);
    expect(braces.expand("{1..3}")).toEqual(["1", "2", "3"]);
    expect(braces.compile("{a,b}")).toBe("(a|b)");
  });
  it.each(["compile", "expand", "stringify", "parse"])("rejects deeply nested input in %s before exhausting the stack", method => {
    const pattern = "{".repeat(4000) + "a,b" + "}".repeat(4000);
    expect(() => braces[method](pattern)).toThrow(/safe depth limit/);
  });
  it.each(["compile", "expand", "stringify"])("bounds direct AST traversal in %s", method => {
    const root = { type: "root", nodes: [] as unknown[] }; let node = root;
    for (let i=0;i<4000;i++) { const child={type:"brace",nodes:[] as unknown[]};node.nodes.push(child);node=child; }
    expect(() => braces[method](root)).toThrow(/safe depth limit/);
  });
});
