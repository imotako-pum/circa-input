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

interface ResolvedUseCase {
  input: HTMLElement;
  outputEl: HTMLElement;
  formatter: (v: CircaValue) => string;
}

let resolvedCases: ResolvedUseCase[] = [];

/**
 * Section 3: Bind event listeners for use cases. Called once.
 */
export function initUseCasesSection(): void {
  resolvedCases = useCases.map((uc) => {
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

    return { input, outputEl, formatter: uc.formatter };
  });
}

/**
 * Re-render use case formatted output with the current locale.
 * Called on language change.
 */
export function updateUseCasesOutput(): void {
  for (const { input, outputEl, formatter } of resolvedCases) {
    const currentValue = (input as unknown as { circaValue: CircaValue })
      .circaValue;
    if (currentValue && currentValue.value !== null) {
      outputEl.textContent = formatter(currentValue);
    }
  }
}
