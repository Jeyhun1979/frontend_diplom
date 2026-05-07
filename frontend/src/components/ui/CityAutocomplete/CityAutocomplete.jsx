import { useEffect, useMemo, useRef, useState } from "react";
import { citiesApi } from "../../../services/citiesApi";
import { useDebounce } from "../../../hooks/useDebounce";
import { splitByMatch } from "../../../utils/highlightMatch";
import "./CityAutocomplete.css";

export function CityAutocomplete({
  name,
  placeholder,
  value,
  onChange,
  onSelect,
  required,
}) {
  const initialName = typeof value === "string" ? value : value?.name ?? "";
  const [inputValue, setInputValue] = useState(initialName);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debounced = useDebounce(inputValue, 350);
  const lastRequest = useRef(0);

  useEffect(() => {
    setInputValue(initialName);
  }, [initialName]);

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 1) {
      setItems([]);
      setError("");
      return;
    }

    const requestId = Date.now();
    lastRequest.current = requestId;

    setLoading(true);
    setError("");
    citiesApi
      .search(q)
      .then((data) => {
        if (lastRequest.current !== requestId) return;
        setItems(Array.isArray(data) ? data : []);
        setOpen(true);
      })
      .catch((e) => {
        if (lastRequest.current !== requestId) return;
        setItems([]);
        setOpen(true);
        setError(e?.message || "Не удалось загрузить список городов");
      })
      .finally(() => {
        if (lastRequest.current !== requestId) return;
        setLoading(false);
      });
  }, [debounced]);

  const highlighted = useMemo(() => {
    const q = inputValue.trim();
    const qLower = q.toLocaleLowerCase("ru-RU");
    const filtered = q
      ? items.filter((c) =>
          String(c?.name ?? "")
            .toLocaleLowerCase("ru-RU")
            .startsWith(qLower),
        )
      : [];

    const sorted = filtered
      .slice()
      .sort((a, b) =>
        String(a?.name ?? "").localeCompare(String(b?.name ?? ""), "ru-RU", {
          sensitivity: "base",
        }),
      )
      .slice(0, 10);

    return sorted.map((c) => ({
      ...c,
      parts: splitByMatch(c.name, q),
    }));
  }, [items, inputValue]);

  const handlePick = (city) => {
    setInputValue(city.name);
    setOpen(false);
    onSelect?.(city);
    onChange?.({ target: { name, value: city } });
  };

  const tryAutoPickExact = () => {
    const q = inputValue.trim();
    if (!q) return false;
    const qLower = q.toLocaleLowerCase("ru-RU");
    const exact = items.find(
      (c) => String(c?.name ?? "").toLocaleLowerCase("ru-RU") === qLower,
    );
    if (exact) {
      handlePick(exact);
      return true;
    }
    return false;
  };

  return (
    <div className="city-autocomplete">
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          const v = e.target.value;
          setInputValue(v);
          setOpen(true);
          onChange?.({ target: { name, value: v } });
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          if (tryAutoPickExact()) return;
          if (highlighted.length > 0) {
            handlePick(highlighted[0]);
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => {
            if (!tryAutoPickExact()) setOpen(false);
          }, 120);
        }}
        autoComplete="off"
        required={required}
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {open && (loading || error || highlighted.length > 0) ? (
        <div className="city-autocomplete__dropdown">
          {loading ? (
            <div className="city-autocomplete__status">Загрузка…</div>
          ) : error ? (
            <div className="city-autocomplete__error">{error}</div>
          ) : (
            highlighted.map((city) => (
              <button
                type="button"
                key={city._id}
                className="city-autocomplete__item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePick(city)}
              >
                {city.parts.map((p, idx) =>
                  p.match ? (
                    <mark key={idx} className="city-autocomplete__mark">
                      {p.text}
                    </mark>
                  ) : (
                    <span key={idx}>{p.text}</span>
                  ),
                )}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

