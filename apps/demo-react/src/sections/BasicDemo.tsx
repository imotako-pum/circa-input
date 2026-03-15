import {
  CircaInput,
  type CircaInputHandle,
  type CircaValue,
} from "@circa-input/react";
import { useRef, useState } from "react";
import { Section } from "../components/Section";
import { ValueDisplay } from "../components/ValueDisplay";
import { useT } from "../i18n";

export function BasicDemo() {
  const t = useT();
  const ref = useRef<CircaInputHandle>(null);
  const [displayValue, setDisplayValue] = useState<CircaValue | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (type: string, v: CircaValue) => {
    const entry = `[${type}] value=${v.value}, margin=${v.marginLow}/${v.marginHigh}`;
    setLog((prev) => [entry, ...prev].slice(0, 10));
  };

  return (
    <Section title={t("basic.title")} description={t("basic.description")}>
      <div id="basic" className="demo-area">
        <div className="demo-input">
          <CircaInput
            ref={ref}
            min={0}
            max={100}
            defaultValue={50}
            defaultMarginLow={10}
            onChange={(v) => addLog("change", v)}
            onInput={(v) => addLog("input", v)}
          />
        </div>

        <div className="demo-controls">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (ref.current) setDisplayValue(ref.current.circaValue);
            }}
          >
            {t("basic.readValue")}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              ref.current?.clear();
              setDisplayValue(null);
            }}
          >
            {t("basic.clear")}
          </button>
        </div>

        <ValueDisplay value={displayValue} />

        {log.length > 0 && (
          <div className="event-log">
            <div className="event-log-label">Event Log</div>
            {log.map((entry, i) => (
              <div key={`${i}-${entry}`} className="event-log-entry">
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
