export function richTextToPlainText(value: unknown): string {
  let visited = 0;
  function walk(node: unknown, depth: number): string {
    if (!node || typeof node !== "object" || depth > 24 || ++visited > 4096) return "";
    const item = node as { text?: unknown; children?: unknown[]; root?: unknown };
    if (typeof item.text === "string") return item.text;
    if (item.root) return walk(item.root, depth + 1);
    return Array.isArray(item.children) ? item.children.map(child => walk(child, depth + 1)).join(" ") : "";
  }
  return walk(value, 0).replace(/\s+/g, " ").trim().slice(0, 16000);
}
