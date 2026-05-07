import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../../ui/Container";
import mapIcon from "../../../assets/icons/map.svg";
import calendarIcon from "../../../assets/icons/calendar.svg";
import swapIcon from "../../../assets/icons/swap.svg";
import { CityAutocomplete } from "../../ui/CityAutocomplete/CityAutocomplete";
import { ddmmyyyyToYyyyMmDd } from "../../../utils/dateFormat";
import { useTicketStore } from "../../../store";
import "./BookingHeader.css";

function Calendar({ selectedDate, onSelect }) {
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

  return (
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
          const selected = selectedDate === dateString;
          return (
            <div
              key={`${day}-${idx}`}
              className={`calendar-day ${selected ? "selected" : ""}`}
              onClick={() => onSelect(dateString)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BookingHeader({
  activeStep = 1,
  initialData,
  onSearch,
  isSearching,
  searchProgress = 0,
}) {
  const navigate = useNavigate();
  const setSearchParams = useTicketStore((s) => s.setSearchParams);
  const setSearchData = useTicketStore((s) => s.setSearchData);
  const updateSearchData = useTicketStore((s) => s.updateSearchData);
  const storeSearchData = useTicketStore((s) => s.searchData);

  const fromCity = storeSearchData?.fromCity ?? null;
  const toCity = storeSearchData?.toCity ?? null;
  const dateFrom = storeSearchData?.dateFrom ?? "";
  const dateTo = storeSearchData?.dateTo ?? "";
  const [open, setOpen] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (initialData && (!storeSearchData || Object.keys(storeSearchData).length === 0)) {
      setSearchData(initialData);
    }
  }, [initialData, setSearchData, storeSearchData]);

  const handleSwap = () => {
    updateSearchData({ fromCity: toCity, toCity: fromCity });
  };

  const handleSearchClick = () => {
    if (!fromCity?._id || !toCity?._id) {
      alert("Выберите города из списка");
      return;
    }

    const searchData = {
      fromCity,
      toCity,
      dateFrom,
      dateTo,
    };

    const searchParams = {
      from_city_id: fromCity._id,
      to_city_id: toCity._id,
      ...(dateFrom ? { date_start: ddmmyyyyToYyyyMmDd(dateFrom) } : {}),
      ...(dateTo ? { date_end: ddmmyyyyToYyyyMmDd(dateTo) } : {}),
      limit: 5,
      offset: 0,
      sort: "date",
    };
    setSearchParams(searchParams);
    setSearchData(searchData);

    if (onSearch) {
      onSearch(searchData);
    } else {
      navigate("/search", { state: { searchData } });
    }
  };

  return (
    <header className="booking-header">
      <div className="booking-header__logo-wrapper">
        <Container>
          <div className="booking-header__logo">Лого</div>
        </Container>
      </div>

      <div className="booking-header__nav-bar">
        <Container className="booking-header__nav-inner">
          <div className="booking-header__nav-row">
            <nav className="booking-header__nav" aria-label="Навигация">
              <Link to="/#about">О нас</Link>
              <Link to="/#how-it-works">Как это работает</Link>
              <Link to="/#reviews">Отзывы</Link>
              <Link to="/#contacts">Контакты</Link>
            </nav>

            <button
              type="button"
              className="booking-header__burger"
              aria-label="Меню"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="booking-header__burger-bar" />
              <span className="booking-header__burger-bar" />
              <span className="booking-header__burger-bar" />
            </button>
          </div>

          {menuOpen ? (
            <div className="booking-header__mobile-menu" role="menu">
              <Link to="/#about" role="menuitem" onClick={() => setMenuOpen(false)}>
                О нас
              </Link>
              <Link
                to="/#how-it-works"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Как это работает
              </Link>
              <Link to="/#reviews" role="menuitem" onClick={() => setMenuOpen(false)}>
                Отзывы
              </Link>
              <Link
                to="/#contacts"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Контакты
              </Link>
            </div>
          ) : null}
        </Container>
      </div>

      <div className="booking-header__search">
        <Container className="booking-header__search-inner">
          <div className="booking-search-group ">
            <span className="booking-search-group__title">Направление</span>
            <div className="booking-search-group__row">
              <div className="input-with-icon">
                <CityAutocomplete
                  name="fromCity"
                  placeholder="Откуда"
                  value={fromCity}
                  onSelect={(city) => updateSearchData({ fromCity: city })}
                  required
                />
                <img
                  src={mapIcon}
                  className="input-icon"
                  alt=""
                  onClick={() => setOpen(open === "from" ? null : "from")}
                />
              </div>

              <button className="swap-btn" onClick={handleSwap}>
                <img src={swapIcon} alt="" className="swap-icon" />
              </button>

              <div className="input-with-icon">
                <CityAutocomplete
                  name="toCity"
                  placeholder="Куда"
                  value={toCity}
                  onSelect={(city) => updateSearchData({ toCity: city })}
                  required
                />
                <img
                  src={mapIcon}
                  className="input-icon"
                  alt=""
                  onClick={() => setOpen(open === "to" ? null : "to")}
                />
              </div>
            </div>
          </div>

          <div className="booking-search-group booking-search-group--date">
            <span className="booking-search-group__title">Дата</span>
            <div className="booking-search-group__row">
              <div className="input-with-icon">
                <input
                  value={dateFrom}
                  placeholder="Туда"
                  readOnly
                  onClick={() => setOpen(open === "dateFrom" ? null : "dateFrom")}
                  onKeyDown={(e) => {
                    if (e.key !== "Backspace" && e.key !== "Delete") return;
                    if (!dateFrom) return;
                    e.preventDefault();
                    updateSearchData({ dateFrom: "" });
                    setOpen(null);
                  }}
                />
                {dateFrom ? (
                  <button
                    type="button"
                    className="input-clear"
                    aria-label="Очистить дату"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSearchData({ dateFrom: "" });
                      setOpen(null);
                    }}
                  >
                    ×
                  </button>
                ) : null}
                <img
                  src={calendarIcon}
                  className="input-icon"
                  alt=""
                  onClick={() =>
                    setOpen(open === "dateFrom" ? null : "dateFrom")
                  }
                />
                {open === "dateFrom" && (
                  <Calendar
                    selectedDate={dateFrom}
                    onSelect={(d) => {
                      updateSearchData({ dateFrom: d });
                      setOpen(null);
                    }}
                  />
                )}
              </div>
              <div className="input-with-icon">
                <input
                  value={dateTo}
                  placeholder="Обратно"
                  readOnly
                  onClick={() => setOpen(open === "dateTo" ? null : "dateTo")}
                  onKeyDown={(e) => {
                    if (e.key !== "Backspace" && e.key !== "Delete") return;
                    if (!dateTo) return;
                    e.preventDefault();
                    updateSearchData({ dateTo: "" });
                    setOpen(null);
                  }}
                />
                {dateTo ? (
                  <button
                    type="button"
                    className="input-clear"
                    aria-label="Очистить дату"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSearchData({ dateTo: "" });
                      setOpen(null);
                    }}
                  >
                    ×
                  </button>
                ) : null}
                <img
                  src={calendarIcon}
                  className="input-icon"
                  alt=""
                  onClick={() => setOpen(open === "dateTo" ? null : "dateTo")}
                />
                {open === "dateTo" && (
                  <Calendar
                    selectedDate={dateTo}
                    onSelect={(d) => {
                      updateSearchData({ dateTo: d });
                      setOpen(null);
                    }}
                  />
                )}
              </div>
            </div>

            <div className="search-btn-wrapper">
              <button
                className={`booking-header__search-btn ${isSearching ? "loading" : ""}`}
                onClick={handleSearchClick}
                disabled={isSearching}
              >
                НАЙТИ БИЛЕТЫ
              </button>
            </div>
          </div>
        </Container>
      </div>

      <div className="booking-steps">
        <Container className="booking-steps__inner">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`booking-step ${activeStep >= n ? "booking-step--active" : ""}`}
            >
              <span className="booking-step__number">{n}</span>
              <span>
                {["Билеты", "Пассажиры", "Оплата", "Проверка"][n - 1]}
              </span>
            </div>
          ))}
        </Container>
      </div>

      {isSearching && (
        <div className="loading-bar-wrapper">
          <div className="loading-bar-container">
            <div
              className="loading-bar"
              style={{ width: `${Math.max(0, Math.min(100, searchProgress))}%` }}
            ></div>
          </div>
        </div>
      )}
    </header>
  );
}
