import { CircaInput, type CircaValue } from "@circa-input/react";
import { useState } from "react";
import { Section } from "../components/Section";
import { ValueDisplay } from "../components/ValueDisplay";
import { useT } from "../i18n";

export function GradientDemo() {
  const t = useT();
  const [intensity, setIntensity] = useState(1.5);
  const [relativeValue, setRelativeValue] = useState<CircaValue | null>(null);
  const [absoluteValue, setAbsoluteValue] = useState<CircaValue | null>(null);

  return (
    <Section
      id="gradient"
      title={t("gradient.title")}
      description={t("gradient.description")}
    >
      <div className="gradient-comparison">
        <div className="gradient-panel">
          <h3>{t("gradient.relative")}</h3>
          <div className="demo-input">
            <CircaInput
              min={0}
              max={100}
              gradient="relative"
              gradientIntensity={intensity}
              asymmetric
              defaultValue={50}
              defaultMarginLow={15}
              defaultMarginHigh={30}
              onInput={setRelativeValue}
              onChange={setRelativeValue}
            />
          </div>
          <ValueDisplay value={relativeValue} />
        </div>
        <div className="gradient-panel">
          <h3>{t("gradient.absolute")}</h3>
          <div className="demo-input">
            <CircaInput
              min={0}
              max={100}
              gradient="absolute"
              gradientIntensity={intensity}
              asymmetric
              defaultValue={50}
              defaultMarginLow={15}
              defaultMarginHigh={30}
              onInput={setAbsoluteValue}
              onChange={setAbsoluteValue}
            />
          </div>
          <ValueDisplay value={absoluteValue} />
        </div>
      </div>
      <div className="intensity-control">
        <label htmlFor="gradient-intensity">
          {t("gradient.intensityLabel")}
        </label>
        <input
          type="range"
          id="gradient-intensity"
          min={0.5}
          max={5}
          step={0.1}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
        />
        <span className="intensity-value">{intensity.toFixed(1)}</span>
      </div>
    </Section>
  );
}
