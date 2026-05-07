import groupupIcon from "../../../assets/icons/groupup.svg";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer-logo">Лого</div>
        <button
          type="button"
          className="footer-icon"
          aria-label="Наверх"
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}
        >
          <img src={groupupIcon} alt="" className="footer-icon__img" />
        </button>
        <div className="footer-year">2018 WEB</div>
      </div>
    </footer>
  );
}
