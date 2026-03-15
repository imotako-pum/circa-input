/**
 * 座標変換ユーティリティ（純粋関数）
 *
 * Web Component内でピクセル座標⇔値の変換を行う。
 * DOM要素には依存しない純粋関数として実装し、テスタビリティを確保する。
 *
 * valueToPercent / percentToValue は @circa-input/core に定義されており、
 * ここからre-exportしている。
 */

export { percentToValue, valueToPercent } from "@circa-input/core";

/**
 * クライアントX座標をトラック上のパーセント位置に変換する。
 * トラックの左端=0%, 右端=100%。範囲外は0〜100にクランプ。
 */
export function clientXToPercent(
  clientX: number,
  trackLeft: number,
  trackWidth: number,
): number {
  if (trackWidth <= 0) return 0;
  const raw = ((clientX - trackLeft) / trackWidth) * 100;
  return Math.min(Math.max(raw, 0), 100);
}
