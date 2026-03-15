# circa-input — 技術仕様書

---

## 1. コンセプト

ユーザーが「値」と「その曖昧さ」を同時に入力できるUIプリミティブ。

`circa`はラテン語由来で「約〜」を意味する。従来の入力UIが強制する「偽の精度」を解消し、人間の自然な曖昧さをそのままデータ化する。

| 変数 | 意味 | 操作 |
|------|------|------|
| **value (μ)** | 中心値 | クリック/タップ位置 |
| **marginLow** | 下側の許容幅 | 左/下方向へのドラッグ |
| **marginHigh** | 上側の許容幅 | 右/上方向へのドラッグ |

---

## 2. データ構造

### 出力型（CircaValue）

```typescript
type Distribution = "normal" | "uniform" | "skewed";

interface CircaValue {
  value: number | null;
  marginLow: number | null;
  marginHigh: number | null;
  distribution: Distribution;
  distributionParams: Record<string, unknown>;
}
```

### 初期状態（未入力）

```json
{
  "value": null,
  "marginLow": null,
  "marginHigh": null,
  "distribution": "normal",
  "distributionParams": {}
}
```

### 入力済み例（対称）

```json
{
  "value": 14.0,
  "marginLow": 1.0,
  "marginHigh": 1.0,
  "distribution": "normal",
  "distributionParams": {}
}
```

### 入力済み例（非対称）

```json
{
  "value": 14.0,
  "marginLow": 0.5,
  "marginHigh": 2.0,
  "distribution": "normal",
  "distributionParams": {}
}
```

### 入力済み例（片側無制限）

```json
{
  "value": 14.0,
  "marginLow": 0,
  "marginHigh": Infinity,
  "distribution": "normal",
  "distributionParams": {}
}
```

---

## 3. 属性仕様

### 必須属性

| 属性 | 型 | 説明 |
|------|----|------|
| `min` | number | 選択可能な最小値 |
| `max` | number | 選択可能な最大値 |

### Controlled用属性

外部から値を管理する場合に使用。指定した場合はコンポーネント内部の状態より優先される。

| 属性 | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `value` | number \| null | null | 中心値 |
| `margin-low` | number \| null | null | 下側許容幅 |
| `margin-high` | number \| null | null | 上側許容幅 |

### Uncontrolled用属性

コンポーネント内部で状態を管理する場合に使用。

| 属性 | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `default-value` | number \| null | null | 初期中心値 |
| `default-margin-low` | number \| null | null | 初期下側許容幅 |
| `default-margin-high` | number \| null | null | 初期上側許容幅 |

### オプション属性

| 属性 | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `margin-max` | number \| null | null | 許容幅の最大値（null=制限なし） |
| `distribution` | string | "normal" | 分布の形状 |
| `asymmetric` | boolean | false | trueで非対称UI開放 |
| `step` | number \| "any" | "any" | 値の刻み幅 |
| `name` | string \| null | null | フォーム統合用 |
| `required` | boolean | false | 必須バリデーション |

---

## 4. イベント仕様

### change

操作完了時（mouseup / touchend）に発火。

```typescript
element.addEventListener('change', (e: CustomEvent<CircaValue>) => {
  console.log(e.detail);
  // { value: 14.0, marginLow: 0.5, marginHigh: 2.0, distribution: "normal", distributionParams: {} }
});
```

### input

操作中リアルタイムで発火（mousemove / touchmove）。

```typescript
element.addEventListener('input', (e: CustomEvent<CircaValue>) => {
  console.log(e.detail); // changeと同じ型
});
```

---

## 5. バリデーション仕様

| ケース | 対処 | 理由 |
|--------|------|------|
| `value < min` または `value > max` | エラーをthrow | 開発者のミス |
| `marginLow` または `marginHigh` が負 | エラーをthrow | 意味をなさない |
| margin適用後の値がmin/maxをはみ出す | クランプ（自動調整） | ユーザー操作で自然に発生する |
| `margin-max`を超えるmargin | クランプ | ユーザー操作で自然に発生する |
| `required=true` かつ `value=null` | バリデーションエラー | フォーム送信時に検出 |

---

## 6. フォーム統合

`name`属性を指定した場合、FormDataにJSON文字列として含まれる。

```html
<form>
  <circa-input name="delivery_time" min="9" max="21" />
</form>
```

```
// FormData送信時
delivery_time={"value":14.0,"marginLow":0.5,"marginHigh":2.0,"distribution":"normal","distributionParams":{}}
```

### 後方互換ヘルパー

バックエンドがcirca-inputに未対応の場合、valueのみ取り出すヘルパーを提供する。

```typescript
import { toPlainValue } from "@circa-input/core";

const plain = toPlainValue(circaValue); // 14.0
```

---

## 7. ユーザー操作仕様

### 基本操作（対称モード）

| 操作 | 結果 |
|------|------|
| クリック / タップ | valueを設定 |
| 上下ドラッグ | marginLow・marginHighを対称に拡張 |
| ×ボタン / `Delete`キー | 値をクリアして未入力状態に戻す |

### 非対称操作（asymmetric=true時）

中央つまみの上下ドラッグと両端ハンドルで、marginLow・marginHighを個別に調整する。

| 操作 | 結果 |
|------|------|
| 中央つまみを上ドラッグ | marginLow（左側の許容幅）を拡大 |
| 中央つまみを下ドラッグ | marginHigh（右側の許容幅）を拡大 |
| handle-low（左端ハンドル）を左右ドラッグ | marginLowを個別に調整 |
| handle-high（右端ハンドル）を左右ドラッグ | marginHighを個別に調整 |

#### キーボード操作（非対称モード）

| キー | 動作 |
|------|------|
| `Shift + ↑` / `Shift + ←` | marginLowを1step拡大 |
| `Shift + ↓` / `Shift + →` | marginHighを1step拡大 |

### モバイル対応

- ハンドルはタップで選択状態にしてからドラッグ
- デスクトップとモバイルで操作が異なるが、出力されるデータ構造は同一

---

## 8. アクセシビリティ（a11y）

最初からしっかり対応する。後付けは構造変更のリスクが高い。

### ARIA

- `<circa-input>` は `role="group"` で全体を囲む
- 内部のvalue操作部分は `role="slider"` + `aria-valuenow` / `aria-valuemin` / `aria-valuemax`
- margin操作ハンドル（非対称時）もそれぞれ `role="slider"`
- `aria-label` で「中心値」「下側許容幅」「上側許容幅」を区別

### キーボード操作

| キー | 動作 |
|------|------|
| `Tab` | コンポーネントにフォーカス移動 |
| `←` / `→` | valueを1step増減（step="any"の場合は範囲の1%） |
| `Shift + ←` / `Shift + →` | marginを対称に拡縮 |
| `Home` / `End` | valueをmin / maxに設定 |
| `Delete` / `Backspace` | 値をクリアして未入力状態に戻す |

### スクリーンリーダー

- 値変更時に `aria-valuenow` を更新し、変更を通知する
- 読み上げ例：「14、プラスマイナス1」

---

## 9. CSSカスタマイズ

Shadow DOM内部のスタイルはCSS Custom Propertiesで外部からカスタマイズ可能にする。

### 提供するCSS変数（初期設計）

| 変数名 | デフォルト | 説明 |
|--------|-----------|------|
| `--circa-track-height` | `8px` | トラックの高さ |
| `--circa-track-color` | `#e0e0e0` | トラックの色 |
| `--circa-track-radius` | `4px` | トラックの角丸 |
| `--circa-value-color` | `#1976d2` | 値インジケータの色 |
| `--circa-margin-color` | `rgba(25, 118, 210, 0.2)` | マージン領域の色 |
| `--circa-handle-size` | `20px` | ハンドルのサイズ |
| `--circa-handle-color` | `#1976d2` | ハンドルの色 |
| `--circa-clear-color` | `#999` | クリアボタンの色 |
| `--circa-clear-hover-color` | `#666` | クリアボタンのホバー色 |

※ 実装中に必要に応じて変数を追加する。追加時はこの表も更新すること。

---

## 10. 対応環境

### ブラウザ

モダンブラウザの最新2バージョンのみ。Polyfillは使用しない。

- Chrome / Edge（最新2バージョン）
- Firefox（最新2バージョン）
- Safari（最新2バージョン）

### バンドルサイズ目標

| パッケージ | 目標（gzip） |
|-----------|-------------|
| @circa-input/core | 1KB以下 |
| @circa-input/core + @circa-input/web-component | 5KB以下 |

---

## 11. ライセンス

MIT

---

## 12. 実装優先順位

1. `packages/core` — ロジックとバリデーション
2. `packages/web-component` — `<circa-input>`タグの実装
3. `apps/demo` — 動作確認用デモ
4. `packages/react` — Reactアダプター

---

## 13. 未解決・将来課題

- [ ] `distribution: "skewed"` のUIをどう実現するか
- [ ] `distributionParams`の具体的な中身の設計
- [ ] 複数フィールド間の相関をどう扱うか
- [ ] Vue・Svelteアダプターの実装