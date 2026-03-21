import {
  CircaInput,
  type CircaInputProps,
  type CircaValue,
} from "@circa-input/react";
import { useState } from "react";
import { Section } from "../components/Section";
import { useT } from "../i18n";

function formatTime(value: number): string {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

function formatTimeDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatYen(amount: number): string {
  return `\u00A5${amount.toLocaleString("en-US")}`;
}

function formatWithMargin(
  v: CircaValue,
  centerFn: (val: number) => string,
  marginFn: (m: number) => string,
  rangeFn: (val: number) => string,
  rangeTemplate?: string,
): string {
  if (v.value === null) return "\u2014";
  const center = centerFn(v.value);
  const ml = v.marginLow ?? 0;
  const mh = v.marginHigh ?? 0;
  if (ml === 0 && mh === 0) return center;
  if (ml === mh) return `${center} \u00B1 ${marginFn(ml)}`;
  const low = rangeFn(v.value - ml);
  const high = rangeFn(v.value + mh);
  if (rangeTemplate) {
    return rangeTemplate.replace("{low}", low).replace("{high}", high);
  }
  return `${low} \u2013 ${high}`;
}

interface UseCaseConfig {
  id: string;
  title: string;
  description: string;
  inputProps: Omit<CircaInputProps, "onInput" | "onChange" | "children">;
  formatter: (v: CircaValue) => string;
  initialValue: CircaValue;
}

function UseCaseCard({
  title,
  description,
  inputProps,
  formatter,
  initialValue,
}: Omit<UseCaseConfig, "id">) {
  const [value, setValue] = useState<CircaValue>(initialValue);

  return (
    <div className="use-case-card">
      <h3>{title}</h3>
      <p className="use-case-description">{description}</p>
      <div className="demo-input">
        <CircaInput {...inputProps} onInput={setValue} onChange={setValue} />
      </div>
      <div className="use-case-result">
        <span className="use-case-formatted">{formatter(value)}</span>
      </div>
    </div>
  );
}

export function UseCasesDemo() {
  const t = useT();

  const cases: UseCaseConfig[] = [
    {
      id: "time",
      title: t("useCases.time.title"),
      description: t("useCases.time.description"),
      inputProps: {
        min: 9,
        max: 21,
        step: 0.5,
        tickInterval: 3,
        defaultValue: 14,
        defaultMarginLow: 1,
        defaultMarginHigh: 1,
      },
      formatter: (v: CircaValue) =>
        formatWithMargin(v, formatTime, formatTimeDuration, formatTime),
      initialValue: {
        value: 14,
        marginLow: 1,
        marginHigh: 1,
        distribution: "normal" as const,
        distributionParams: {},
      },
    },
    {
      id: "budget",
      title: t("useCases.budget.title"),
      description: t("useCases.budget.description"),
      inputProps: {
        min: 0,
        max: 100000,
        step: 1000,
        tickInterval: 20000,
        defaultValue: 50000,
        defaultMarginLow: 10000,
        defaultMarginHigh: 10000,
      },
      formatter: (v: CircaValue) =>
        formatWithMargin(v, formatYen, formatYen, formatYen),
      initialValue: {
        value: 50000,
        marginLow: 10000,
        marginHigh: 10000,
        distribution: "normal" as const,
        distributionParams: {},
      },
    },
    {
      id: "temp",
      title: t("useCases.temp.title"),
      description: t("useCases.temp.description"),
      inputProps: {
        min: -10,
        max: 40,
        step: 1,
        tickInterval: 10,
        defaultValue: 25,
        defaultMarginLow: 3,
        defaultMarginHigh: 3,
      },
      formatter: (v: CircaValue) => {
        const degC = (val: number) => `${val}\u00B0C`;
        return formatWithMargin(v, degC, degC, degC);
      },
      initialValue: {
        value: 25,
        marginLow: 3,
        marginHigh: 3,
        distribution: "normal" as const,
        distributionParams: {},
      },
    },
    {
      id: "age",
      title: t("useCases.age.title"),
      description: t("useCases.age.description"),
      inputProps: {
        min: 18,
        max: 65,
        step: 1,
        tickInterval: 10,
        rangeOnly: true,
        defaultValue: 30,
        defaultMarginLow: 5,
        defaultMarginHigh: 10,
      },
      formatter: (v: CircaValue) => {
        const unit = t("format.yearsUnit");
        const withYears = (val: number) => `${val}${unit}`;
        return formatWithMargin(
          v,
          withYears,
          withYears,
          withYears,
          t("format.range"),
        );
      },
      initialValue: {
        value: 30,
        marginLow: 5,
        marginHigh: 10,
        distribution: "normal" as const,
        distributionParams: {},
      },
    },
    {
      id: "meeting",
      title: t("useCases.meeting.title"),
      description: t("useCases.meeting.description"),
      inputProps: {
        min: 15,
        max: 180,
        step: 5,
        tickInterval: 30,
        asymmetric: true,
        gradient: "relative" as const,
        defaultValue: 60,
        defaultMarginLow: 10,
        defaultMarginHigh: 30,
      },
      formatter: (v: CircaValue) => {
        const dur = (m: number) => {
          const h = Math.floor(m / 60);
          const r = m % 60;
          if (h === 0) return `${r}min`;
          if (r === 0) return `${h}h`;
          return `${h}h ${r}min`;
        };
        return formatWithMargin(v, dur, dur, dur);
      },
      initialValue: {
        value: 60,
        marginLow: 10,
        marginHigh: 30,
        distribution: "normal" as const,
        distributionParams: {},
      },
    },
    {
      id: "commute",
      title: t("useCases.commute.title"),
      description: t("useCases.commute.description"),
      inputProps: {
        min: 0,
        max: 60,
        step: 1,
        tickInterval: 10,
        gradient: "absolute" as const,
        defaultValue: 20,
        defaultMarginLow: 5,
        defaultMarginHigh: 5,
      },
      formatter: (v: CircaValue) => {
        const km = (val: number) => `${val}km`;
        return formatWithMargin(v, km, km, km);
      },
      initialValue: {
        value: 20,
        marginLow: 5,
        marginHigh: 5,
        distribution: "normal" as const,
        distributionParams: {},
      },
    },
  ];

  return (
    <Section
      id="use-cases"
      title={t("useCases.title")}
      description={t("useCases.description")}
      alt
    >
      <div className="use-case-grid">
        {cases.map((c) => (
          <UseCaseCard key={c.id} {...c} />
        ))}
      </div>
    </Section>
  );
}
