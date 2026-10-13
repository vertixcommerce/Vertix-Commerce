export function verifiedPassages(raw: string, docs: { id: string; title: string; body: string }[]) {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("passages" in parsed) || !Array.isArray(parsed.passages)) return "";
    return parsed.passages.slice(0, 3).flatMap((passage: unknown) => {
      if (!passage || typeof passage !== "object" || !("id" in passage) || !("quote" in passage) || typeof passage.quote !== "string") return [];
      const doc = docs.find(item => item.id === passage.id);
      const quote = passage.quote.trim();
      return doc && quote.length >= 10 && quote.length <= 600 && doc.body.includes(quote) ? [doc.title + ": " + quote] : [];
    }).join("\n\n").slice(0, 1900);
  } catch { return ""; }
}
