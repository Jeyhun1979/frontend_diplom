function pad2(n) {
  return String(n).padStart(2, "0");
}

export function secondsToTime(sec) {
  const d = new Date(sec * 1000);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function durationSecondsToText(sec) {
  const totalMin = Math.round(sec / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m} мин`;
  return `${h} ч ${m} мин`;
}

export function mapRouteToTrainCard(route) {
  const dep = route?.departure;
  const fromCity = dep?.from?.city?.name ?? "";
  const toCity = dep?.to?.city?.name ?? "";
  const number = dep?.train?.name ?? dep?.train?._id ?? "";
  const departureTime = dep?.from?.datetime ? secondsToTime(dep.from.datetime) : "";
  const arrivalTime = dep?.to?.datetime ? secondsToTime(dep.to.datetime) : "";
  const duration = typeof dep?.duration === "number" ? durationSecondsToText(dep.duration) : "";

  const price = dep?.min_price ?? route?.min_price ?? 0;
  const freeSeats = dep?.available_seats ?? route?.available_seats ?? 0;
  const seatsInfo = dep?.available_seats_info ?? dep?.seats_info ?? null;
  const priceInfo = dep?.price_info ?? null;

  return {
    id: dep?._id,
    number,
    from: fromCity,
    to: toCity,
    departureTime,
    arrivalTime,
    duration,
    price,
    freeSeats,
    seatsInfo,
    priceInfo,
    raw: route,
  };
}

