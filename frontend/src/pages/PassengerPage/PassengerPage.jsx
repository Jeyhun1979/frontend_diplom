import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Container } from "../../components/ui/Container";
import { PassengerForm } from "../../components/common/PassengerForm";
import { BookingHeader } from "../../components/common/BookingHeader/BookingHeader";
import { OrderSummarySidebar } from "../../components/common/OrderSummarySidebar/OrderSummarySidebar";
import { saveBookingDraft, getBookingDraft } from "../../utils/bookingDraft";
import { ContactsSubscribe } from "../../components/common/ContactsSubscribe/ContactsSubscribe";
import "./PassengerPage.css";

export function PassengerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const draft = getBookingDraft();
  const { train, selectedSeats, returnTrain, returnSeats } =
    location.state || draft || {};

  useEffect(() => {
    if (!train || !selectedSeats) {
      navigate("/search");
    }
  }, [train, selectedSeats, navigate]);

  if (!train || !selectedSeats) return null;

  const totalPrice =
    (selectedSeats || []).reduce(
      (sum, s) => sum + (Number(s?.price ?? s?.basePrice ?? 0) || 0),
      0,
    ) +
    (returnSeats || []).reduce(
      (sum, s) => sum + (Number(s?.price ?? s?.basePrice ?? 0) || 0),
      0,
    );

  const handlePassengersSubmit = (passengerData) => {
    saveBookingDraft({
      train,
      selectedSeats,
      returnTrain,
      returnSeats,
      passengers: passengerData,
    });
    navigate("/payment", {
      state: {
        train,
        selectedSeats,
        returnTrain,
        returnSeats,
        passengers: passengerData,
      },
    });
  };

  return (
    <div className="passenger-page">
      <BookingHeader activeStep={2} />
      <Container>
        <div className="passenger-page__layout">
          <OrderSummarySidebar
            train={train}
            selectedSeats={selectedSeats}
            returnTrain={returnTrain}
            returnSeats={returnSeats}
            totalPrice={totalPrice}
          />

          <div className="passenger-page__main">
            <h1 className="passenger-page__title">ПАССАЖИРЫ</h1>
            <PassengerForm
              passengerCount={selectedSeats.length}
              onSubmit={handlePassengersSubmit}
            />
          </div>
        </div>
      </Container>
      <ContactsSubscribe />
    </div>
  );
}
