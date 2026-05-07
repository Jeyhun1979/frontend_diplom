import { saveBookingDraft } from "../utils/bookingDraft";
import { useTicketStore } from "./index";

const PERSIST_KEYS = [
  "searchData",
  "searchParams",
  "selectedTrain",
  "selectedSeats",
  "returnTrain",
  "returnSeats",
  "passengers",
  "contacts",
  "paymentMethod",
  "order",
];

function pick(state) {
  const out = {};
  for (const k of PERSIST_KEYS) out[k] = state[k];
  return out;
}

export function setupTicketStorePersistence() {
  let timer = null;

  const unsub = useTicketStore.subscribe((state) => {
    const snapshot = pick(state);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      saveBookingDraft(snapshot);
    }, 250);
  });

  return () => {
    if (timer) clearTimeout(timer);
    unsub();
  };
}

