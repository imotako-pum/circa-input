/**
 * Shadow DOM HTMLテンプレート構築
 */
import { STYLES } from "./styles.js";

/** Shadow DOMの初期HTMLを返す。スタイルはtextContentで安全に挿入する。 */
export function createTemplate(): HTMLTemplateElement {
  const template = document.createElement("template");
  template.innerHTML = `<div part="container" role="group" aria-label="circa input"><div part="track"><div part="margin" aria-hidden="true"></div><div part="value" role="slider" tabindex="0" aria-label="center value" aria-valuenow="" aria-valuemin="" aria-valuemax=""></div><div part="handle-low" role="slider" tabindex="-1" aria-label="lower margin" aria-hidden="true"></div><div part="handle-high" role="slider" tabindex="-1" aria-label="upper margin" aria-hidden="true"></div></div></div>`;

  const style = document.createElement("style");
  style.textContent = STYLES;
  template.content.prepend(style);

  return template;
}
