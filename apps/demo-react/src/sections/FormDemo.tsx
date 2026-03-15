import { CircaInput } from "@circa-input/react";
import { type FormEvent, useState } from "react";
import { Section } from "../components/Section";
import { useT } from "../i18n";

interface FormResult {
  entries: [string, string][];
}

export function FormDemo() {
  const t = useT();
  const [result, setResult] = useState<FormResult | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const entries: [string, string][] = [];
    for (const [key, val] of fd.entries()) {
      entries.push([key, String(val)]);
    }
    setResult({ entries });
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <Section title={t("form.title")} description={t("form.description")}>
      <div id="form" className="demo-area">
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <div className="form-field">
            <label htmlFor="customer-name">{t("form.customerName")}</label>
            <input
              type="text"
              id="customer-name"
              name="customer_name"
              placeholder={t("form.customerNamePlaceholder")}
            />
          </div>

          <div className="form-field">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: circa-input is a custom element, htmlFor cannot target it */}
            <label>{t("form.deliveryTime")}</label>
            <CircaInput
              name="delivery_time"
              min={9}
              max={21}
              step={1}
              required
              defaultValue={14}
              defaultMarginLow={1}
              defaultMarginHigh={1}
            />
          </div>

          <div className="form-field">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: circa-input is a custom element, htmlFor cannot target it */}
            <label>{t("form.budget")}</label>
            <CircaInput
              name="budget"
              min={0}
              max={100000}
              step={1000}
              tickInterval={20000}
              defaultValue={50000}
              defaultMarginLow={10000}
              defaultMarginHigh={10000}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {t("form.submit")}
            </button>
            <button type="reset" className="btn-secondary">
              {t("form.reset")}
            </button>
          </div>
        </form>

        {result && (
          <div className="form-result">
            <div className="form-result-label">{t("form.resultLabel")}</div>
            <div className="form-result-entries">
              {result.entries.map(([key, val]) => {
                let display: string;
                try {
                  const parsed = JSON.parse(val);
                  display = JSON.stringify(parsed, null, 2);
                } catch {
                  display = val;
                }
                return (
                  <div key={key} className="form-result-entry">
                    <span className="form-result-key">{key}</span>
                    <pre className="form-result-value">{display}</pre>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
