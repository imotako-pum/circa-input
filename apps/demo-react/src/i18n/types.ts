export interface Translations {
  // Hero
  "hero.title": string;
  "hero.subtitle": string;

  // Nav
  "nav.basic": string;
  "nav.controlled": string;
  "nav.form": string;
  "nav.useCase": string;

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

  // Use case section
  "useCase.title": string;
  "useCase.description": string;
  "useCase.label": string;
  "useCase.placeholder": string;
  "useCase.approx": string;

  // Common
  "common.unset": string;

  // Footer
  "footer.text": string;
}

export type TranslationKey = keyof Translations;

export type Locale = "ja" | "en";
