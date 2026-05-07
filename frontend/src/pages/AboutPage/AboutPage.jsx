import { Container } from "../../components/ui/Container";
import "./AboutPage.css";

export function AboutPage() {
  return (
    <div className="about-page">
      <Container>
        <h1 className="page-title">О нас</h1>

        <div className="about-content">
          <div className="about-section">
            <h2>Наша миссия</h2>
            <p>
              Мы — современная платформа для покупки железнодорожных билетов.
              Наша цель — сделать путешествия максимально комфортными и
              доступными для каждого пассажира.
            </p>
          </div>

          <div className="about-section">
            <h2>История компании</h2>
            <p>
              Мы рады видеть вас! Мы работаем для Вас с{" "}
              <strong>2003 года</strong>. 14 лет мы наблюдаем, как с каждым днем
              все больше людей заказывают жд билеты через интернет.
            </p>
            <p>
              Сегодня можно заказать железнодорожные билеты онлайн всего в 2
              клика. Мы расскажем о преимуществах заказа через интернет.
            </p>
          </div>

          <div className="about-section about-section--highlight">
            <h2>Покупайте билеты дешево</h2>
            <p>
              <strong>За 90 суток до отправления поезда</strong> — самые низкие
              цены! Благодаря динамическому ценообразованию цена на билеты в это
              время минимальна. Успейте забронировать места по выгодной
              стоимости!
            </p>
          </div>

          <div className="about-stats">
            <div className="stat">
              <div className="stat__number">20+</div>
              <div className="stat__label">лет на рынке</div>
            </div>
            <div className="stat">
              <div className="stat__number">1M+</div>
              <div className="stat__label">довольных пассажиров</div>
            </div>
            <div className="stat">
              <div className="stat__number">500+</div>
              <div className="stat__label">направлений</div>
            </div>
            <div className="stat">
              <div className="stat__number">24/7</div>
              <div className="stat__label">поддержка</div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
