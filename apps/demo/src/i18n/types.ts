export interface Translations {
  // Hero
  "hero.subtitle": string;
  "hero.description": string;

  // Nav
  "nav.basic": string;
  "nav.asymmetric": string;
  "nav.useCases": string;
  "nav.playground": string;
  "nav.form": string;

  // Basic section
  "basic.title": string;
  "basic.description": string;
  "basic.guide1": string;
  "basic.guide2": string;

  // Asymmetric section
  "asymmetric.title": string;
  "asymmetric.description": string;
  "asymmetric.guide1": string;
  "asymmetric.guide2": string;

  // Use cases section
  "useCases.title": string;
  "useCases.description": string;
  "useCases.time.title": string;
  "useCases.time.description": string;
  "useCases.budget.title": string;
  "useCases.budget.description": string;
  "useCases.temp.title": string;
  "useCases.temp.description": string;

  // Playground section
  "playground.title": string;
  "playground.description": string;
  "playground.controls": string;
  "playground.marginMaxPlaceholder": string;
  "playground.tickIntervalPlaceholder": string;
  "playground.eventLog": string;
  "playground.logEmpty": string;
  "playground.clearLog": string;

  // Form section
  "form.title": string;
  "form.description": string;
  "form.label": string;
  "form.submit": string;
  "form.reset": string;
  "form.resultLabel": string;
  "form.resultPlaceholder": string;
  "form.resultEmpty": string;
  "form.resultReset": string;

  // Common
  "common.outputLabel": string;
  "common.notYetOperated": string;

  // Footer
  "footer.text": string;

  // Format strings
  "format.unset": string;
  "format.hourUnit": string;
  "format.minuteUnit": string;
  "format.hourMinute": string;
  "format.range": string;
}

export type TranslationKey = keyof Translations;

export type Locale = "ja" | "en";
