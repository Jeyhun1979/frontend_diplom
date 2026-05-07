export function splitByMatch(text, query) {
  const q = query.trim();
  if (!q) return [{ text, match: false }];

  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const idx = lower.indexOf(lowerQ);
  if (idx === -1) return [{ text, match: false }];

  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ].filter((p) => p.text.length > 0);
}

