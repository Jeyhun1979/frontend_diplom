import "./OrderSummarySidebar.css";

export function OrderSummarySidebar({
  train,
  selectedSeats = [],
  returnTrain,
  returnSeats = [],
  passengers = [],
  totalPrice = 0,
}) {
  const passengerStats = passengers.reduce(
    (acc, p) => {
      if (p?.type === "child") acc.child += 1;
      else acc.adult += 1;
      return acc;
    },
    { adult: 0, child: 0 },
  );

  return (
    <aside className="order-summary">
      <div className="order-summary__head">ДЕТАЛИ ПОЕЗДКИ</div>

      <div className="order-summary__section">
        <div className="order-summary__section-title">Туда</div>
        <div className="order-summary__line">
          <span>№ Поезда</span>
          <strong>{train?.number ?? "—"}</strong>
        </div>
        <div className="order-summary__line">
          <span>Маршрут</span>
          <strong>
            {train?.from ?? "—"} - {train?.to ?? "—"}
          </strong>
        </div>
        <div className="order-summary__time">
          <div>
            <strong>{train?.departureTime ?? "—"}</strong>
            <span>{train?.from ?? "—"}</span>
          </div>
          <div className="order-summary__arrow">→</div>
          <div>
            <strong>{train?.arrivalTime ?? "—"}</strong>
            <span>{train?.to ?? "—"}</span>
          </div>
        </div>
      </div>

      {returnTrain ? (
        <div className="order-summary__section">
          <div className="order-summary__section-title">Обратно</div>
          <div className="order-summary__line">
            <span>№ Поезда</span>
            <strong>{returnTrain?.number ?? "—"}</strong>
          </div>
          <div className="order-summary__line">
            <span>Маршрут</span>
            <strong>
              {returnTrain?.from ?? "—"} - {returnTrain?.to ?? "—"}
            </strong>
          </div>
          <div className="order-summary__time">
            <div>
              <strong>{returnTrain?.departureTime ?? "—"}</strong>
              <span>{returnTrain?.from ?? "—"}</span>
            </div>
            <div className="order-summary__arrow">→</div>
            <div>
              <strong>{returnTrain?.arrivalTime ?? "—"}</strong>
              <span>{returnTrain?.to ?? "—"}</span>
            </div>
          </div>
          <div className="order-summary__line">
            <span>Мест</span>
            <strong>{returnSeats.length}</strong>
          </div>
        </div>
      ) : null}

      <div className="order-summary__section">
        <div className="order-summary__section-title">Пассажиры</div>
        {passengers.length ? (
          <>
            <div className="order-summary__line">
              <span>Взрослых</span>
              <strong>{passengerStats.adult}</strong>
            </div>
            <div className="order-summary__line">
              <span>Детских</span>
              <strong>{passengerStats.child}</strong>
            </div>
          </>
        ) : (
          <div className="order-summary__line">
            <span>Мест</span>
            <strong>{selectedSeats.length}</strong>
          </div>
        )}
      </div>

      <div className="order-summary__total">
        <span>ИТОГ</span>
        <strong>{Number(totalPrice || 0).toLocaleString()} ₽</strong>
      </div>
    </aside>
  );
}
