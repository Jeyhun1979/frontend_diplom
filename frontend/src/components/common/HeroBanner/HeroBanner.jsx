import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../../ui/Container";
import vectorImg from "../../../assets/icons/map.svg";
import vector1Img from "../../../assets/icons/calendar.svg";
import arrowImg from "../../../assets/icons/arrowImg.png";
import { CityAutocomplete } from "../../ui/CityAutocomplete/CityAutocomplete";
import { ddmmyyyyToYyyyMmDd } from "../../../utils/dateFormat";
import { useTicketStore } from "../../../store";
import "./HeroBanner.css";

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
    <div className="calendar-dropdown">
      <div className="calendar-header">
        <button onClick={() => setMonthOffset(monthOffset - 1)}>&lt;</button>
        <span>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
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

export function HeroBanner() {
  const navigate = useNavigate();
  const setSearchParams = useTicketStore((s) => s.setSearchParams);
  const setSearchData = useTicketStore((s) => s.setSearchData);
  const [fromCity, setFromCity] = useState(null);
  const [toCity, setToCity] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = () => {
    if (!fromCity?._id || !toCity?._id) {
      alert("Выберите города из списка");
      return;
    }

    const searchData = { fromCity, toCity, dateFrom, dateTo };
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

    navigate("/search", {
      state: {
        searchData,
      },
    });
  };

  return (
    <div className="hero-banner">
      <div className="header">
        <div className="logo-wrapper">
          <Container>
            <div className="logo-white">Лого</div>
          </Container>
        </div>

        <div className="top-black-bar">
          <Container className="top-black-bar__container">
            <div className="hero-nav-row">
              <div className="nav-links-dark" aria-label="Навигация">
                <Link to="/#about">О нас</Link>
                <Link to="/#how-it-works">Как это работает</Link>
                <Link to="/#reviews">Отзывы</Link>
                <Link to="/#contacts">Контакты</Link>
              </div>

              <button
                type="button"
                className="hero-burger"
                aria-label="Меню"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="hero-burger__bar" />
                <span className="hero-burger__bar" />
                <span className="hero-burger__bar" />
              </button>
            </div>

            {menuOpen ? (
              <div className="hero-mobile-menu" role="menu">
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
                <Link to="/#contacts" role="menuitem" onClick={() => setMenuOpen(false)}>
                  Контакты
                </Link>
              </div>
            ) : null}
          </Container>
        </div>
      </div>

      <Container className="hero-container">
        <div className="hero-split">
          <div className="slogan-block">
            <div className="slogan-title">
              Вся жизнь - <br />
              <span>путешествие!</span>
            </div>
          </div>

          <div className="search-card">
            <div className="form-field">
              <label>Направление</label>
              <div className="direction-row">
                <div className="input-wrapper">
                  <CityAutocomplete
                    name="fromCity"
                    placeholder="Откуда"
                    value={fromCity}
                    onSelect={(city) => setFromCity(city)}
                    required
                  />
                  <img
                    src={vectorImg}
                    alt=""
                    className="input-icon"
                    onClick={() =>
                      setOpenDropdown(openDropdown === "from" ? null : "from")
                    }
                  />
                </div>
                <img src={arrowImg} alt="" className="input-icon-arrow" />
                <div className="input-wrapper">
                  <CityAutocomplete
                    name="toCity"
                    placeholder="Куда"
                    value={toCity}
                    onSelect={(city) => setToCity(city)}
                    required
                  />
                  <img
                    src={vectorImg}
                    alt=""
                    className="input-icon"
                    onClick={() =>
                      setOpenDropdown(openDropdown === "to" ? null : "to")
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-field">
              <label>Дата</label>
              <div className="date-row">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="ДД/ММ/ГГ"
                    value={dateFrom}
                    readOnly
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "dateFrom" ? null : "dateFrom",
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key !== "Backspace" && e.key !== "Delete") return;
                      if (!dateFrom) return;
                      e.preventDefault();
                      setDateFrom("");
                      setOpenDropdown(null);
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
                        setDateFrom("");
                        setOpenDropdown(null);
                      }}
                    >
                      ×
                    </button>
                  ) : null}
                  <img
                    src={vector1Img}
                    alt=""
                    className="input-icon"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "dateFrom" ? null : "dateFrom",
                      )
                    }
                  />
                  {openDropdown === "dateFrom" && (
                    <Calendar
                      selectedDate={dateFrom}
                      onSelect={(date) => {
                        setDateFrom(date);
                        setOpenDropdown(null);
                      }}
                    />
                  )}
                </div>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="ДД/ММ/ГГ"
                    value={dateTo}
                    readOnly
                    onClick={() =>
                      setOpenDropdown(openDropdown === "dateTo" ? null : "dateTo")
                    }
                    onKeyDown={(e) => {
                      if (e.key !== "Backspace" && e.key !== "Delete") return;
                      if (!dateTo) return;
                      e.preventDefault();
                      setDateTo("");
                      setOpenDropdown(null);
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
                        setDateTo("");
                        setOpenDropdown(null);
                      }}
                    >
                      ×
                    </button>
                  ) : null}
                  <img
                    src={vector1Img}
                    alt=""
                    className="input-icon"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "dateTo" ? null : "dateTo",
                      )
                    }
                  />
                  {openDropdown === "dateTo" && (
                    <Calendar
                      selectedDate={dateTo}
                      onSelect={(date) => {
                        setDateTo(date);
                        setOpenDropdown(null);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <button className="btn-find" onClick={handleSearch}>
              НАЙТИ БИЛЕТЫ
            </button>
          </div>
        </div>
      </Container>

      <div className="bottom-orange-bar"></div>
    </div>
  );
}
