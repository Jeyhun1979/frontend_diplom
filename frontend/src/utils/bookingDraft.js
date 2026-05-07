const KEY = "booking_draft_v1";

export function saveBookingDraft(data) {
  const prev = getBookingDraft() ?? {};
  const next = { ...prev, ...data };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getBookingDraft() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearBookingDraft() {
  localStorage.removeItem(KEY);
}
