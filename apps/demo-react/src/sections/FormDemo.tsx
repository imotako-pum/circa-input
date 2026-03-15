import { CircaInput } from "@circa-input/react";
import { type FormEvent, useState } from "react";
import { Section } from "../components/Section";

interface FormResult {
  entries: [string, string][];
}

export function FormDemo() {
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
    <Section
      title="Form Integration"
      description="name属性を設定すると、CircaValueがJSON文字列としてFormDataに含まれます。"
    >
      <div id="form" className="demo-area">
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <div className="form-field">
            <label htmlFor="customer-name">顧客名</label>
            <input
              type="text"
              id="customer-name"
              name="customer_name"
              placeholder="山田太郎"
            />
          </div>

          <div className="form-field">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: circa-input is a custom element, htmlFor cannot target it */}
            <label>配達時間（9:00〜21:00）</label>
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
            <label>予算（0〜100,000円）</label>
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
              送信
            </button>
            <button type="reset" className="btn-secondary">
              リセット
            </button>
          </div>
        </form>

        {result && (
          <div className="form-result">
            <div className="form-result-label">送信結果（FormData）</div>
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
