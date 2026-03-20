import "./App.css";
import { LangToggle } from "./components/LangToggle";
import { useT } from "./i18n";
import { BasicDemo } from "./sections/BasicDemo";
import { ControlledDemo } from "./sections/ControlledDemo";
import { FormDemo } from "./sections/FormDemo";
import { GradientDemo } from "./sections/GradientDemo";
import { RangeOnlyDemo } from "./sections/RangeOnlyDemo";
import { UseCasesDemo } from "./sections/UseCasesDemo";

export function App() {
  const t = useT();

  return (
    <>
      <header className="hero">
        <div className="container">
          <div className="hero-top">
            <h1>{t("hero.title")}</h1>
            <LangToggle />
          </div>
          <p className="hero-subtitle">{t("hero.subtitle")}</p>
        </div>
      </header>

      <nav className="nav">
        <div className="container">
          <a href="#basic">{t("nav.basic")}</a>
          <a href="#controlled">{t("nav.controlled")}</a>
          <a href="#gradient">{t("nav.gradient")}</a>
          <a href="#range-only">{t("nav.rangeOnly")}</a>
          <a href="#form">{t("nav.form")}</a>
          <a href="#use-cases">{t("nav.useCases")}</a>
        </div>
      </nav>

      <main>
        <BasicDemo />
        <ControlledDemo />
        <GradientDemo />
        <RangeOnlyDemo />
        <FormDemo />
        <UseCasesDemo />
      </main>

      <footer className="footer">
        <div className="container">
          <p>{t("footer.text")}</p>
        </div>
      </footer>
    </>
  );
}
