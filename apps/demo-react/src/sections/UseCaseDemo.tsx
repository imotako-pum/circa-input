import { CircaInput, type CircaValue } from "@circa-input/react";
import { useState } from "react";
import { Section } from "../components/Section";
import { useT } from "../i18n";

function formatTime(value: number): string {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

function formatTimeRange(
  v: CircaValue,
  template: string,
  placeholder: string,
): string {
  if (v.value === null) return placeholder;
  const center = formatTime(v.value);
  const low = v.marginLow ?? 0;
  const high = v.marginHigh ?? 0;
  const from = formatTime(v.value - low);
  const to = formatTime(v.value + high);
  return template
    .replace("{center}", center)
    .replace("{from}", from)
    .replace("{to}", to);
}

export function UseCaseDemo() {
  const t = useT();
  const [circaValue, setCircaValue] = useState<CircaValue>({
    value: 14,
    marginLow: 1,
    marginHigh: 2,
    distribution: "normal",
    distributionParams: {},
  });

  const timeDisplay = formatTimeRange(
    circaValue,
    t("useCase.approx"),
    t("useCase.placeholder"),
  );

  const handleUpdate = (v: CircaValue) => {
    setCircaValue(v);
  };

  return (
    <Section
      title={t("useCase.title")}
      description={t("useCase.description")}
      alt
    >
      <div id="use-case" className="demo-area">
        <div className="demo-input">
          <CircaInput
            min={9}
            max={21}
            step={0.5}
            asymmetric
            tickInterval={3}
            defaultValue={14}
            defaultMarginLow={1}
            defaultMarginHigh={2}
            onInput={handleUpdate}
            onChange={handleUpdate}
          />
        </div>

        <div className="use-case-result">
          <span className="use-case-label">{t("useCase.label")}</span>
          <span className="use-case-formatted">{timeDisplay}</span>
        </div>
      </div>
    </Section>
  );
}
