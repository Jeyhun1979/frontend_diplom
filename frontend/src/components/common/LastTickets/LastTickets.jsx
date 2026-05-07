import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { routesApi } from "../../../services/routesApi";
import { mapRouteToTrainCard } from "../../../utils/routeViewModel";
import "./LastTickets.css";

export function LastTickets({ variant = "section" }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setError("");
        const data = await routesApi.last();
        const items = Array.isArray(data) ? data : [];
        setTickets(items.map(mapRouteToTrainCard));
      } catch (error) {
        setTickets([]);
        setError(error?.message || "Не удалось загрузить последние направления");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <section className={`last-tickets last-tickets--${variant}`}>
        <div className="last-tickets__title">Последние билеты</div>
        <div className="last-tickets__loading">Загрузка...</div>
      </section>
    );
  }

  return (
    <section className={`last-tickets last-tickets--${variant}`}>
      <div className="last-tickets__title">Последние билеты</div>
      {error ? <div className="error">{error}</div> : null}
      <div className="last-tickets__grid">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-card__route">
              <span className="ticket-card__city">{ticket.from}</span>
              <span className="ticket-card__arrow">→</span>
              <span className="ticket-card__city">{ticket.to}</span>
            </div>
            <div className="ticket-card__price">
              {ticket.price.toLocaleString()} ₽
            </div>
            <Link
              to={`/train/${ticket.id}`}
              className="ticket-card__btn"
              state={{ train: ticket.raw ?? ticket }}
            >
              Выбрать
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
