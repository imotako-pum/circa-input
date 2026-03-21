import { CircaInput, type CircaValue } from "@circa-input/react";
import { useState } from "react";
import { Section } from "../components/Section";
import { ValueDisplay } from "../components/ValueDisplay";
import { useT } from "../i18n";

const PRESETS = [
  { label: "50 ± 10", value: 50, marginLow: 10, marginHigh: 10 },
  { label: "75 ± 5", value: 75, marginLow: 5, marginHigh: 5 },
  { label: "25 ± 20", value: 25, marginLow: 20, marginHigh: 20 },
] as const;

const INITIAL = PRESETS[0];

export function ControlledDemo() {
  const t = useT();
  const [value, setValue] = useState<number | null>(INITIAL.value);
  const [marginLow, setMarginLow] = useState<number | null>(INITIAL.marginLow);
  const [marginHigh, setMarginHigh] = useState<number | null>(
    INITIAL.marginHigh,
  );

  const circaValue: CircaValue = {
    value,
    marginLow,
    marginHigh,
    distribution: "normal",
    distributionParams: {},
  };

  const handleInput = (v: CircaValue) => {
    setValue(v.value);
    setMarginLow(v.marginLow);
    setMarginHigh(v.marginHigh);
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setValue(preset.value);
    setMarginLow(preset.marginLow);
    setMarginHigh(preset.marginHigh);
  };

  const reset = () => {
    setValue(INITIAL.value);
    setMarginLow(INITIAL.marginLow);
    setMarginHigh(INITIAL.marginHigh);
  };

  return (
    <Section
      title={t("controlled.title")}
      description={t("controlled.description")}
      alt
    >
      <div id="controlled" className="demo-area">
        <div className="demo-input">
          <CircaInput
            min={0}
            max={100}
            value={value}
            marginLow={marginLow}
            marginHigh={marginHigh}
            onInput={handleInput}
            onChange={handleInput}
          />
        </div>

        <div className="demo-controls">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="btn-primary"
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </button>
          ))}
          <button type="button" className="btn-secondary" onClick={reset}>
            {t("controlled.reset")}
          </button>
        </div>

        <ValueDisplay value={circaValue} />
      </div>
    </Section>
  );
}
