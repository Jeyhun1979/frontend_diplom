import { ContactsSubscribe } from "../../components/common/ContactsSubscribe/ContactsSubscribe";
import { Container } from "../../components/ui/Container";
import "./ContactsPage.css";

export function ContactsPage() {
  return (
    <div className="contacts-page">
      <Container>
        <h1 className="page-title contacts-page__title">Контакты</h1>
      </Container>
      <ContactsSubscribe />
    </div>
  );
}
