/**
 * Shadow DOM HTMLテンプレート構築
 *
 * M2-plan.mdで定義されたShadow DOM構造をテンプレートとして返す。
 * 各要素にはCSS ::part() セレクタ用の part 属性と ARIA 属性を付与する。
 */

import { STYLES } from "./styles.js";

/**
 * Shadow DOMの初期HTMLを返す。
 * スタイルとHTML構造をひとまとめにしたテンプレートを生成する。
 */
export function createTemplate(): HTMLTemplateElement {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>${STYLES}</style>
    <div part="container" role="group" aria-label="circa input">
      <div part="track">
        <div part="margin" aria-hidden="true"></div>
        <div part="value" role="slider" tabindex="0"
             aria-label="center value"
             aria-valuenow="" aria-valuemin="" aria-valuemax="">
        </div>
        <div part="handle-low" role="slider" tabindex="0"
             aria-label="lower margin" aria-hidden="true">
        </div>
        <div part="handle-high" role="slider" tabindex="0"
             aria-label="upper margin" aria-hidden="true">
        </div>
      </div>
    </div>
  `;
  return template;
}
