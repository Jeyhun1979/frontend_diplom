import { Outlet } from "react-router-dom";

import { Footer } from "../../components/common/Footer";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import "./MainLayout.css";

export function MainLayout() {
  useScrollToTop();

  return (
    <div className="main-layout">
      <main className="main-layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
