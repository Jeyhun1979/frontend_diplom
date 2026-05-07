import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { BookingHeader } from "../../components/common/BookingHeader/BookingHeader";
import { OrderSummarySidebar } from "../../components/common/OrderSummarySidebar/OrderSummarySidebar";
import { getBookingDraft, clearBookingDraft } from "../../utils/bookingDraft";
import { ContactsSubscribe } from "../../components/common/ContactsSubscribe/ContactsSubscribe";
import websiteIcon from "../../assets/icons/website.svg";
import letterIcon from "../../assets/icons/letter.svg";
import trainIcon from "../../assets/icons/train.svg";
import "./ConfirmationPage.css";

function formatPaymentLabel(method) {
  if (method === "cash") return "Наличными";
  if (method === "sbp") return "PayPal";
  if (method === "applepay") return "Visa QIWI Wallet";
  return "Онлайн";
}

export function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const draft = getBookingDraft();
  const {
    train,
    selectedSeats,
    returnTrain,
    returnSeats,
    passengers,
    paymentMethod,
    totalPrice,
    order,
  } = location.state || draft || {};
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [rating, setRating] = useState(0);
  const [successMenuOpen, setSuccessMenuOpen] = useState(false);

  const bookingNumber = useMemo(() => {
    const existing = order?.orderId || order?._id || order?.id;
    if (existing) return String(existing);
    return `BK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }, [order]);

  const passengerName = passengers?.[0]?.patronymic
    ? `${passengers[0].firstName} ${passengers[0].patronymic}`
    : passengers?.[0]?.firstName || "Пассажир";

  useEffect(() => {
    if (!train || !selectedSeats || !passengers) {
      navigate("/search");
    }
  }, [train, selectedSeats, passengers, navigate]);

  if (!train || !selectedSeats || !passengers) {
    return null;
  }
  const computedTotalPrice =
    typeof totalPrice === "number"
      ? totalPrice
      : (selectedSeats || []).reduce(
          (sum, s) => sum + (Number(s?.price ?? s?.basePrice ?? 0) || 0),
          0,
        ) +
        (returnSeats || []).reduce(
          (sum, s) => sum + (Number(s?.price ?? s?.basePrice ?? 0) || 0),
          0,
        );

  const departureBreakdown = useMemo(() => {
    const rows = [];
    const grouped = (selectedSeats || []).reduce((acc, s) => {
      const key = String(s?.coach_class_type ?? "").toUpperCase();
      const price = Number(s?.price ?? s?.basePrice ?? 0) || 0;
      if (!acc[key]) acc[key] = { count: 0, sum: 0 };
      acc[key].count += 1;
      acc[key].sum += price;
      return acc;
    }, {});

    const map = {
      FOURTH: "Сидячие",
      THIRD: "Плацкарт",
      SECOND: "Купе",
      FIRST: "Люкс",
    };

    Object.keys(map).forEach((k) => {
      if (!grouped[k]) return;
      rows.push({ label: map[k], ...grouped[k] });
    });

    const otherKeys = Object.keys(grouped).filter((k) => !map[k]);
    otherKeys.forEach((k) => rows.push({ label: k, ...grouped[k] }));

    return rows;
  }, [selectedSeats]);

  const returnBreakdown = useMemo(() => {
    const rows = [];
    const grouped = (returnSeats || []).reduce((acc, s) => {
      const key = String(s?.coach_class_type ?? "").toUpperCase();
      const price = Number(s?.price ?? s?.basePrice ?? 0) || 0;
      if (!acc[key]) acc[key] = { count: 0, sum: 0 };
      acc[key].count += 1;
      acc[key].sum += price;
      return acc;
    }, {});

    const map = {
      FOURTH: "Сидячие",
      THIRD: "Плацкарт",
      SECOND: "Купе",
      FIRST: "Люкс",
    };

    Object.keys(map).forEach((k) => {
      if (!grouped[k]) return;
      rows.push({ label: map[k], ...grouped[k] });
    });

    const otherKeys = Object.keys(grouped).filter((k) => !map[k]);
    otherKeys.forEach((k) => rows.push({ label: k, ...grouped[k] }));

    return rows;
  }, [returnSeats]);

  const handleReturnHome = () => {
    clearBookingDraft();
    navigate("/");
  };

  return (
    <div className="confirmation-page">
      {!isConfirmed ? (
        <BookingHeader activeStep={4} />
      ) : (
        <div className="success-hero">
          <div className="success-header">
            <div className="success-header__logo-row">
              <Container>
                <div className="success-header__logo">Лого</div>
              </Container>
            </div>

            <div className="success-header__nav-bar">
              <Container className="success-header__nav-inner">
                <div className="success-header__nav-row">
                  <nav className="success-header__nav" aria-label="Навигация">
                    <Link to="/#about">О нас</Link>
                    <Link to="/#how-it-works">Как это работает</Link>
                    <Link to="/#reviews">Отзывы</Link>
                    <Link to="/#contacts">Контакты</Link>
                  </nav>

                  <button
                    type="button"
                    className="success-header__burger"
                    aria-label="Меню"
                    aria-expanded={successMenuOpen}
                    onClick={() => setSuccessMenuOpen((v) => !v)}
                  >
                    <span className="success-header__burger-bar" />
                    <span className="success-header__burger-bar" />
                    <span className="success-header__burger-bar" />
                  </button>
                </div>

                {successMenuOpen ? (
                  <div className="success-header__mobile-menu" role="menu">
                    <Link
                      to="/#about"
                      role="menuitem"
                      onClick={() => setSuccessMenuOpen(false)}
                    >
                      О нас
                    </Link>
                    <Link
                      to="/#how-it-works"
                      role="menuitem"
                      onClick={() => setSuccessMenuOpen(false)}
                    >
                      Как это работает
                    </Link>
                    <Link
                      to="/#reviews"
                      role="menuitem"
                      onClick={() => setSuccessMenuOpen(false)}
                    >
                      Отзывы
                    </Link>
                    <Link
                      to="/#contacts"
                      role="menuitem"
                      onClick={() => setSuccessMenuOpen(false)}
                    >
                      Контакты
                    </Link>
                  </div>
                ) : null}
              </Container>
            </div>
          </div>
          <div className="success-hero__title">Благодарим Вас за заказ!</div>
        </div>
      )}
      <Container>
        <div className="confirmation-layout">
          {!isConfirmed ? (
            <OrderSummarySidebar
              train={train}
              selectedSeats={selectedSeats}
              returnTrain={returnTrain}
              returnSeats={returnSeats}
              passengers={passengers}
              totalPrice={computedTotalPrice}
            />
          ) : null}
          <div className="confirmation-main">
            {!isConfirmed ? (
              <div className="confirm">
                <div className="confirm-card">
                  <div className="confirm-card__head">
                    <div className="confirm-card__title">Поезд</div>
                  </div>
                  <div className="confirm-train">
                    <div className="confirm-train__left">
                      <div className="confirm-train__badge">
                        <div className="confirm-train__badge-icon" aria-hidden="true" />
                        <div className="confirm-train__badge-number">
                          {train?.number ?? "—"}
                        </div>
                        <div className="confirm-train__badge-route">
                          {train?.from ?? "—"}
                          <br />
                          {train?.to ?? "—"}
                        </div>
                      </div>
                    </div>

                    <div className="confirm-train__times">
                      <div className="confirm-train__time-row">
                        <div className="confirm-train__time">
                          <strong>{train?.departureTime ?? "—"}</strong>
                          <span>{train?.from ?? "—"}</span>
                        </div>
                        <div className="confirm-train__arrow" aria-hidden="true">
                          →
                        </div>
                        <div className="confirm-train__time">
                          <strong>{train?.arrivalTime ?? "—"}</strong>
                          <span>{train?.to ?? "—"}</span>
                        </div>
                      </div>

                      {returnTrain ? (
                        <div className="confirm-train__time-row">
                          <div className="confirm-train__time">
                            <strong>{returnTrain?.departureTime ?? "—"}</strong>
                            <span>{returnTrain?.from ?? "—"}</span>
                          </div>
                          <div className="confirm-train__arrow" aria-hidden="true">
                            →
                          </div>
                          <div className="confirm-train__time">
                            <strong>{returnTrain?.arrivalTime ?? "—"}</strong>
                            <span>{returnTrain?.to ?? "—"}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="confirm-train__prices">
                      {(departureBreakdown || []).map((r) => (
                        <div key={`d-${r.label}`} className="confirm-train__price-row">
                          <span>{r.label}</span>
                          <strong>{Number(r.sum || 0).toLocaleString()} ₽</strong>
                        </div>
                      ))}
                      {(returnBreakdown || []).map((r) => (
                        <div key={`r-${r.label}`} className="confirm-train__price-row">
                          <span>{r.label}</span>
                          <strong>{Number(r.sum || 0).toLocaleString()} ₽</strong>
                        </div>
                      ))}
                      <div className="confirm-card__edit-row">
                        <button
                          type="button"
                          className="confirm-edit"
                          onClick={() =>
                            navigate(`/train/${train?.id ?? train?._id ?? ""}`)
                          }
                        >
                          Изменить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="confirm-card">
                  <div className="confirm-card__head">
                    <div className="confirm-card__title">Пассажиры</div>
                  </div>
                  <div className="confirm-passengers">
                    <div className="confirm-passengers__list">
                      {(passengers || []).map((p, idx) => (
                        <div key={`${p?.id ?? idx}`} className="confirm-passenger">
                          <div className="confirm-passenger__icon" aria-hidden="true" />
                          <div className="confirm-passenger__info">
                            <div className="confirm-passenger__name">
                              {String(p?.lastName ?? "").trim()}{" "}
                              {String(p?.firstName ?? "").trim()}{" "}
                              {String(p?.patronymic ?? "").trim()}
                            </div>
                            <div className="confirm-passenger__meta">
                              {p?.documentType === "passport"
                                ? `Паспорт РФ: ${String(p?.passportSeries ?? "").trim()} ${String(p?.passportNumber ?? "").trim()}`.trim()
                                : `Свидетельство: ${String(p?.birthCertNumber ?? "").trim()}`.trim()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="confirm-passengers__total">
                      <div className="confirm-passengers__total-label">Всего</div>
                      <div className="confirm-passengers__total-sum">
                        {computedTotalPrice.toLocaleString()} ₽
                      </div>
                      <button
                        type="button"
                        className="confirm-edit"
                        onClick={() => navigate("/passenger")}
                      >
                        Изменить
                      </button>
                    </div>
                  </div>
                </div>

                <div className="confirm-card">
                  <div className="confirm-card__head">
                    <div className="confirm-card__title">Способ оплаты</div>
                  </div>
                  <div className="confirm-pay">
                    <div className="confirm-pay__value">
                      {formatPaymentLabel(paymentMethod)}
                    </div>
                    <button
                      type="button"
                      className="confirm-edit"
                      onClick={() => navigate("/payment")}
                    >
                      Изменить
                    </button>
                  </div>
                </div>

                <div className="confirm-actions">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsConfirmed(true);
                      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                    }}
                    className="confirm-actions__btn"
                  >
                    ПОДТВЕРДИТЬ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="success-card">
                <div className="success-card__head">
                  <div className="success-card__order">
                    №Заказа <strong>{bookingNumber}</strong>
                  </div>
                  <div className="success-card__sum">
                    сумма <strong>{computedTotalPrice.toLocaleString()} ₽</strong>
                  </div>
                </div>

                <div className="success-card__icons">
                  <div className="success-step">
                    <div className="success-step__icon">
                      <img src={letterIcon} alt="" />
                    </div>
                    <div className="success-step__text">
                      билеты будут
                      <br />
                      отправлены
                      <br />
                      на ваш e-mail
                    </div>
                  </div>
                  <div className="success-step">
                    <div className="success-step__icon">
                      <img src={websiteIcon} alt="" />
                    </div>
                    <div className="success-step__text">
                      распечатайте
                      <br />
                      и сохраняйте билеты
                      <br />
                      до даты поездки
                    </div>
                  </div>
                  <div className="success-step">
                    <div className="success-step__icon">
                      <img src={trainIcon} alt="" />
                    </div>
                    <div className="success-step__text">
                      предъявите
                      <br />
                      распечатанные
                      <br />
                      билеты при посадке
                    </div>
                  </div>
                </div>

                <div className="success-card__body">
                  <div className="success-card__hello">{passengerName}!</div>
                  <div className="success-card__message">
                    Ваш заказ успешно оформлен.
                    <br />
                    В ближайшее время с вами свяжется наш оператор для подтверждения.
                  </div>
                  <div className="success-card__wish">
                    Благодарим Вас за оказанное доверие и желаем приятного путешествия!
                  </div>
                </div>

                <div className="success-card__footer">
                  <div className="success-card__rating">
                    <span>Оценить сервис</span>
                    <div className="stars" role="radiogroup" aria-label="Оценка сервиса">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`star ${rating >= n ? "star--active" : ""}`}
                          onClick={() => setRating(n)}
                          aria-label={`${n}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="success-card__home-btn"
                    onClick={handleReturnHome}
                  >
                    ВЕРНУТЬСЯ НА ГЛАВНУЮ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
      <ContactsSubscribe />
    </div>
  );
}
