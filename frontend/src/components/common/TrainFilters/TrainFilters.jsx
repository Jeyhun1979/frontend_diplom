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
import "./TrainFilters.css";

function Calendar({ selectedDate, onSelect, onClose }) {
  const today = new Date();
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

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
          {days.map((d) => {
            const dateString = `${String(d).padStart(2, "0")}.${String(currentMonth.getMonth() + 1).padStart(2, "0")}.${currentMonth.getFullYear()}`;
            const isSelected = selectedDate === dateString;
            return (
              <div
                key={d}
                className={`calendar-day ${isSelected ? "selected" : ""}`}
                onClick={() => handleDateSelect(d)}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TrainFilters({ onFilterChange }) {
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
  const [priceRange, setPriceRange] = useState({ from: 1920, to: 7000 });

  const tripCalendarRef = useRef(null);
  const returnCalendarRef = useRef(null);
  const tripInputRef = useRef(null);
  const returnInputRef = useRef(null);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    onFilterChange && onFilterChange(updated);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : Number(value);
    const updated = { ...priceRange, [name]: numValue };
    setPriceRange(updated);
    onFilterChange && onFilterChange({ ...filters, priceRange: updated });
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
            />
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
                  const next = {
                    ...(searchParams ?? {}),
                    ...(d ? { date_start: ddmmyyyyToYyyyMmDd(d) } : {}),
                    offset: 0,
                  };
                  setSearchParams(next);
                  onFilterChange &&
                    onFilterChange({ ...filters, priceRange, tripDate: d, returnDate });
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
            />
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
                  const next = {
                    ...(searchParams ?? {}),
                    ...(d ? { date_end: ddmmyyyyToYyyyMmDd(d) } : {}),
                    offset: 0,
                  };
                  setSearchParams(next);
                  onFilterChange &&
                    onFilterChange({ ...filters, priceRange, tripDate, returnDate: d });
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
            className={`filter-row
              ${filters[opt.id] ? "active" : ""}
              ${opt.disabled ? "disabled" : ""}
            `}
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
          <img src={rightIcon} alt="right" className="direction-icon-left" />
          <span>Туда</span>
          <img src={groupPlusIcon} alt="add" className="direction-icon-right" />
        </div>
        <div className="direction-block">
          <img src={leftIcon} alt="left" className="direction-icon-left" />
          <span>Обратно</span>
          <img src={groupPlusIcon} alt="add" className="direction-icon-right" />
        </div>
      </div>
    </div>
  );
}
