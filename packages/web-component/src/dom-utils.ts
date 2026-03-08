/**
 * 座標変換ユーティリティ（純粋関数）
 *
 * Web Component内でピクセル座標⇔値の変換を行う。
 * DOM要素には依存しない純粋関数として実装し、テスタビリティを確保する。
 */

/**
 * 値をパーセント位置（0〜100）に変換する。
 * トラック上のインジケータ位置の計算に使う。
 */
export function valueToPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

/**
 * パーセント位置（0〜100）を値に変換する。
 * クリック位置から値を算出するのに使う。
 */
export function percentToValue(percent: number, min: number, max: number): number {
  return (percent / 100) * (max - min) + min;
}

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
