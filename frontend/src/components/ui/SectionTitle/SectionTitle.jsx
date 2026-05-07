import "./SectionTitle.css";

export function SectionTitle({ children, centered = true, className = "" }) {
  return (
    <h2
      className={`section-title ${centered ? "section-title--centered" : ""} ${className}`}
    >
      {children}
    </h2>
  );
}
