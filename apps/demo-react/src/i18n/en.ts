import type { Translations } from "./types";

export const en: Translations = {
  "hero.title": "circa-input React Demo",
  "hero.subtitle": "Usage demo for the @circa-input/react package",

  "nav.basic": "Basic",
  "nav.controlled": "Controlled",
  "nav.form": "Form",
  "nav.useCase": "Use Case",

  "basic.title": "Basic (Uncontrolled)",
  "basic.description":
    "Basic usage: retrieve circa-input values with the useRef pattern.",
  "basic.readValue": "Read Value",
  "basic.clear": "Clear",

  "controlled.title": "Controlled",
  "controlled.description":
    "Controlled mode: manage values with useState for real-time synchronization.",
  "controlled.reset": "Reset",

  "form.title": "Form Integration",
  "form.description":
    "Setting the name attribute includes CircaValue as a JSON string in FormData.",
  "form.customerName": "Customer Name",
  "form.customerNamePlaceholder": "John Doe",
  "form.deliveryTime": "Delivery Time (9:00–21:00)",
  "form.budget": "Budget (0–100,000 yen)",
  "form.submit": "Submit",
  "form.reset": "Reset",
  "form.resultLabel": "Submission Result (FormData)",

  "useCase.title": "Use Case: Delivery Time",
  "useCase.description":
    'Asymmetric mode allows non-symmetric tolerance ranges, e.g. "30 min early is OK, but up to 2 hours late is fine."',
  "useCase.label": "Preferred delivery time:",
  "useCase.placeholder": "Select a time",
  "useCase.approx": "Around {center} ({from} – {to})",

  "common.unset": "Not set",

  "footer.text": "circa-input — A UI primitive that captures ambiguity as data",
};
