import { HeroBanner } from "../../components/common/HeroBanner/HeroBanner";
import { AboutSection } from "../../components/common/AboutSection/AboutSection";
import { HowItWorksSection } from "../../components/common/HowItWorksSection/HowItWorksSection";

import { ReviewsSection } from "../../components/common/ReviewsSection/ReviewsSection";
import { ContactsSubscribe } from "../../components/common/ContactsSubscribe/ContactsSubscribe";

export function HomePage() {
  return (
    <div className="home-page">
      <HeroBanner />
      <AboutSection />
      <HowItWorksSection />

      <ReviewsSection />
      <ContactsSubscribe />
    </div>
  );
}
