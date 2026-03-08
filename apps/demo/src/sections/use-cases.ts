import type { CircaValue } from "@circa-input/core";
import { formatBudget, formatTemp, formatTime } from "../utils/format";

interface UseCaseConfig {
  inputId: string;
  outputId: string;
  formatter: (v: CircaValue) => string;
}

const useCases: UseCaseConfig[] = [
  { inputId: "uc-time", outputId: "uc-time-output", formatter: formatTime },
  {
    inputId: "uc-budget",
    outputId: "uc-budget-output",
    formatter: formatBudget,
  },
  { inputId: "uc-temp", outputId: "uc-temp-output", formatter: formatTemp },
];

/**
 * Section 3: ユースケース集の初期化
 */
export function initUseCasesSection(): void {
  for (const uc of useCases) {
    const input = document.getElementById(uc.inputId) as HTMLElement;
    const outputEl = document.querySelector(
      `#${uc.outputId} .use-case-formatted`,
    ) as HTMLElement;

    const handleEvent = (e: Event) => {
      const detail = (e as CustomEvent<CircaValue>).detail;
      outputEl.textContent = uc.formatter(detail);
    };

    input.addEventListener("input", handleEvent);
    input.addEventListener("change", handleEvent);
  }
}
