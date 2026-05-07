import "./SeatSelection.css";

export function Seat({ seat, isSelected, onSelect, className = "", style }) {
  const status = !seat.isAvailable
    ? "unavailable"
    : isSelected
      ? "selected"
      : "available";

  return (
    <button
      className={`seat seat--${status} ${className}`.trim()}
      style={style}
      onClick={() => onSelect(seat)}
      disabled={!seat.isAvailable}
    >
      {seat.number}
    </button>
  );
}
