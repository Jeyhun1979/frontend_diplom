import "./Input.css";

export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`input ${error ? "input--error" : ""}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
