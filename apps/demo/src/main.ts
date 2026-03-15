// Register the Web Component (importing triggers customElements.define)
import "@circa-input/web-component";

import type { Locale } from "./i18n";
import { getLocale, initI18n, setLocale } from "./i18n";

// Section initializers
import { initAsymmetricSection } from "./sections/asymmetric";
import { initBasicSection } from "./sections/basic";
import { initFormSection } from "./sections/form";
import { initPlaygroundSection } from "./sections/playground";
import {
  initUseCasesSection,
  updateUseCasesOutput,
} from "./sections/use-cases";

/**
 * Set up the language toggle buttons.
 */
function setupLangToggle(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".lang-btn");

  const updateActive = (locale: Locale) => {
    for (const btn of buttons) {
      btn.classList.toggle("active", btn.dataset.lang === locale);
    }
  };

  updateActive(getLocale());

  for (const btn of buttons) {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang as Locale;
      setLocale(lang);
      updateActive(lang);
      updateUseCasesOutput();
    });
  }
}

// Initialize after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initI18n();
  setupLangToggle();
  initBasicSection();
  initAsymmetricSection();
  initUseCasesSection();
  initPlaygroundSection();
  initFormSection();
});
