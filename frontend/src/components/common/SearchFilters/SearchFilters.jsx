import { useState, useEffect, useRef } from "react";
import cupeIcon from "../../../assets/icons/cupe.svg";
import platskartIcon from "../../../assets/icons/platskart.svg";
import sitIcon from "../../../assets/icons/sit.svg";
import luxIcon from "../../../assets/icons/lux.svg";
import wifiIcon from "../../../assets/icons/wi-fi.svg";
import expressIcon from "../../../assets/icons/express.svg";
import calendarIcon from "../../../assets/icons/calendar.svg";
import rightIcon from "../../../assets/icons/right.svg";
import leftIcon from "../../../assets/icons/left.svg";
import groupPlusIcon from "../../../assets/icons/group-plus.svg";
import { useTicketStore } from "../../../store";
import { ddmmyyyyToYyyyMmDd } from "../../../utils/dateFormat";
import { useDebounce } from "../../../hooks/useDebounce";
import "./SearchFilters.css";

function Calendar({ selectedDate, onSelect, onClose }) {
  const today = new Date(2024, 0, 1);
  const [monthOffset, setMonthOffset] = useState(0);

  const currentMonth = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1,
  );

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();
  const offset = (firstDay + 6) % 7;
  const cells = Array.from({ length: offset + daysInMonth }, (_, i) => {
    const day = i - offset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const handleDateSelect = (day) => {
    const dateString = `${String(day).padStart(2, "0")}.${String(currentMonth.getMonth() + 1).padStart(2, "0")}.${currentMonth.getFullYear()}`;
    onSelect(dateString);
    onClose();
  };

  return (
    <div className="calendar-modal">
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => setMonthOffset(monthOffset - 1)}>&lt;</button>
          <span>{monthNames[currentMonth.getMonth()]}</span>
          <button onClick={() => setMonthOffset(monthOffset + 1)}>&gt;</button>
        </div>
        <div className="calendar-grid">
          {weekDays.map((d) => (
            <div key={d} className="calendar-weekday">
              {d}
            </div>
          ))}
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} className="calendar-day calendar-day--empty" />;
            const dateString = `${String(day).padStart(2, "0")}.${String(currentMonth.getMonth() + 1).padStart(2, "0")}.${currentMonth.getFullYear()}`;
            const isSelected = selectedDate === dateString;
            return (
              <div
                key={`${day}-${idx}`}
                className={`calendar-day ${isSelected ? "selected" : ""}`}
                onClick={() => handleDateSelect(day)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SearchFilters({ onFilterChange }) {
  const searchData = useTicketStore((s) => s.searchData);
  const updateSearchData = useTicketStore((s) => s.updateSearchData);
  const searchParams = useTicketStore((s) => s.searchParams);
  const setSearchParams = useTicketStore((s) => s.setSearchParams);

  const [filters, setFilters] = useState({
    coupe: false,
    platzkart: false,
    sitting: false,
    lux: false,
    wifi: false,
    express: false,
  });

  const tripDate = searchData?.dateFrom ?? "";
  const returnDate = searchData?.dateTo ?? "";
  const [showTripCalendar, setShowTripCalendar] = useState(false);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);
  const PRICE_MIN = 1920;
  const PRICE_MAX = 7000;
  const [priceRange, setPriceRange] = useState({ from: PRICE_MIN, to: PRICE_MAX });

  const [departureTimeStart, setDepartureTimeStart] = useState(0);
  const [departureTimeEnd, setDepartureTimeEnd] = useState(24);
  const [arrivalTimeStart, setArrivalTimeStart] = useState(0);
  const [arrivalTimeEnd, setArrivalTimeEnd] = useState(24);

  const [returnDepartureTimeStart, setReturnDepartureTimeStart] = useState(0);
  const [returnDepartureTimeEnd, setReturnDepartureTimeEnd] = useState(24);
  const [returnArrivalTimeStart, setReturnArrivalTimeStart] = useState(0);
  const [returnArrivalTimeEnd, setReturnArrivalTimeEnd] = useState(24);

  const debouncedTimes = useDebounce(
    {
      departureTimeStart,
      departureTimeEnd,
      arrivalTimeStart,
      arrivalTimeEnd,
      returnDepartureTimeStart,
      returnDepartureTimeEnd,
      returnArrivalTimeStart,
      returnArrivalTimeEnd,
    },
    250,
  );

  const tripCalendarRef = useRef(null);
  const returnCalendarRef = useRef(null);
  const tripInputRef = useRef(null);
  const returnInputRef = useRef(null);

  const isParamsEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const av = a[k];
      const bv = b[k];
      const aHas = Object.prototype.hasOwnProperty.call(a, k);
      const bHas = Object.prototype.hasOwnProperty.call(b, k);
      if (!aHas && bv === undefined) continue;
      if (!bHas && av === undefined) continue;
      if (av !== bv) return false;
    }
    return true;
  };

  const applyParams = (
    patch = {},
    nextFilters = filters,
    nextPriceRange = priceRange,
    timesOverride = debouncedTimes,
  ) => {
    const times = patch.times ?? timesOverride;
    const next = { ...(searchParams ?? {}), offset: 0, ...patch };

    if (nextFilters.coupe) next.have_second_class = true;
    else delete next.have_second_class;

    if (nextFilters.platzkart) next.have_third_class = true;
    else delete next.have_third_class;

    if (nextFilters.sitting) next.have_fourth_class = true;
    else delete next.have_fourth_class;

    if (nextFilters.lux) next.have_first_class = true;
    else delete next.have_first_class;

    if (nextFilters.wifi) next.have_wifi = true;
    else delete next.have_wifi;

    if (nextFilters.express) next.have_express = true;
    else delete next.have_express;

    const priceFromNum = Number(nextPriceRange.from);
    const priceToNum = Number(nextPriceRange.to);
    if (Number.isFinite(priceFromNum) && priceFromNum > PRICE_MIN) next.price_from = priceFromNum;
    else delete next.price_from;
    if (Number.isFinite(priceToNum) && priceToNum < PRICE_MAX) next.price_to = priceToNum;
    else delete next.price_to;

    const setRange = (fromKey, toKey, from, to) => {
      if (from <= 0 && to >= 24) {
        delete next[fromKey];
        delete next[toKey];
        return;
      }
      if (typeof from === "number") next[fromKey] = from;
      if (typeof to === "number") next[toKey] = to;
    };

    setRange(
      "start_departure_hour_from",
      "start_departure_hour_to",
      times.departureTimeStart,
      times.departureTimeEnd,
    );
    setRange(
      "start_arrival_hour_from",
      "start_arrival_hour_to",
      times.arrivalTimeStart,
      times.arrivalTimeEnd,
    );
    setRange(
      "end_departure_hour_from",
      "end_departure_hour_to",
      times.returnDepartureTimeStart,
      times.returnDepartureTimeEnd,
    );
    setRange(
      "end_arrival_hour_from",
      "end_arrival_hour_to",
      times.returnArrivalTimeStart,
      times.returnArrivalTimeEnd,
    );

    const prev = searchParams ?? {};
    if (!isParamsEqual(prev, next)) {
      setSearchParams(next);
      onFilterChange && onFilterChange(next);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tripCalendarRef.current &&
        !tripCalendarRef.current.contains(event.target) &&
        tripInputRef.current &&
        !tripInputRef.current.contains(event.target)
      ) {
        setShowTripCalendar(false);
      }
      if (
        returnCalendarRef.current &&
        !returnCalendarRef.current.contains(event.target) &&
        returnInputRef.current &&
        !returnInputRef.current.contains(event.target)
      ) {
        setShowReturnCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    applyParams({ times: debouncedTimes });
  }, [debouncedTimes]);

  const options = [
    { id: "coupe", label: "Купе", icon: cupeIcon, disabled: false },
    {
      id: "platzkart",
      label: "Плацкарт",
      icon: platskartIcon,
      disabled: false,
    },
    { id: "sitting", label: "Сидячий", icon: sitIcon, disabled: false },
    { id: "lux", label: "Люкс", icon: luxIcon, disabled: false },
    { id: "wifi", label: "Wi-Fi", icon: wifiIcon, disabled: false },
    { id: "express", label: "Экспресс", icon: expressIcon, disabled: false },
  ];

  const handleToggle = (key, disabled) => {
    if (disabled) return;
    const updated = { ...filters, [key]: !filters[key] };
    setFilters(updated);
    applyParams({}, updated, priceRange, debouncedTimes);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : Number(value);
    const updated = { ...priceRange, [name]: numValue };
    setPriceRange(updated);
    applyParams({}, filters, updated, debouncedTimes);
  };

  const getPriceFill = () => {
    const min = 1920;
    const max = 7000;
    const fromPercent = ((priceRange.from - min) / (max - min)) * 100;
    const toPercent = ((priceRange.to - min) / (max - min)) * 100;
    return { fromPercent, toPercent };
  };

  const { fromPercent, toPercent } = getPriceFill();

  return (
    <div className="search-filters">
      <div className="search-filters__dates">
        <div className="date-block">
          <div className="date-label">Дата поездки</div>
          <div className="date-input-wrapper" ref={tripInputRef}>
            <input
              type="text"
              value={tripDate}
              readOnly
              className="date-input"
              placeholder="ДД.ММ.ГГГГ"
              onClick={() => setShowTripCalendar(true)}
              onKeyDown={(e) => {
                if (e.key !== "Backspace" && e.key !== "Delete") return;
                if (!tripDate) return;
                e.preventDefault();
                updateSearchData({ dateFrom: "" });
                applyParams({ date_start: undefined }, filters, priceRange, debouncedTimes);
              }}
            />
            {tripDate ? (
              <button
                type="button"
                className="date-clear"
                aria-label="Очистить дату"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  updateSearchData({ dateFrom: "" });
                  applyParams({ date_start: undefined }, filters, priceRange, debouncedTimes);
                }}
              >
                ×
              </button>
            ) : null}
            <img
              src={calendarIcon}
              alt="calendar"
              className="date-icon"
              onClick={() => setShowTripCalendar(true)}
            />
          </div>
          {showTripCalendar && (
            <div ref={tripCalendarRef}>
              <Calendar
                selectedDate={tripDate}
                onSelect={(d) => {
                  updateSearchData({ dateFrom: d });
                  applyParams(
                    d ? { date_start: ddmmyyyyToYyyyMmDd(d) } : { date_start: undefined },
                    filters,
                    priceRange,
                    debouncedTimes,
                  );
                }}
                onClose={() => setShowTripCalendar(false)}
              />
            </div>
          )}
        </div>
        <div className="date-block">
          <div className="date-label">Дата возвращения</div>
          <div className="date-input-wrapper" ref={returnInputRef}>
            <input
              type="text"
              value={returnDate}
              readOnly
              className="date-input"
              placeholder="ДД.ММ.ГГГГ"
              onClick={() => setShowReturnCalendar(true)}
              onKeyDown={(e) => {
                if (e.key !== "Backspace" && e.key !== "Delete") return;
                if (!returnDate) return;
                e.preventDefault();
                updateSearchData({ dateTo: "" });
                applyParams({ date_end: undefined }, filters, priceRange, debouncedTimes);
              }}
            />
            {returnDate ? (
              <button
                type="button"
                className="date-clear"
                aria-label="Очистить дату"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  updateSearchData({ dateTo: "" });
                  applyParams({ date_end: undefined }, filters, priceRange, debouncedTimes);
                }}
              >
                ×
              </button>
            ) : null}
            <img
              src={calendarIcon}
              alt="calendar"
              className="date-icon"
              onClick={() => setShowReturnCalendar(true)}
            />
          </div>
          {showReturnCalendar && (
            <div ref={returnCalendarRef}>
              <Calendar
                selectedDate={returnDate}
                onSelect={(d) => {
                  updateSearchData({ dateTo: d });
                  applyParams(
                    d ? { date_end: ddmmyyyyToYyyyMmDd(d) } : { date_end: undefined },
                    filters,
                    priceRange,
                    debouncedTimes,
                  );
                }}
                onClose={() => setShowReturnCalendar(false)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="search-filters__section">
        {options.map((opt) => (
          <div
            key={opt.id}
            className={`filter-row ${filters[opt.id] ? "active" : ""} ${opt.disabled ? "disabled" : ""}`}
          >
            <div className="filter-left">
              <div className="filter-icon-wrapper">
                <img
                  src={opt.icon}
                  alt={opt.label}
                  className="filter-icon-img"
                />
              </div>
              <span className="filter-label">{opt.label}</span>
            </div>
            <div
              className={`toggle ${filters[opt.id] ? "active" : ""} ${opt.disabled ? "disabled" : ""}`}
              onClick={() => handleToggle(opt.id, opt.disabled)}
            >
              <div className="toggle-circle" />
            </div>
          </div>
        ))}
      </div>

      <div className="search-filters__section">
        <h3 className="search-filters__title">Стоимость</h3>
        <div className="price-range-wrapper">
          <div className="price-inputs">
            <span className="price-label">от</span>
            <input
              type="number"
              name="from"
              value={priceRange.from}
              onChange={handlePriceChange}
              className="price-input"
            />
            <span className="price-label">до</span>
            <input
              type="number"
              name="to"
              value={priceRange.to}
              onChange={handlePriceChange}
              className="price-input"
            />
          </div>
          <div className="slider-container">
            <input
              type="range"
              name="from"
              min="1920"
              max="7000"
              value={priceRange.from}
              onChange={handlePriceChange}
              className="slider slider-from"
            />
            <input
              type="range"
              name="to"
              min="1920"
              max="7000"
              value={priceRange.to}
              onChange={handlePriceChange}
              className="slider slider-to"
            />
            <div className="slider-track">
              <div
                className="slider-fill"
                style={{
                  left: `${fromPercent}%`,
                  right: `${100 - toPercent}%`,
                }}
              />
            </div>
          </div>
          <div className="price-range-values">
            <span>1920</span>
            <span>4500</span>
            <span>7000</span>
          </div>
        </div>
      </div>

      <div className="search-filters__directions">
        <div className="direction-block">
          <div className="direction-header">
            <img src={rightIcon} alt="right" className="direction-icon-left" />
            <span>Туда</span>
            <img
              src={groupPlusIcon}
              alt="add"
              className="direction-icon-right"
            />
          </div>

          <div className="time-section">
            <div className="time-label">Время отбытия</div>
            <div className="time-range-wrapper">
              <div className="time-values">
                <span>{departureTimeStart}:00</span>
                <span>11:00</span>
                <span>{departureTimeEnd}:00</span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={departureTimeStart}
                  onChange={(e) =>
                    setDepartureTimeStart(Number(e.target.value))
                  }
                  className="slider slider-from"
                />
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={departureTimeEnd}
                  onChange={(e) => setDepartureTimeEnd(Number(e.target.value))}
                  className="slider slider-to"
                />
                <div className="slider-track">
                  <div
                    className="slider-fill"
                    style={{
                      left: `${(departureTimeStart / 24) * 100}%`,
                      right: `${100 - (departureTimeEnd / 24) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="time-section">
            <div className="time-label">Время прибытия</div>
            <div className="time-range-wrapper">
              <div className="time-values">
                <span>{arrivalTimeStart}:00</span>
                <span>11:00</span>
                <span>{arrivalTimeEnd}:00</span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={arrivalTimeStart}
                  onChange={(e) => setArrivalTimeStart(Number(e.target.value))}
                  className="slider slider-from"
                />
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={arrivalTimeEnd}
                  onChange={(e) => setArrivalTimeEnd(Number(e.target.value))}
                  className="slider slider-to"
                />
                <div className="slider-track">
                  <div
                    className="slider-fill"
                    style={{
                      left: `${(arrivalTimeStart / 24) * 100}%`,
                      right: `${100 - (arrivalTimeEnd / 24) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="direction-block">
          <div className="direction-header">
            <img src={leftIcon} alt="left" className="direction-icon-left" />
            <span>Обратно</span>
            <img
              src={groupPlusIcon}
              alt="add"
              className="direction-icon-right"
            />
          </div>

          <div className="time-section">
            <div className="time-label">Время отбытия</div>
            <div className="time-range-wrapper">
              <div className="time-values">
                <span>{returnDepartureTimeStart}:00</span>
                <span>11:00</span>
                <span>{returnDepartureTimeEnd}:00</span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={returnDepartureTimeStart}
                  onChange={(e) =>
                    setReturnDepartureTimeStart(Number(e.target.value))
                  }
                  className="slider slider-from"
                />
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={returnDepartureTimeEnd}
                  onChange={(e) =>
                    setReturnDepartureTimeEnd(Number(e.target.value))
                  }
                  className="slider slider-to"
                />
                <div className="slider-track">
                  <div
                    className="slider-fill"
                    style={{
                      left: `${(returnDepartureTimeStart / 24) * 100}%`,
                      right: `${100 - (returnDepartureTimeEnd / 24) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="time-section">
            <div className="time-label">Время прибытия</div>
            <div className="time-range-wrapper">
              <div className="time-values">
                <span>{returnArrivalTimeStart}:00</span>
                <span>11:00</span>
                <span>{returnArrivalTimeEnd}:00</span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={returnArrivalTimeStart}
                  onChange={(e) =>
                    setReturnArrivalTimeStart(Number(e.target.value))
                  }
                  className="slider slider-from"
                />
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={returnArrivalTimeEnd}
                  onChange={(e) =>
                    setReturnArrivalTimeEnd(Number(e.target.value))
                  }
                  className="slider slider-to"
                />
                <div className="slider-track">
                  <div
                    className="slider-fill"
                    style={{
                      left: `${(returnArrivalTimeStart / 24) * 100}%`,
                      right: `${100 - (returnArrivalTimeEnd / 24) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
