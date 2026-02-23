/**
 * 分布の形状を表す型
 */
export type Distribution = "normal" | "uniform" | "skewed";

/**
 * circa-inputの出力値。中心値と曖昧さを含むデータ構造。
 */
export interface CircaValue {
  /** 中心値（未入力時はnull） */
  value: number | null;
  /** 下側の許容幅（未入力時はnull） */
  marginLow: number | null;
  /** 上側の許容幅（未入力時はnull） */
  marginHigh: number | null;
  /** 分布の形状 */
  distribution: Distribution;
  /** 分布パラメータ（将来拡張用） */
  distributionParams: Record<string, unknown>;
}

/**
 * circa-inputの設定
 */
export interface CircaInputConfig {
  /** 選択可能な最小値 */
  min: number;
  /** 選択可能な最大値 */
  max: number;
  /** 許容幅の最大値（nullで制限なし） */
  marginMax: number | null;
  /** 分布の形状 */
  distribution: Distribution;
  /** 非対称UIの許可 */
  asymmetric: boolean;
  /** 値の刻み幅 */
  step: number | "any";
  /** フォーム統合用の名前 */
  name: string | null;
  /** 必須バリデーション */
  required: boolean;
}
