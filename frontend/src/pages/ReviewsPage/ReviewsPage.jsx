import { useState } from "react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import "./ReviewsPage.css";

export function ReviewsPage() {
  const [reviews] = useState([
    {
      id: 1,
      name: "Екатерина Вальнова",
      avatar: "Е",
      rating: 5,
      date: "15 марта 2024",
      text: "Отличный сервис! Долго искала удобную платформу для покупки билетов. Здесь всё просто и понятно. Билеты пришли на почту мгновенно.",
      destination: "Москва → Санкт-Петербург",
    },
    {
      id: 2,
      name: "Евгений Стрыкало",
      avatar: "Е",
      rating: 4,
      date: "10 марта 2024",
      text: "Хороший сервис. Удобно выбирать места в вагоне. Единственное - хотелось бы больше фильтров при поиске. В остальном всё отлично.",
      destination: "Екатеринбург → Новосибирск",
    },
    {
      id: 3,
      name: "Анна Петрова",
      avatar: "А",
      rating: 5,
      date: "5 марта 2024",
      text: "Лучший сервис для покупки ЖД билетов! Цены ниже, чем в кассах, а кешбэк приятно радует. Рекомендую всем друзьям.",
      destination: "Казань → Москва",
    },
    {
      id: 4,
      name: "Дмитрий Козлов",
      avatar: "Д",
      rating: 5,
      date: "1 марта 2024",
      text: "Покупаю билеты только здесь уже 3 года. Ни разу не подвели. Поддержка отвечает быстро, если возникают вопросы.",
      destination: "Санкт-Петербург → Мурманск",
    },
    {
      id: 5,
      name: "Ольга Смирнова",
      avatar: "О",
      rating: 5,
      date: "25 февраля 2024",
      text: "Очень удобный сайт! Быстро нашла билеты, оплатила картой, билеты пришли на почту. Всё отлично!",
      destination: "Москва → Сочи",
    },
    {
      id: 6,
      name: "Игорь Морозов",
      avatar: "И",
      rating: 4,
      date: "20 февраля 2024",
      text: "Хороший сервис. Иногда подвисает, но в целом всё работает. Билеты всегда есть в наличии.",
      destination: "Новосибирск → Томск",
    },
  ]);

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="reviews-page">
      <Container>
        <h1 className="page-title">Отзывы пассажиров</h1>
        <p className="page-subtitle">
          Более 10 000 довольных пассажиров выбрали нас
        </p>

        <div className="reviews-stats">
          <div className="rating-overall">
            <div className="rating-overall__score">{averageRating}</div>
            <div className="rating-overall__stars">
              {renderStars(Math.round(averageRating))}
            </div>
            <div className="rating-overall__count">
              На основе {reviews.length} отзывов
            </div>
          </div>
        </div>

        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-card__header">
                <div className="review-card__avatar">{review.avatar}</div>
                <div className="review-card__info">
                  <div className="review-card__name">{review.name}</div>
                  <div className="review-card__rating">
                    {renderStars(review.rating)}
                  </div>
                  <div className="review-card__meta">
                    <span>{review.date}</span>
                    <span className="review-card__destination">
                      {review.destination}
                    </span>
                  </div>
                </div>
              </div>
              <p className="review-card__text">{review.text}</p>
            </div>
          ))}
        </div>

        <div className="reviews__add">
          <Button variant="outline">Оставить отзыв</Button>
        </div>
      </Container>
    </div>
  );
}
