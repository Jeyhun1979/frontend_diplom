import { useEffect, useMemo, useState } from "react";
import directionRightIcon from "../../../assets/icons/direction-right.svg";
import trainCarriageIcon from "../../../assets/icons/train-carriage.svg";
import timeIcon from "../../../assets/icons/time.svg";
import sitIcon from "../../../assets/icons/sit.svg";
import platskartIcon from "../../../assets/icons/platskart.svg";
import cupeIcon from "../../../assets/icons/cupe.svg";
import luxIcon from "../../../assets/icons/lux.svg";
import coachTypeSittingIcon from "../../../assets/icons/coach-type-group.svg";
import coachTypeThirdIcon from "../../../assets/icons/coach-type-3.png";
import coachTypeSecondIcon from "../../../assets/icons/coach-type-2.png";
import coachTypeLuxIcon from "../../../assets/icons/coach-type-4.png";
import wifiIcon from "../../../assets/icons/wi-fi.svg";
import linenIcon from "../../../assets/icons/linen.svg";
import snowflakeIcon from "../../../assets/icons/snowflake.svg";
import expressIcon from "../../../assets/icons/express.svg";
import sittingPlatzkartSchemeImg from "../../../assets/images/seat-scheme-sitting-platzkart.png";
import luxSchemeImg from "../../../assets/images/seat-scheme-lux.png";
import coupeSchemeImg from "../../../assets/images/seat-scheme-coupe.png";
import { Seat } from "./Seat";
import "./SeatSelection.css";

function getCoachDisplayNumber(coach, index = 0) {
  const raw = coach?.coach_number ?? coach?.name ?? coach?.id ?? "";
  const text = String(raw ?? "").trim();
  const isNumeric = /^\d+$/.test(text);
  const num = isNumeric ? text : String(index + 1);
  return num.padStart(2, "0");
}

function getCoachTypeLabel(classType) {
  switch (classType) {
    case "first":
      return "Люкс";
    case "second":
      return "Купе";
    case "third":
      return "Плацкарт";
    case "fourth":
      return "Сидячий";
    default:
      return "Вагон";
  }
}

function getCoachTypeIcon(classType) {
  switch (classType) {
    case "first":
      return coachTypeLuxIcon ?? luxIcon;
    case "second":
      return coachTypeSecondIcon ?? cupeIcon;
    case "third":
      return coachTypeThirdIcon ?? platskartIcon;
    case "fourth":
      return coachTypeSittingIcon ?? sitIcon;
    default:
      return trainCarriageIcon;
  }
}

function getSeatKind(classType, seatNumber) {
  if (classType === "third") {
    if (seatNumber > 36) return "side";
    return seatNumber % 2 === 0 ? "top" : "bottom";
  }
  if (classType === "second") {
    return seatNumber % 2 === 0 ? "top" : "bottom";
  }
  if (classType === "first") return "bottom";
  if (classType === "fourth") return "sitting";
  return "unknown";
}

function getSeatPrice(coach, seatNumber) {
  const kind = getSeatKind(coach?.class_type, seatNumber);
  if (coach?.class_type === "first") return coach?.price ?? coach?.bottom_price ?? coach?.top_price ?? 0;
  if (coach?.class_type === "fourth") return coach?.bottom_price ?? coach?.top_price ?? coach?.price ?? 0;
  if (kind === "top") return coach?.top_price ?? coach?.price ?? 0;
  if (kind === "bottom") return coach?.bottom_price ?? coach?.price ?? 0;
  if (kind === "side") return coach?.side_price ?? coach?.price ?? 0;
  return coach?.price ?? 0;
}

function getCoachPrices(coach) {
  const top = Number(coach?.top_price ?? 0) || 0;
  const bottom = Number(coach?.bottom_price ?? 0) || 0;
  const side = Number(coach?.side_price ?? 0) || 0;
  const base = Number(coach?.price ?? 0) || 0;
  return {
    top: top || base,
    bottom: bottom || base,
    side: side || base,
  };
}

export function SeatSelection({
  onSelectSeats,
  maxSeats = 8,
  train = {},
  coaches = null,
}) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tickets, setTickets] = useState({ adult: 2, child: 1, baby: 0 });
  const coachList = Array.isArray(coaches) ? coaches : [];

  const availableTypes = useMemo(() => {
    const set = new Set(coachList.map((c) => c?.class_type).filter(Boolean));
    const order = ["fourth", "third", "second", "first"];
    return order.filter((t) => set.has(t));
  }, [coachList]);

  const wagonTypeOptions = useMemo(
    () => [
      { key: "fourth", label: getCoachTypeLabel("fourth"), icon: getCoachTypeIcon("fourth") },
      { key: "third", label: getCoachTypeLabel("third"), icon: getCoachTypeIcon("third") },
      { key: "second", label: getCoachTypeLabel("second"), icon: getCoachTypeIcon("second") },
      { key: "first", label: getCoachTypeLabel("first"), icon: getCoachTypeIcon("first") },
    ],
    [],
  );

  const [coachType, setCoachType] = useState(availableTypes[0] ?? "second");
  const filteredCoaches = useMemo(
    () => coachList.filter((c) => (coachType ? c?.class_type === coachType : true)),
    [coachList, coachType],
  );

  const [activeWagon, setActiveWagon] = useState(filteredCoaches[0]?._id ?? "");

  const coachButtons = useMemo(
    () =>
      filteredCoaches.map((c, idx) => ({
        id: c?._id,
        label: getCoachDisplayNumber(c, idx),
      })),
    [filteredCoaches],
  );

  const activeCoachLabel = useMemo(() => {
    const idx = filteredCoaches.findIndex((c) => c?._id === activeWagon);
    const coach = filteredCoaches[idx] ?? null;
    if (!coach) return "";
    return getCoachDisplayNumber(coach, idx >= 0 ? idx : 0);
  }, [filteredCoaches, activeWagon]);

  useEffect(() => {
    if (!availableTypes.includes(coachType)) {
      setCoachType(availableTypes[0] ?? "second");
    }
  }, [availableTypes, coachType]);

  useEffect(() => {
    if (!filteredCoaches.some((c) => c?._id === activeWagon)) {
      setActiveWagon(filteredCoaches[0]?._id ?? "");
    }
  }, [filteredCoaches, activeWagon]);

  const formatDuration = (durationStr) => {
    const match = durationStr.match(/(\d+)\s*часов?\s*(\d+)\s*минут?/i);
    if (match) {
      return {
        hours: `${match[1]} часов`,
        minutes: `${match[2]} минут`,
      };
    }
    return { hours: durationStr, minutes: "" };
  };

  const seatsByCoachId = useMemo(() => {
    const map = new Map();
    for (const coach of coachList) {
      const list = Array.isArray(coach?.seats) ? coach.seats : [];
      const seats = list.map((s) => ({
        id: `${coach._id}:${s.index}`,
        coachId: coach._id,
        number: s.index,
        isAvailable: !!s.available,
        kind: getSeatKind(coach.class_type, s.index),
        basePrice: getSeatPrice(coach, s.index),
      }));
      map.set(coach._id, seats);
    }
    return map;
  }, [coachList]);

  const getSeatsForCoach = (coachId) => seatsByCoachId.get(coachId) ?? [];

  const getSeatStatsForCoach = (coachId, classType) => {
    const seats = getSeatsForCoach(coachId);
    const byKind = { top: 0, bottom: 0, side: 0, sitting: 0 };
    for (const s of seats) {
      if (!s.isAvailable) continue;
      if (s.kind in byKind) byKind[s.kind] += 1;
    }
    if (classType === "fourth") {
      return { ...byKind, sitting: seats.filter((s) => s.isAvailable).length };
    }
    return byKind;
  };

  const totalPrice = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + (s.price ?? 0), 0),
    [selectedSeats],
  );

  useEffect(() => {
    onSelectSeats && onSelectSeats(selectedSeats);
  }, [onSelectSeats, selectedSeats]);

  const handleSeatClick = (seat) => {
    if (!seat.isAvailable) return;
    const key = `${seat.coachId}:${seat.number}`;
    const has = selectedSeats.some(
      (s) => `${s.coach_id}:${s.seat_number}` === key,
    );
    let next;
    if (has) {
      next = selectedSeats.filter(
        (s) => `${s.coach_id}:${s.seat_number}` !== key,
      );
    } else {
      if (selectedSeats.length >= maxSeats) {
        alert(`Максимум можно выбрать ${maxSeats} мест`);
        return;
      }
      const coach = coachList.find((c) => c?._id === seat.coachId);
      const base = coach ? getSeatPrice(coach, seat.number) : 0;
      const linensIncluded = !!coach?.is_linens_included;
      next = [
        ...selectedSeats,
        {
          coach_id: seat.coachId,
          seat_number: seat.number,
          coach_class_type: coach?.class_type,
          include_wifi: false,
          include_linens: linensIncluded,
          basePrice: base,
          price: base + (linensIncluded ? 0 : 0),
        },
      ];
    }
    setSelectedSeats(next);
  };

  const toggleService = (key, value) => {
    setSelectedSeats((prev) =>
      prev.map((s) => {
        if (`${s.coach_id}:${s.seat_number}` !== key) return s;
        const coach = coachList.find((c) => c?._id === s.coach_id);
        const linensIncluded = !!coach?.is_linens_included;
        const includeWifi = typeof value?.include_wifi === "boolean" ? value.include_wifi : s.include_wifi;
        const includeLinensRaw =
          typeof value?.include_linens === "boolean" ? value.include_linens : s.include_linens;
        const includeLinens = linensIncluded ? true : includeLinensRaw;

        const wifiAdd = includeWifi ? Number(coach?.wifi_price ?? 0) : 0;
        const linensAdd =
          includeLinens && !linensIncluded ? Number(coach?.linens_price ?? 0) : 0;
        const base = Number(s.basePrice ?? 0);

        return {
          ...s,
          include_wifi: includeWifi,
          include_linens: includeLinens,
          price: base + wifiAdd + linensAdd,
        };
      }),
    );
  };

  const getSeatsForScheme = (coachId) => {
    if (coachType !== "third" && coachType !== "second") return [];
    return getSeatsForCoach(coachId).filter((s) => s.number >= 1 && s.number <= 32);
  };

  const getSeatsForOverlay = (coachId) => {
    if (coachType !== "fourth" && coachType !== "first") return [];
    const list = getSeatsForCoach(coachId);
    const max = Math.max(...list.map((s) => s.number));
    return list.filter((s) => s.number >= 1 && s.number <= (Number.isFinite(max) ? max : 0));
  };

  const getOverlayCols = (seatsList) => {
    const max = Math.max(...(seatsList || []).map((s) => s.number));
    if (!Number.isFinite(max) || max <= 0) return 16;
    return Math.max(8, Math.ceil(max / 2));
  };

  const schemeImage = useMemo(() => {
    if (coachType === "third" || coachType === "fourth") return sittingPlatzkartSchemeImg;
    if (coachType === "second") return coupeSchemeImg;
    if (coachType === "first") return luxSchemeImg;
    return null;
  }, [coachType]);

  return (
    <div className="seat-selection">
      <div className="ss-header">
        <button
          className="ss-select-train-btn"
          type="button"
          onClick={() => window.history.back()}
        >
          <img src={directionRightIcon} alt="" className="ss-select-train-icon" />
          Выбрать другой поезд
        </button>
      </div>

      <div className="ss-train-info">
        <div className="ss-train-info__part part-1">
          <img
            src={trainCarriageIcon}
            alt="train"
            className="ss-train-icon-img"
          />
          <div className="ss-train-text">
            <div className="ss-train-number">{train.number}</div>
            <div className="ss-train-route">
              {train.from} → {train.to}
            </div>
          </div>
        </div>
        <div className="ss-train-info__part part-2">
          <div className="ss-time-block">
            <div className="ss-time">{train.departureTime}</div>
            <div className="ss-city">{train.from}</div>
            <div className="ss-station">
              {train?.raw?.departure?.from?.railway_station_name ?? ""}
            </div>
          </div>
          <img src={directionRightIcon} alt="arrow" className="ss-arrow-icon" />
          <div className="ss-time-block">
            <div className="ss-time">{train.arrivalTime}</div>
            <div className="ss-city">{train.to}</div>
            <div className="ss-station">
              {train?.raw?.departure?.to?.railway_station_name ?? ""}
            </div>
          </div>
        </div>
        <div className="ss-train-info__part part-3">
          <img src={timeIcon} alt="timeIcon" className="ss-time-icon" />
          <div className="ss-duration">
            <div className="duration-hours">
              {formatDuration(train.duration).hours}
            </div>
            <div className="duration-minutes">
              {formatDuration(train.duration).minutes}
            </div>
          </div>
        </div>
      </div>

      <div className="ss-tickets-title">Количество билетов</div>
      <div className="ss-tickets-row">
        <div className="ss-ticket-card">
          <select
            className="ss-ticket-select"
            value={tickets.adult}
            onChange={(e) =>
              setTickets((p) => ({ ...p, adult: Number(e.target.value) || 0 }))
            }
          >
            {Array.from({ length: maxSeats + 1 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                Взрослых — {n}
              </option>
            ))}
          </select>
          <div className="ss-ticket-hint">
            Можно добавить еще {Math.max(0, maxSeats - tickets.adult)} пассажиров
          </div>
        </div>
        <div className="ss-ticket-card">
          <select
            className="ss-ticket-select"
            value={tickets.child}
            onChange={(e) =>
              setTickets((p) => ({ ...p, child: Number(e.target.value) || 0 }))
            }
          >
            {Array.from({ length: maxSeats + 1 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                Детских — {n}
              </option>
            ))}
          </select>
          <div className="ss-ticket-hint">
            Можно добавить еще {Math.max(0, maxSeats - tickets.child)} пассажиров
          </div>
        </div>
        <div className="ss-ticket-card">
          <select
            className="ss-ticket-select"
            value={tickets.baby}
            onChange={(e) =>
              setTickets((p) => ({ ...p, baby: Number(e.target.value) || 0 }))
            }
          >
            {Array.from({ length: maxSeats + 1 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                Детских без места — {n}
              </option>
            ))}
          </select>
          <div className="ss-ticket-hint">
            Можно добавить еще {Math.max(0, maxSeats - tickets.baby)} пассажиров
          </div>
        </div>
      </div>

      <div className="ss-wagon-type-title">Тип вагона</div>
      <div className="ss-wagon-types">
        {wagonTypeOptions.map((opt) => {
          const isAvailable = availableTypes.includes(opt.key);
          const isActive = coachType === opt.key;
          return (
          <button
            key={opt.key}
            className={`${isActive ? "active" : ""} ${!isAvailable ? "disabled" : ""}`}
            onClick={() => {
              if (!isAvailable) return;
              setCoachType(opt.key);
            }}
            type="button"
            disabled={!isAvailable}
            aria-disabled={!isAvailable}
          >
            <img src={opt.icon} alt="" className="wagon-type-icon" />
            <span>{opt.label}</span>
          </button>
          );
        })}
      </div>

      {filteredCoaches.length > 1 ? (
        <div className="ss-wagons-multi">
          {filteredCoaches.map((coach, idx) => {
            const coachId = coach?._id;
            const label = getCoachDisplayNumber(coach, idx);
            const seats = getSeatsForCoach(coachId);
            const stats = getSeatStatsForCoach(coachId, coachType);
            const schemeSeats = getSeatsForScheme(coachId);
            const overlaySeats = getSeatsForOverlay(coachId);
            const overlayCols = getOverlayCols(overlaySeats);
            const prices = getCoachPrices(coach);
            const canWifi = Number(coach?.wifi_price ?? 0) > 0;
            const canLinens = !!coach?.is_linens_included || Number(coach?.linens_price ?? 0) > 0;
            const hasAc = Boolean(coach?.have_air_conditioning ?? coach?.is_air_conditioning ?? false);
            const isExpress = Boolean(coach?.is_express ?? false);
            const minPrice =
              Math.min(
                ...seats
                  .filter((s) => s.isAvailable && typeof s.basePrice === "number" && s.basePrice > 0)
                  .map((s) => s.basePrice),
              ) || 0;

            return (
              <div key={coachId ?? idx} className="ss-wagon-section">
                <div className="ss-wagon-bar">
                  <div className="ss-wagon-bar__left">
                    <div className="ss-wagon-bar__title">Вагоны</div>
                    <div className="ss-wagon-bar__nums">
                      {filteredCoaches.slice(0, 12).map((c, i) => {
                        const id = c?._id;
                        const num = getCoachDisplayNumber(c, i);
                        const active = id === coachId;
                        return (
                          <button
                            key={id ?? i}
                            type="button"
                            className={`ss-wagon-chip ${active ? "ss-wagon-chip--active" : ""}`}
                            onClick={() => setActiveWagon(id)}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="ss-wagon-bar__note">
                    Нумерация вагонов начинается с головы поезда
                  </div>
                </div>

                <div className="ss-wagon-info">
                  <div className="ss-wagon-number-block">
                    <div className="ss-wagon-number">
                      {label} <span>вагон</span>
                    </div>
                  </div>
                  <div className="ss-wagon-right">
                    <div className="ss-wagon-col ss-wagon-col--seats">
                      <div className="ss-wagon-seats-title">
                        Места {coach?.avaliable_seats ?? coach?.available_seats ?? 0}
                      </div>
                      <div className="ss-wagon-stats">
                        {coachType === "third" || coachType === "second" ? (
                          <>
                            <div>
                              Верхние <strong>{stats.top}</strong>
                            </div>
                            <div>
                              Нижние <strong>{stats.bottom}</strong>
                            </div>
                            {coachType === "third" ? (
                              <div>
                                Боковые <strong>{stats.side}</strong>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <div>
                            Свободно <strong>{seats.filter((s) => s.isAvailable).length}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ss-wagon-col ss-wagon-col--price">
                      <div className="price-label">Стоимость</div>
                      {coachType === "third" || coachType === "second" ? (
                        <div className="ss-price-rows">
                          <div className="ss-price-row">
                            <span>{coachType === "third" ? "Верхние" : "Верхние"}</span>
                            <strong>{prices.top.toLocaleString()} ₽</strong>
                          </div>
                          <div className="ss-price-row">
                            <span>{coachType === "third" ? "Нижние" : "Нижние"}</span>
                            <strong>{prices.bottom.toLocaleString()} ₽</strong>
                          </div>
                        </div>
                      ) : (
                        <div className="price-value">от {minPrice} ₽</div>
                      )}
                    </div>

                    <div className="ss-wagon-col ss-wagon-col--service">
                      <div className="service-label">Обслуживание</div>
                      <div className="service-icons">
                        {canWifi ? (
                          <span className="service-icon-box" title="Wi‑Fi">
                            <img src={wifiIcon} alt="" className="service-icon" />
                          </span>
                        ) : null}
                        {canLinens ? (
                          <span className="service-icon-box" title="Бельё">
                            <img src={linenIcon} alt="" className="service-icon" />
                          </span>
                        ) : null}
                        {hasAc ? (
                          <span className="service-icon-box" title="Кондиционер">
                            <img src={snowflakeIcon} alt="" className="service-icon" />
                          </span>
                        ) : null}
                        {isExpress ? (
                          <span className="service-icon-box" title="Экспресс">
                            <img src={expressIcon} alt="" className="service-icon" />
                          </span>
                        ) : null}
                      </div>
                      {hasAc ? <div className="service-text">кондиционер</div> : null}
                    </div>
                  </div>
                </div>

                {schemeImage && (coachType === "fourth" || coachType === "first") ? (
                  <div
                    className="ss-seats-scheme"
                    style={{ ["--ss-overlay-cols"]: overlayCols }}
                  >
                    <img src={schemeImage} alt="" className="ss-seats-image" />
                    <div className="ss-seats-overlay" aria-hidden="true">
                      {overlaySeats.map((seat) => {
                        const col = Math.ceil(seat.number / 2);
                        const row = seat.number % 2 === 0 ? 1 : 2;
                        return (
                          <Seat
                            key={seat.id}
                            seat={seat}
                            className="ss-seat-overlay ss-seat-overlay--ghost"
                            style={{ gridColumn: col, gridRow: row }}
                            isSelected={selectedSeats.some(
                              (s) =>
                                s.coach_id === seat.coachId && s.seat_number === seat.number,
                            )}
                            onSelect={handleSeatClick}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : schemeImage && (coachType === "third" || coachType === "second") && schemeSeats.length ? (
                  <div className="ss-seats-scheme">
                    <img src={schemeImage} alt="" className="ss-seats-image" />
                    <div className="ss-seats-overlay" aria-hidden="true">
                      {schemeSeats.map((seat) => {
                        const col = Math.ceil(seat.number / 2);
                        const row = seat.number % 2 === 0 ? 1 : 2;
                        return (
                          <Seat
                            key={seat.id}
                            seat={seat}
                            className="ss-seat-overlay"
                            style={{ gridColumn: col, gridRow: row }}
                            isSelected={selectedSeats.some(
                              (s) =>
                                s.coach_id === seat.coachId && s.seat_number === seat.number,
                            )}
                            onSelect={handleSeatClick}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="ss-seats-grid" role="list">
                    {seats.map((seat) => (
                      <Seat
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeats.some(
                          (s) => s.coach_id === seat.coachId && s.seat_number === seat.number,
                        )}
                        onSelect={handleSeatClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="ss-wagon-left">
            <div className="ss-wagons-switch">
              <span className="wagon-switch-label">Вагоны</span>
              <div className="wagon-switch-buttons">
                {coachButtons.map((c) => (
                  <button
                    key={c.id}
                    className={`wagon-switch-btn ${activeWagon === c.id ? "active" : ""}`}
                    onClick={() => setActiveWagon(c.id)}
                    type="button"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="ss-wagon-note">
              Нумерация вагонов
              <br />
              начинается с головы поезда
            </div>
          </div>

          {(() => {
            const coach = filteredCoaches[0] ?? null;
            const coachId = coach?._id ?? "";
            const seats = coachId ? getSeatsForCoach(coachId) : [];
            const stats = coachId ? getSeatStatsForCoach(coachId, coachType) : { top: 0, bottom: 0, side: 0, sitting: 0 };
            const schemeSeats = coachId ? getSeatsForScheme(coachId) : [];
            const overlaySeats = coachId ? getSeatsForOverlay(coachId) : [];
            const overlayCols = getOverlayCols(overlaySeats);
            const prices = getCoachPrices(coach);
            const canWifi = Number(coach?.wifi_price ?? 0) > 0;
            const canLinens = !!coach?.is_linens_included || Number(coach?.linens_price ?? 0) > 0;
            const hasAc = Boolean(coach?.have_air_conditioning ?? coach?.is_air_conditioning ?? false);
            const isExpress = Boolean(coach?.is_express ?? false);
            const minPrice =
              Math.min(
                ...seats
                  .filter(
                    (s) =>
                      s.isAvailable &&
                      typeof s.basePrice === "number" &&
                      s.basePrice > 0,
                  )
                  .map((s) => s.basePrice),
              ) || 0;

            return (
              <>
                <div className="ss-wagon-bar">
                  <div className="ss-wagon-bar__left">
                    <div className="ss-wagon-bar__title">Вагоны</div>
                    <div className="ss-wagon-bar__nums">
                      {coachButtons.slice(0, 12).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`ss-wagon-chip ${activeWagon === c.id ? "ss-wagon-chip--active" : ""}`}
                          onClick={() => setActiveWagon(c.id)}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="ss-wagon-bar__note">
                    Нумерация вагонов начинается с головы поезда
                  </div>
                </div>

                <div className="ss-wagon-info">
                  <div className="ss-wagon-number-block">
                    <div className="ss-wagon-number">
                      {activeCoachLabel || "—"} <span>вагон</span>
                    </div>
                  </div>
                  <div className="ss-wagon-right">
                    <div className="ss-wagon-col ss-wagon-col--seats">
                      <div className="ss-wagon-seats-title">
                        Места{" "}
                        {coach?.avaliable_seats ??
                          coach?.available_seats ??
                          0}
                      </div>
                      <div className="ss-wagon-stats">
                        {coachType === "third" || coachType === "second" ? (
                          <>
                            <div>
                              Верхние <strong>{stats.top}</strong>
                            </div>
                            <div>
                              Нижние <strong>{stats.bottom}</strong>
                            </div>
                            {coachType === "third" ? (
                              <div>
                                Боковые <strong>{stats.side}</strong>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <div>
                            Свободно{" "}
                            <strong>
                              {seats.filter((s) => s.isAvailable).length}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ss-wagon-col ss-wagon-col--price">
                      <div className="price-label">Стоимость</div>
                      {coachType === "third" || coachType === "second" ? (
                        <div className="ss-price-rows">
                          <div className="ss-price-row">
                            <span>Верхние</span>
                            <strong>{prices.top.toLocaleString()} ₽</strong>
                          </div>
                          <div className="ss-price-row">
                            <span>Нижние</span>
                            <strong>{prices.bottom.toLocaleString()} ₽</strong>
                          </div>
                        </div>
                      ) : (
                        <div className="price-value">от {minPrice} ₽</div>
                      )}
                    </div>

                    <div className="ss-wagon-col ss-wagon-col--service">
                      <div className="service-label">Обслуживание</div>
                      <div className="service-icons">
                        {canWifi ? (
                          <span className="service-icon-box" title="Wi‑Fi">
                            <img src={wifiIcon} alt="" className="service-icon" />
                          </span>
                        ) : null}
                        {canLinens ? (
                          <span className="service-icon-box" title="Бельё">
                            <img src={linenIcon} alt="" className="service-icon" />
                          </span>
                        ) : null}
                        {hasAc ? (
                          <span className="service-icon-box" title="Кондиционер">
                            <img src={snowflakeIcon} alt="" className="service-icon" />
                          </span>
                        ) : null}
                        {isExpress ? (
                          <span className="service-icon-box" title="Экспресс">
                            <img src={expressIcon} alt="" className="service-icon" />
                          </span>
                        ) : null}
                      </div>
                      {hasAc ? <div className="service-text">кондиционер</div> : null}
                    </div>
                  </div>
                </div>

                {schemeImage && (coachType === "fourth" || coachType === "first") ? (
                  <div
                    className="ss-seats-scheme"
                    style={{ ["--ss-overlay-cols"]: overlayCols }}
                  >
                    <img src={schemeImage} alt="" className="ss-seats-image" />
                    <div className="ss-seats-overlay" aria-hidden="true">
                      {overlaySeats.map((seat) => {
                        const col = Math.ceil(seat.number / 2);
                        const row = seat.number % 2 === 0 ? 1 : 2;
                        return (
                          <Seat
                            key={seat.id}
                            seat={seat}
                            className="ss-seat-overlay ss-seat-overlay--ghost"
                            style={{ gridColumn: col, gridRow: row }}
                            isSelected={selectedSeats.some(
                              (s) =>
                                s.coach_id === seat.coachId && s.seat_number === seat.number,
                            )}
                            onSelect={handleSeatClick}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : schemeImage &&
                  (coachType === "third" || coachType === "second") &&
                  schemeSeats.length ? (
                  <div className="ss-seats-scheme">
                    <img src={schemeImage} alt="" className="ss-seats-image" />
                    <div className="ss-seats-overlay" aria-hidden="true">
                      {schemeSeats.map((seat) => {
                        const col = Math.ceil(seat.number / 2);
                        const row = seat.number % 2 === 0 ? 1 : 2;
                        return (
                          <Seat
                            key={seat.id}
                            seat={seat}
                            className="ss-seat-overlay"
                            style={{ gridColumn: col, gridRow: row }}
                            isSelected={selectedSeats.some(
                              (s) =>
                                s.coach_id === seat.coachId &&
                                s.seat_number === seat.number,
                            )}
                            onSelect={handleSeatClick}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="ss-seats-grid" role="list">
                    {seats.map((seat) => (
                      <Seat
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeats.some(
                          (s) =>
                            s.coach_id === seat.coachId &&
                            s.seat_number === seat.number,
                        )}
                        onSelect={handleSeatClick}
                      />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
      <div className="ss-selected-info">
        {selectedSeats.length ? (
          <div>
            <div>
              Выбраны места:{" "}
              {selectedSeats
                .slice()
                .sort((a, b) => a.seat_number - b.seat_number)
                .map((s) => `${s.seat_number}`)
                .join(", ")}
            </div>
            <div>Итого: {totalPrice.toLocaleString()} ₽</div>
            <div className="selected-seats-list">
              {selectedSeats
                .slice()
                .sort((a, b) => a.seat_number - b.seat_number)
                .map((s) => {
                  const coach = coachList.find((c) => c?._id === s.coach_id);
                  const canWifi = Number(coach?.wifi_price ?? 0) > 0;
                  const linensIncluded = !!coach?.is_linens_included;
                  const canLinens = linensIncluded || Number(coach?.linens_price ?? 0) > 0;
                  const key = `${s.coach_id}:${s.seat_number}`;

                  return (
                    <div key={key} className="selected-seat-row">
                      <span>
                        Вагон {coach?.name ?? s.coach_id}, место {s.seat_number} —{" "}
                        {s.price?.toLocaleString?.() ?? s.price} ₽
                      </span>
                      <span className="selected-seat-services">
                        {canWifi ? (
                          <label>
                            <input
                              type="checkbox"
                              checked={!!s.include_wifi}
                              onChange={(e) =>
                                toggleService(key, { include_wifi: e.target.checked })
                              }
                            />
                            Wi‑Fi
                          </label>
                        ) : null}
                        {canLinens ? (
                          <label>
                            <input
                              type="checkbox"
                              checked={!!s.include_linens}
                              disabled={linensIncluded}
                              onChange={(e) =>
                                toggleService(key, { include_linens: e.target.checked })
                              }
                            />
                            Бельё
                          </label>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          "Места не выбраны"
        )}
      </div>
    </div>
  );
}
