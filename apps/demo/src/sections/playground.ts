import type { CircaValue } from "@circa-input/core";
import { requireById, requireElement } from "../utils/dom";
import { formatCircaValue } from "../utils/format";

const MAX_LOG_ENTRIES = 30;

/**
 * マージン表示文字列を生成（対称/非対称対応）
 */
function formatMarginForLog(detail: CircaValue): string {
  if (detail.marginLow === null) return "";
  if (detail.marginLow === detail.marginHigh) {
    return `\u00B1${detail.marginLow.toFixed(1)}`;
  }
  return `-${detail.marginLow.toFixed(1)}/+${(detail.marginHigh ?? 0).toFixed(1)}`;
}

/**
 * コントロールパネルをcirca-input要素にバインドする
 */
function setupControls(input: HTMLElement): void {
  const ctrlMin = requireById<HTMLInputElement>("ctrl-min", "playground");
  const ctrlMax = requireById<HTMLInputElement>("ctrl-max", "playground");
  const ctrlStep = requireById<HTMLInputElement>("ctrl-step", "playground");
  const ctrlMarginMax = requireById<HTMLInputElement>(
    "ctrl-margin-max",
    "playground",
  );
  const ctrlAsymmetric = requireById<HTMLInputElement>(
    "ctrl-asymmetric",
    "playground",
  );
  const ctrlDisabled = requireById<HTMLInputElement>(
    "ctrl-disabled",
    "playground",
  );

  const updateAttribute = (name: string, value: string | null) => {
    if (value === null || value === "") {
      input.removeAttribute(name);
    } else {
      input.setAttribute(name, value);
    }
  };

  ctrlMin.addEventListener("input", () => {
    updateAttribute("min", ctrlMin.value);
  });

  ctrlMax.addEventListener("input", () => {
    updateAttribute("max", ctrlMax.value);
  });

  ctrlStep.addEventListener("input", () => {
    const val = ctrlStep.value.trim();
    updateAttribute("step", val === "" ? "any" : val);
  });

  ctrlMarginMax.addEventListener("input", () => {
    updateAttribute("margin-max", ctrlMarginMax.value.trim() || null);
  });

  ctrlAsymmetric.addEventListener("change", () => {
    if (ctrlAsymmetric.checked) {
      input.setAttribute("asymmetric", "");
    } else {
      input.removeAttribute("asymmetric");
    }
  });

  ctrlDisabled.addEventListener("change", () => {
    if (ctrlDisabled.checked) {
      input.setAttribute("disabled", "");
    } else {
      input.removeAttribute("disabled");
    }
  });
}

/**
 * CircaValue出力の表示をバインドする
 */
function setupOutput(input: HTMLElement, outputEl: HTMLElement): void {
  const handleUpdate = (e: Event) => {
    const detail = (e as CustomEvent<CircaValue>).detail;
    outputEl.textContent = formatCircaValue(detail);
  };

  input.addEventListener("input", handleUpdate);
  input.addEventListener("change", handleUpdate);
}

/**
 * イベントログを管理する
 */
function setupEventLog(
  input: HTMLElement,
  logEl: HTMLElement,
  clearBtn: HTMLButtonElement,
): void {
  let logCleared = false;

  const addLogEntry = (type: "input" | "change", detail: CircaValue) => {
    if (!logCleared) {
      while (logEl.firstChild) {
        logEl.removeChild(logEl.firstChild);
      }
      logCleared = true;
    }

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;

    const entry = document.createElement("div");
    entry.className = "log-entry";

    const timeSpan = document.createElement("span");
    timeSpan.className = "log-time";
    timeSpan.textContent = time;

    const typeSpan = document.createElement("span");
    typeSpan.className = `log-type ${type === "input" ? "log-type-input" : "log-type-change"}`;
    typeSpan.textContent = type;

    const valueStr = detail.value !== null ? detail.value.toFixed(1) : "null";
    const marginStr = formatMarginForLog(detail);

    entry.appendChild(timeSpan);
    entry.appendChild(document.createTextNode(" "));
    entry.appendChild(typeSpan);
    entry.appendChild(
      document.createTextNode(` value=${valueStr} ${marginStr}`),
    );

    logEl.prepend(entry);

    // 古いエントリを削除
    while (logEl.children.length > MAX_LOG_ENTRIES) {
      const last = logEl.lastElementChild;
      if (last) logEl.removeChild(last);
    }
  };

  input.addEventListener("input", (e: Event) => {
    addLogEntry("input", (e as CustomEvent<CircaValue>).detail);
  });

  input.addEventListener("change", (e: Event) => {
    addLogEntry("change", (e as CustomEvent<CircaValue>).detail);
  });

  clearBtn.addEventListener("click", () => {
    while (logEl.firstChild) {
      logEl.removeChild(logEl.firstChild);
    }
    const empty = document.createElement("div");
    empty.className = "log-empty";
    empty.textContent = "イベントがここに表示されます";
    logEl.appendChild(empty);
    logCleared = false;
  });
}

/**
 * Section 4: プレイグラウンドの初期化
 */
export function initPlaygroundSection(): void {
  const input = requireById("playground-input", "playground");
  const outputEl = requireElement<HTMLElement>(
    "#playground-output .output-value",
    "playground",
  );
  const logEl = requireById("event-log", "playground");
  const clearBtn = requireById<HTMLButtonElement>("clear-log", "playground");

  setupControls(input);
  setupOutput(input, outputEl);
  setupEventLog(input, logEl, clearBtn);
}
