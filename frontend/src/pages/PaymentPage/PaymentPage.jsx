import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { BookingHeader } from "../../components/common/BookingHeader/BookingHeader";
import { OrderSummarySidebar } from "../../components/common/OrderSummarySidebar/OrderSummarySidebar";
import { saveBookingDraft, getBookingDraft } from "../../utils/bookingDraft";
import { ContactsSubscribe } from "../../components/common/ContactsSubscribe/ContactsSubscribe";
import { orderApi } from "../../services/orderApi";
import { useTicketStore } from "../../store";
import { validateEmail, validatePhone } from "../../utils/validators";
import "./PaymentPage.css";

function mapPassengerToPersonInfo(p) {
  return {
    is_adult: p.type !== "child",
    first_name: p.firstName,
    last_name: p.lastName,
    patronymic: p.patronymic || "",
    gender: p.gender === "M",
    birthday: p.birthDate,
    document_type: p.documentType === "passport" ? "паспорт" : "свидетельство",
    document_data:
      p.documentType === "passport"
        ? `${String(p.passportSeries).trim()} ${String(p.passportNumber).trim()}`.trim()
        : String(p.birthCertNumber).trim(),
  };
}

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const draft = getBookingDraft();
  const { train, selectedSeats, passengers, returnTrain, returnSeats } =
    location.state || draft || {};
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const contacts = useTicketStore((s) => s.contacts);
  const setContacts = useTicketStore((s) => s.setContacts);
  const setOrder = useTicketStore((s) => s.setOrder);
  const [phone, setPhone] = useState(contacts?.phone ?? "");
  const [email, setEmail] = useState(contacts?.email ?? "");
  const [touched, setTouched] = useState({ phone: false, email: false });

  const phoneTrimmed = phone.trim();
  const emailTrimmed = email.trim();

  const phoneError =
    !phoneTrimmed
      ? "Заполните, пожалуйста!"
      : validatePhone(phoneTrimmed)
        ? ""
        : "Введите корректный телефон";

  const emailError =
    !emailTrimmed
      ? "Заполните, пожалуйста!"
      : validateEmail(emailTrimmed)
        ? ""
        : "Введите корректный email";

  useEffect(() => {
    if (!train || !selectedSeats || !passengers) {
      navigate("/search");
    }
  }, [train, selectedSeats, passengers, navigate]);

  if (!train || !selectedSeats || !passengers) return null;

  const totalPrice =
    (selectedSeats || []).reduce(
      (sum, s) => sum + (Number(s?.price ?? s?.basePrice ?? 0) || 0),
      0,
    ) +
    (returnSeats || []).reduce(
      (sum, s) => sum + (Number(s?.price ?? s?.basePrice ?? 0) || 0),
      0,
    );

  const handlePayment = async () => {
    setError("");
    setTouched({ phone: true, email: true });

    if (phoneError || emailError) {
      return;
    }

    try {
      setIsProcessing(true);
      setContacts({ phone: phoneTrimmed, email: emailTrimmed });

      const payment_method = paymentMethod === "cash" ? "cash" : "online";
      const buyer = passengers?.[0] || {};

      const departureSeatsPayload = (selectedSeats || []).map((s, idx) => ({
        coach_id: s.coach_id,
        person_info: mapPassengerToPersonInfo(passengers[idx]),
        seat_number: s.seat_number,
        is_child: passengers[idx]?.type === "child",
        include_children_seat: false,
      }));
      const arrivalSeatsPayload = (returnSeats || []).map((s, idx) => ({
        coach_id: s.coach_id,
        person_info: mapPassengerToPersonInfo(passengers[idx]),
        seat_number: s.seat_number,
        is_child: passengers[idx]?.type === "child",
        include_children_seat: false,
      }));

      const payload = {
        user: {
          first_name: buyer.firstName,
          last_name: buyer.lastName,
          patronymic: buyer.patronymic || "",
          phone: phoneTrimmed,
          email: emailTrimmed,
          payment_method,
        },
        departure: {
          route_direction_id: train?.id || train?._id,
          seats: departureSeatsPayload,
        },
        ...(returnTrain?.id
          ? {
              arrival: {
                route_direction_id: returnTrain.id,
                seats: arrivalSeatsPayload,
              },
            }
          : {}),
      };

      const response = await orderApi.create(payload);
      setOrder(response);

      saveBookingDraft({
        train,
        selectedSeats,
        returnTrain,
        returnSeats,
        passengers,
        paymentMethod,
        totalPrice,
        order: response,
      });

      navigate("/confirmation", {
        state: {
          train,
          selectedSeats,
          returnTrain,
          returnSeats,
          passengers,
          paymentMethod,
          totalPrice,
          order: response,
        },
      });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Ошибка оформления заказа");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <BookingHeader activeStep={3} />
      <Container>
        <div className="payment-page__layout">
          <OrderSummarySidebar
            train={train}
            selectedSeats={selectedSeats}
            returnTrain={returnTrain}
            returnSeats={returnSeats}
            passengers={passengers}
            totalPrice={totalPrice}
          />

          <div className="payment-page__main">
            <div className="payment-page__content">
              <div className="payment-form">
                <div className="payment-section">
                  <h2>Персональные данные</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Фамилия</label>
                      <input
                        type="text"
                        value={passengers[0]?.lastName || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Имя</label>
                      <input
                        type="text"
                        value={passengers[0]?.firstName || ""}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Отчество</label>
                      <input
                        type="text"
                        value={passengers[0]?.patronymic || ""}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Контактный телефон</label>
                    <input
                      type="text"
                      placeholder="+7 ___ ___ __ __"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                      aria-invalid={touched.phone && Boolean(phoneError)}
                      aria-describedby="payment-phone-error"
                    />
                    {touched.phone && phoneError ? (
                      <div
                        className="field-error"
                        id="payment-phone-error"
                        role="alert"
                      >
                        {phoneError}
                      </div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="inbox@gmail.ru"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      aria-invalid={touched.email && Boolean(emailError)}
                      aria-describedby="payment-email-error"
                    />
                    {touched.email && emailError ? (
                      <div
                        className="field-error"
                        id="payment-email-error"
                        role="alert"
                      >
                        {emailError}
                      </div>
                    ) : null}
                  </div>
                  {error ? (
                    <div className="error" role="alert">
                      {error}
                    </div>
                  ) : null}
                </div>

                <div className="payment-section">
                  <h2>Способ оплаты</h2>
                  <div className="payment-box">
                    <div className="payment-box__row payment-box__row--header">
                      <label className="payment-toggle">
                        <input
                          type="checkbox"
                          checked={paymentMethod !== "cash"}
                          onChange={() => {
                            if (paymentMethod === "cash") setPaymentMethod("card");
                          }}
                        />
                        <span>Онлайн</span>
                      </label>
                    </div>

                    <div className="payment-box__row payment-box__row--online">
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Банковской картой</span>
                      </label>
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="payment"
                          value="sbp"
                          checked={paymentMethod === "sbp"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>PayPal</span>
                      </label>
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="payment"
                          value="applepay"
                          checked={paymentMethod === "applepay"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Visa QIWI Wallet</span>
                      </label>
                    </div>

                    <div className="payment-box__row payment-box__row--cash">
                      <label className="payment-toggle">
                        <input
                          type="checkbox"
                          checked={paymentMethod === "cash"}
                          onChange={() => {
                            if (paymentMethod !== "cash") setPaymentMethod("cash");
                          }}
                        />
                        <span>Наличными</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-actions">
              <Button
                variant="primary"
                onClick={handlePayment}
                disabled={isProcessing}
                className="pay-button"
              >
                {isProcessing ? "Обработка..." : "КУПИТЬ БИЛЕТЫ"}
              </Button>
            </div>
          </div>
        </div>
      </Container>
      <ContactsSubscribe />
    </div>
  );
}
