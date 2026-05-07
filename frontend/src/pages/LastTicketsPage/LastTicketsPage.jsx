import { Container } from "../../components/ui/Container";
import { LastTickets } from "../../components/common/LastTickets";
import "./LastTicketsPage.css";

export function LastTicketsPage() {
  return (
    <div className="last-tickets-page">
      <Container>
        <h1 className="page-title">Последние билеты</h1>
        <p className="page-subtitle">
          Самые популярные направления и выгодные предложения
        </p>
        <LastTickets />
      </Container>
    </div>
  );
}
