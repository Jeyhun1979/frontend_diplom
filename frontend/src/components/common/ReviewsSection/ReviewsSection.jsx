import { Container } from "../../ui/Container";

import "./ReviewsSection.css";

export function ReviewsSection() {
  return (
    <section id="reviews" className="home-section home-section--gray">
      <Container>
        <div className="review-block__title">Отзывы</div>

        <div className="reviews-split">
          <div className="review-block">
            <div className="review-block__avatar review-block__avatar--lg">
              <img
                src="/src/assets/images/foto-ekaterina.png"
                alt="Екатерина Вальнова"
                className="review-avatar-img"
              />
            </div>
            <div className="review-block__content">
              <div className="review-block__name">Екатерина Вальнова</div>
              <p className="review-block__text">
                "Доброжелательные подсказки на всех этапах помогут правильно
                заполнить поля и без затруднений купить авиа или ж/д билет, даже
                если вы заказываете онлайн билет впервые."
              </p>
            </div>
          </div>

          <div className="review-block">
            <div className="review-block__avatar review-block__avatar--sm">
              <img
                src="/src/assets/images/foto-evg.png"
                alt="Евгений Стрыкало"
                className="review-avatar-img"
              />
            </div>
            <div className="review-block__content">
              <div className="review-block__name">Евгений Стрыкало</div>
              <p className="review-block__text">
                "СМС-сопровождение до посадки. Сразу после оплаты ж/д билетов и
                за 3 часа до отправления мы пришли вам СМС-автоматичное о
                поездке."
              </p>
            </div>
          </div>
        </div>

        <div className="reviews-pagination">
          <span className="pagination-dot pagination-dot--active"></span>
          <span className="pagination-dot"></span>
          <span className="pagination-dot"></span>
          <span className="pagination-dot"></span>
          <span className="pagination-dot"></span>
        </div>
      </Container>
    </section>
  );
}
