import { Link } from "react-router-dom";
import { Container } from "../../ui/Container";
import { SectionTitle } from "../../ui/SectionTitle";

import direction from "../../../assets/icons/direction.svg";
import office from "../../../assets/icons/office.svg";
import website from "../../../assets/icons/website.svg";

import "./HowItWorksSection.css";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="how-section">
      <Container>
        <div className="how-header">
          <SectionTitle className="how-title">Как это работает</SectionTitle>
          <Link to="/#how-it-works" className="how-link-btn">
            Узнать больше →
          </Link>
        </div>

        <div className="features-row">
          <div className="feature-card-light">
            <img src={website} alt="Иконка" className="feature-icon" />
            <h3 className="feature-title">
              Удобный заказ <br /> на сайте
            </h3>
          </div>
          <div className="feature-card-light">
            <img src={office} alt="Иконка" className="feature-icon" />
            <h3 className="feature-title">
              Нет необходимости <br /> ехать в офис
            </h3>
          </div>
          <div className="feature-card-light">
            <img src={direction} alt="Иконка" className="feature-icon" />
            <h3 className="feature-title">
              Огромный выбор <br /> направлений
            </h3>
          </div>
        </div>
      </Container>
    </section>
  );
}
