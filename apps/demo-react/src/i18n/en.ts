import type { Translations } from "./types";

export const en: Translations = {
  "hero.title": "circa-input React Demo",
  "hero.subtitle": "Usage demo for the @circa-input/react package",

  "nav.basic": "Basic",
  "nav.controlled": "Controlled",
  "nav.gradient": "Gradient",
  "nav.rangeOnly": "Range Only",
  "nav.form": "Form",
  "nav.useCases": "Use Cases",

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

  "gradient.title": "Gradient",
  "gradient.description":
    "The gradient prop adds a visual confidence gradient to the margin area. Compare relative vs absolute mode.",
  "gradient.relative": "relative",
  "gradient.absolute": "absolute",
  "gradient.intensityLabel": "Intensity",

  "rangeOnly.title": "Range Only",
  "rangeOnly.description":
    "The rangeOnly prop hides the center value handle and shows only the range bar. Useful for specifying a range rather than a point with tolerance.",
  "rangeOnly.normal": "Normal Mode",
  "rangeOnly.rangeOnly": "Range Only Mode",

  "useCases.title": "Use Cases",
  "useCases.description":
    "circa-input can be used in various scenarios to input approximate values.",
  "useCases.time.title": "Delivery Time",
  "useCases.time.description": "Specify your preferred delivery time window",
  "useCases.budget.title": "Budget",
  "useCases.budget.description": "Enter an approximate budget",
  "useCases.temp.title": "Temperature",
  "useCases.temp.description": "Comfortable temperature range",
  "useCases.age.title": "Age Range",
  "useCases.age.description": "Specify the target age group",
  "useCases.meeting.title": "Meeting Duration",
  "useCases.meeting.description": "Estimate how long the meeting will take",
  "useCases.commute.title": "Commute Distance",
  "useCases.commute.description": "Your commute distance range",

  "format.yearsUnit": " years",
  "format.range": "{low} \u2013 {high}",

  "common.unset": "Not set",

  "footer.text": "circa-input — A UI primitive that captures ambiguity as data",
};
