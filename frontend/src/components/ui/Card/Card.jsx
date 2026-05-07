import "./Card.css";

export function Card({
  children,
  variant = "default",
  className = "",
  onClick,
}) {
  return (
    <div className={`card card--${variant} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
