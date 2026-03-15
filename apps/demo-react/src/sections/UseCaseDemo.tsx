import { CircaInput, type CircaValue } from "@circa-input/react";
import { useState } from "react";
import { Section } from "../components/Section";

function formatTime(value: number): string {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

function formatTimeRange(v: CircaValue): string {
  if (v.value === null) return "時間を選択してください";
  const center = formatTime(v.value);
  const low = v.marginLow ?? 0;
  const high = v.marginHigh ?? 0;
  const from = formatTime(v.value - low);
  const to = formatTime(v.value + high);
  return `約${center}（${from}〜${to}）`;
}

export function UseCaseDemo() {
  const [timeDisplay, setTimeDisplay] = useState("約14:00（13:00〜16:00）");

  return (
    <Section
      title="Use Case: 配達時間"
      description="asymmetricモードで「早い方は30分前まで、遅い方は2時間後まで」のような非対称な許容範囲を表現できます。"
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
            onInput={(v) => setTimeDisplay(formatTimeRange(v))}
            onChange={(v) => setTimeDisplay(formatTimeRange(v))}
          />
        </div>

        <div className="use-case-result">
          <span className="use-case-label">配達希望時間:</span>
          <span className="use-case-formatted">{timeDisplay}</span>
        </div>
      </div>
    </Section>
  );
}
