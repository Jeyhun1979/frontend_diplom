import { Link } from "react-router-dom";
import trainCarriageIcon from "../../../assets/icons/train-carriage.svg";
import "./TrainCard.css";

function getClassMeta(key) {
  switch (key) {
    case "fourth":
      return { label: "Сидячий", order: 4 };
    case "third":
      return { label: "Плацкарт", order: 3 };
    case "second":
      return { label: "Купе", order: 2 };
    case "first":
      return { label: "Люкс", order: 1 };
    default:
      return { label: key, order: 99 };
  }
}

function getMinPriceForClass(priceInfoItem) {
  if (!priceInfoItem || typeof priceInfoItem !== "object") return null;
  const candidates = [
    priceInfoItem.price,
    priceInfoItem.bottom_price,
    priceInfoItem.top_price,
    priceInfoItem.side_price,
  ].filter((v) => typeof v === "number" && Number.isFinite(v) && v > 0);
  if (!candidates.length) return null;
  return Math.min(...candidates);
}

export function TrainCard({ train, onSelect }) {
  const classRows = (() => {
    const seatsInfo = train?.seatsInfo ?? null;
    const priceInfo = train?.priceInfo ?? null;
    if (!seatsInfo || !priceInfo) return [];

    const keys = ["fourth", "third", "second", "first"];
    return keys
      .map((key) => {
        const seats = seatsInfo?.[key];
        const price = getMinPriceForClass(priceInfo?.[key]);
        if (!seats || !price) return null;
        const meta = getClassMeta(key);
        return { key, label: meta.label, seats, price, order: meta.order };
      })
      .filter(Boolean)
      .sort((a, b) => a.order - b.order);
  })();

  return (
    <div className="train-card">
      <div className="train-card__left">
        <img
          src={trainCarriageIcon}
          alt="train-carriage"
          className="train-icon"
        />
        <div>
          <div className="train-number">№{train.number}</div>
          <div className="train-route">
            {train.from} → {train.to}
          </div>
        </div>
      </div>

      <div className="train-card__center">
        <div className="station">
          <div className="time">{train.departureTime}</div>
          <div className="city">{train.from}</div>
        </div>

        <div className="duration">
          <div className="line"></div>
          <div className="time-text">{train.duration}</div>
        </div>

        <div className="station">
          <div className="time">{train.arrivalTime}</div>
          <div className="city">{train.to}</div>
        </div>
      </div>

      <div className="train-card__right">
        <div className="train-prices">
          {classRows.length ? (
            classRows.map((row) => (
              <div key={row.key} className="price-row">
                <span>
                  {row.label} ({row.seats})
                </span>
                <span>{row.price} ₽</span>
              </div>
            ))
          ) : (
            <div className="price-row">
              <span>Минимальная цена</span>
              <span>{train.price} ₽</span>
            </div>
          )}
        </div>

        <div className="train-footer">
          <div className="free-seats">Свободно: {train.freeSeats}</div>

          <Link
            to={`/train/${train.id}`}
            className="select-btn"
            onClick={onSelect}
            state={{ train: train.raw ?? train }}
          >
            Выбрать места
          </Link>
        </div>
      </div>
    </div>
  );
}
