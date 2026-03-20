import type { Translations } from "./types";

export const en: Translations = {
  // Hero
  "hero.subtitle":
    "A UI primitive for entering a value and its ambiguity at the same time",
  "hero.description":
    'Traditional UIs force users to enter a single precise value, but what people really mean is "around 2pm" or "about $500".<br />circa-input captures that ambiguity as data.',

  // Nav
  "nav.basic": "Basic",
  "nav.asymmetric": "Asymmetric",
  "nav.gradient": "Gradient",
  "nav.rangeOnly": "Range Only",
  "nav.useCases": "Use Cases",
  "nav.playground": "Playground",
  "nav.form": "Form",

  // Basic section
  "basic.title": "Basic (Symmetric Mode)",
  "basic.description":
    "<strong>Click</strong> to set a value, then <strong>drag up/down</strong> to adjust the margin (tolerance).<br />The margin expands symmetrically.",
  "basic.guide1": "Click on the track to set a value",
  "basic.guide2": "Drag the handle up/down to adjust the margin",

  // Asymmetric section
  "asymmetric.title": "Asymmetric Mode",
  "asymmetric.description":
    'With the <code>asymmetric</code> attribute, you can adjust the lower and upper margins <strong>independently</strong>.<br />Example: "30 minutes before 2pm is OK, but up to 2 hours after is fine."',
  "asymmetric.guide1": "Click to set a value, drag up/down to create margins",
  "asymmetric.guide2":
    "Drag left/right handles independently to adjust each side",

  // Gradient section
  "gradient.title": "Gradient",
  "gradient.description":
    "The <code>gradient</code> attribute adds a visual confidence gradient to the margin area.<br /><strong>relative</strong> fades from center outward, <strong>absolute</strong> maps opacity to the full range.",
  "gradient.relative": "relative",
  "gradient.absolute": "absolute",
  "gradient.intensityLabel": "Intensity",

  // Range Only section
  "rangeOnly.title": "Range Only",
  "rangeOnly.description":
    "The <code>range-only</code> attribute hides the center value handle and shows only the range bar.<br />Useful when the user wants to specify a <strong>range</strong> rather than a point with tolerance.",
  "rangeOnly.normal": "Normal Mode",
  "rangeOnly.rangeOnly": "Range Only Mode",

  // Use cases section
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

  // Playground section
  "playground.title": "Playground",
  "playground.description":
    "Dynamically change attributes to experiment with circa-input behavior.",
  "playground.controls": "Attribute Controls",
  "playground.marginMaxPlaceholder": "No limit",
  "playground.tickIntervalPlaceholder": "None",
  "playground.eventLog": "Event Log",
  "playground.logEmpty": "Events will appear here",
  "playground.clearLog": "Clear Log",
  "playground.gradientNone": "None",

  // Form section
  "form.title": "Form Integration",
  "form.description":
    "With a <code>name</code> attribute, CircaValue is included as a JSON string in the <code>&lt;form&gt;</code>'s FormData.<br />The <code>required</code> attribute enables validation.",
  "form.label": "Preferred delivery time",
  "form.submit": "Submit",
  "form.reset": "Reset",
  "form.resultLabel": "Submission Result (FormData)",
  "form.resultPlaceholder": "Submit the form to see results",
  "form.resultEmpty":
    "FormData is empty (no value entered or missing name attribute)",
  "form.resultReset": "Submit the form to see results",

  // Common
  "common.outputLabel": "CircaValue",
  "common.notYetOperated": "Not yet operated",

  // Footer
  "footer.text":
    "circa-input \u2014 A UI primitive that captures ambiguity as data",

  // Format strings
  "format.unset": "Not set",
  "format.hourUnit": "{h}h",
  "format.minuteUnit": "{m}min",
  "format.hourMinute": "{h}h {m}min",
  "format.range": "{low} \u2013 {high}",
  "format.yearsUnit": " years",
  "format.kmUnit": "km",
};
