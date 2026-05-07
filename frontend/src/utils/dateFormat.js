export function ddmmyyyyToYyyyMmDd(value) {
  const v = (value || "").trim();
  const m = v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
}

