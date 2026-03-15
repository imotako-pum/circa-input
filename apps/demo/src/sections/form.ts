import { t } from "../i18n";
import { requireById, requireElement } from "../utils/dom";

/**
 * Section 5: フォーム統合の初期化
 */
export function initFormSection(): void {
  const form = requireById<HTMLFormElement>("demo-form", "form");
  const resultEl = requireElement<HTMLElement>(
    "#form-result .output-value",
    "form",
  );

  form.addEventListener("submit", (e: Event) => {
    e.preventDefault();

    const formData = new FormData(form);
    const entries: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      entries[key] = String(value);
    }

    if (Object.keys(entries).length === 0) {
      resultEl.textContent = t("form.resultEmpty");
      return;
    }

    // delivery_timeのJSONをパースして見やすく表示
    const output: string[] = [];
    for (const [key, value] of Object.entries(entries)) {
      try {
        const parsed = JSON.parse(value);
        output.push(`${key}: ${JSON.stringify(parsed, null, 2)}`);
      } catch {
        output.push(`${key}: ${value}`);
      }
    }

    resultEl.textContent = output.join("\n\n");
  });

  form.addEventListener("reset", () => {
    resultEl.textContent = t("form.resultReset");
  });
}
