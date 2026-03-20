import { CircaInput, type CircaValue } from "@circa-input/react";
import { useState } from "react";
import { Section } from "../components/Section";
import { ValueDisplay } from "../components/ValueDisplay";
import { useT } from "../i18n";

export function RangeOnlyDemo() {
  const t = useT();
  const [normalValue, setNormalValue] = useState<CircaValue | null>(null);
  const [rangeOnlyValue, setRangeOnlyValue] = useState<CircaValue | null>(null);

  return (
    <Section
      title={t("rangeOnly.title")}
      description={t("rangeOnly.description")}
      alt
    >
      <div id="range-only" className="range-only-comparison">
        <div className="range-only-panel">
          <h3>{t("rangeOnly.normal")}</h3>
          <div className="demo-input">
            <CircaInput
              min={0}
              max={100}
              asymmetric
              defaultValue={50}
              defaultMarginLow={10}
              defaultMarginHigh={20}
              onInput={setNormalValue}
              onChange={setNormalValue}
            />
          </div>
          <ValueDisplay value={normalValue} />
        </div>
        <div className="range-only-panel">
          <h3>{t("rangeOnly.rangeOnly")}</h3>
          <div className="demo-input">
            <CircaInput
              min={0}
              max={100}
              rangeOnly
              gradient="relative"
              defaultValue={50}
              defaultMarginLow={10}
              defaultMarginHigh={20}
              onInput={setRangeOnlyValue}
              onChange={setRangeOnlyValue}
            />
          </div>
          <ValueDisplay value={rangeOnlyValue} />
        </div>
      </div>
    </Section>
  );
}
