/**
 * Shadow DOM HTMLテンプレート構築
 */
import { STYLES } from "./styles.js";

/**
 * キャッシュされたテンプレート。初回のみ生成し、以降はcloneNodeで再利用する。
 * NOTE: innerHTML は静的な固定文字列のみを使用しており、
 * ユーザー入力は含まれないためXSSリスクはない。
 */
let cachedTemplate: HTMLTemplateElement | null = null;

/** Shadow DOMの初期HTMLテンプレートを返す。モジュールスコープでキャッシュし再利用する。 */
export function createTemplate(): HTMLTemplateElement {
  if (cachedTemplate) return cachedTemplate;

  const template = document.createElement("template");
  // 静的な固定HTML文字列のみ使用（ユーザー入力は含まない）
  template.innerHTML = `<div part="container" role="group" aria-label="circa input"><div part="track"><div part="margin" aria-hidden="true"></div><div part="value" role="slider" tabindex="0" aria-label="center value" aria-valuenow="" aria-valuemin="" aria-valuemax=""></div><div part="handle-low" role="slider" tabindex="-1" aria-label="lower margin" aria-hidden="true"></div><div part="handle-high" role="slider" tabindex="-1" aria-label="upper margin" aria-hidden="true"></div></div><button part="clear" type="button" tabindex="0" aria-label="clear value" style="display:none">\u00D7</button></div>`;

  const style = document.createElement("style");
  style.textContent = STYLES;
  template.content.prepend(style);

  cachedTemplate = template;
  return template;
}
