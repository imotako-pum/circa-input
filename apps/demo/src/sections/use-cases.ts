import type { CircaValue } from "@circa-input/core";
import { requireById, requireElement } from "../utils/dom";
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
    const input = requireById(uc.inputId, "use-cases");
    const outputEl = requireElement<HTMLElement>(
      `#${uc.outputId} .use-case-formatted`,
      "use-cases",
    );

    const handleEvent = (e: Event) => {
      const detail = (e as CustomEvent<CircaValue>).detail;
      outputEl.textContent = uc.formatter(detail);
    };

    input.addEventListener("input", handleEvent);
    input.addEventListener("change", handleEvent);
  }
}
