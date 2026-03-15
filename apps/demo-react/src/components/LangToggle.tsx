import type { Locale } from "../i18n";
import { useLocale } from "../i18n";

const LOCALES: Locale[] = ["en", "ja"];

export function LangToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="lang-toggle" role="radiogroup" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          className={`lang-btn${l === locale ? " active" : ""}`}
          aria-pressed={l === locale}
          onClick={() => setLocale(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
