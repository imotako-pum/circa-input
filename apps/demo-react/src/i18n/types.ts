export interface Translations {
  // Hero
  "hero.title": string;
  "hero.subtitle": string;

  // Nav
  "nav.basic": string;
  "nav.controlled": string;
  "nav.gradient": string;
  "nav.rangeOnly": string;
  "nav.form": string;
  "nav.useCases": string;

  // Basic section
  "basic.title": string;
  "basic.description": string;
  "basic.readValue": string;
  "basic.clear": string;

  // Controlled section
  "controlled.title": string;
  "controlled.description": string;
  "controlled.reset": string;

  // Form section
  "form.title": string;
  "form.description": string;
  "form.customerName": string;
  "form.customerNamePlaceholder": string;
  "form.deliveryTime": string;
  "form.budget": string;
  "form.submit": string;
  "form.reset": string;
  "form.resultLabel": string;

  // Gradient section
  "gradient.title": string;
  "gradient.description": string;
  "gradient.relative": string;
  "gradient.absolute": string;
  "gradient.intensityLabel": string;

  // Range Only section
  "rangeOnly.title": string;
  "rangeOnly.description": string;
  "rangeOnly.normal": string;
  "rangeOnly.rangeOnly": string;

  // Use cases section
  "useCases.title": string;
  "useCases.description": string;
  "useCases.time.title": string;
  "useCases.time.description": string;
  "useCases.budget.title": string;
  "useCases.budget.description": string;
  "useCases.temp.title": string;
  "useCases.temp.description": string;
  "useCases.age.title": string;
  "useCases.age.description": string;
  "useCases.meeting.title": string;
  "useCases.meeting.description": string;
  "useCases.commute.title": string;
  "useCases.commute.description": string;

  // Format
  "format.yearsUnit": string;
  "format.range": string;

  // Common
  "common.unset": string;

  // Footer
  "footer.text": string;
}

export type TranslationKey = keyof Translations;

export type Locale = "ja" | "en";
