import "./Container.css";

export function Container({ children, className = "" }) {
  return <div className={`container ${className}`}>{children}</div>;
}
