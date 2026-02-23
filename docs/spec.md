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

### 非対称操作（asymmetric=true時）

1. 最初のドラッグで対称なmarginを設定
2. 両端にハンドルが表示される
3. 各ハンドルを独立してドラッグしてmarginLow・marginHighを個別に調整

### モバイル対応

- ハンドルはタップで選択状態にしてからドラッグ
- デスクトップとモバイルで操作が異なるが、出力されるデータ構造は同一

---

## 8. 実装優先順位

1. `packages/core` — ロジックとバリデーション
2. `packages/web-component` — `<circa-input>`タグの実装
3. `apps/demo` — 動作確認用デモ
4. `packages/react` — Reactアダプター

---

## 9. 未解決・将来課題

- [ ] `distribution: "skewed"` のUIをどう実現するか
- [ ] `distributionParams`の具体的な中身の設計
- [ ] 複数フィールド間の相関をどう扱うか
- [ ] Vue・Svelteアダプターの実装