# circa-input

[![npm](https://img.shields.io/npm/v/@circa-input/web-component)](https://www.npmjs.com/package/@circa-input/web-component)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@circa-input/web-component)](https://bundlephobia.com/package/@circa-input/web-component)
[![CI](https://github.com/imotako-pum/circa-input/actions/workflows/ci.yml/badge.svg)](https://github.com/imotako-pum/circa-input/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

[English](./README.md)

**1つの入力。1アクション。値と曖昧さを同時に。** 数値だけでなく「その数値がどのくらいあいまいか」まで、1つのUIコンポーネントで入力できます。

```
従来の入力:    「何時がいい？」 →  14:00          （正確すぎる嘘）
circa-input:   「何時がいい？」 →  14:00 ± 1時間   （正直な答え）
```

> *circa*（ラテン語）：「約〜」「およそ」

**[デモ](https://imotako-pum.github.io/circa-input/)** · **[Reactデモ](https://imotako-pum.github.io/circa-input/react/)**

![circa-input デモ](./docs/assets/demo.gif)

## なぜ circa-input？

人間は範囲で考えます。「14時前後」「5万円くらい」「通勤20〜30分」。スライダー2本、min/maxの入力欄、数値フィールド＋許容幅フィールド——既存のパーツを組み合わせれば同じことはできます。でもそれは複数のコントロール、複数の操作、そして分かりにくいUXです。

**circa-input は、それを1つで実現します。** クリックで値を決め、端をドラッグして曖昧さを表現。1コンポーネント、1ジェスチャーで、出力は構造化データ（`値 ± マージン`）。マッチング、フィルタリング、最適化にそのまま使えます。

- **配達時間** — 2つのドロップダウンではなく、1回のドラッグで「14時〜16時の間」
- **予算** — minフィールドとmaxフィールドではなく「50万円 ± 10万円」
- **通勤距離** — 追加コントロールなしで「20分がいいけど30分まではOK」を非対称マージンで表現

## 特徴

- **値＋曖昧さ** — 「14:00」ではなく「14:00 ± 1時間」を1つの入力で表現
- **対称・非対称マージン** — 均等な許容範囲、または上下独立したマージン
- **Web Component** — どのフレームワークでも動作（React, Vue, Svelte, 素のHTML）
- **Reactアダプター** — `<CircaInput>` でReactネイティブに使用可能
- **フォーム連携** — ネイティブの `<form>` / FormData と統合
- **アクセシブル** — キーボード操作とARIA対応
- **カスタマイズ可能** — 14個のCSS Custom Propertiesでスタイル変更
- **軽量** — Core約1.3KB、Web Component約6.7KB（gzip）

![circa-input ユースケース](./docs/assets/demo-use-cases.png)

## インストール

```bash
# Web Component（任意のフレームワークで動作）
npm install @circa-input/web-component

# React
npm install @circa-input/react
```

## クイックスタート

### Web Component

```html
<script type="module">
  import "@circa-input/web-component";
</script>

<circa-input min="0" max="100"></circa-input>

<script>
  document.querySelector("circa-input")
    .addEventListener("change", (e) => {
      console.log(e.detail);
      // { value: 42, marginLow: 5, marginHigh: 5, distribution: "normal", distributionParams: {} }
    });
</script>
```

### CDN（ビルド不要）

```html
<script src="https://unpkg.com/@circa-input/web-component"></script>
<circa-input min="0" max="24" step="1" tick-interval="6"></circa-input>
```

### React

```tsx
import { CircaInput } from "@circa-input/react";

function App() {
  return (
    <CircaInput
      min={0}
      max={100}
      onChange={(circaValue) => console.log(circaValue)}
    />
  );
}
```

## データ構造

circa-input は `CircaValue` を出力します：

```typescript
interface CircaValue {
  value: number | null;       // 中心値
  marginLow: number | null;   // 下側の許容幅
  marginHigh: number | null;  // 上側の許容幅
  distribution: "normal" | "uniform";
  distributionParams: DistributionParams;
}
```

**例：** ユーザーが「14あたり」を±1の許容幅で選択した場合：

```json
{ "value": 14, "marginLow": 1, "marginHigh": 1, "distribution": "normal", "distributionParams": {} }
```

> `distribution` と `distributionParams` は将来の拡張用です。現在は常に `"normal"` と `{}` がデフォルトです。

## パッケージ

| パッケージ | 説明 | サイズ (gzip) |
|-----------|------|-------------|
| [`@circa-input/core`](./packages/core) | フレームワーク非依存のコアロジック | ~1.3KB |
| [`@circa-input/web-component`](./packages/web-component) | `<circa-input>` カスタム要素 | ~6.7KB |
| [`@circa-input/react`](./packages/react) | Reactアダプター (`<CircaInput>`) | ~1.1KB |

<details>
<summary><strong>APIリファレンス</strong></summary>

### 属性

| 属性 | 型 | デフォルト | 説明 |
|------|------|---------|------|
| `min` | number | 0 | 選択可能な最小値 |
| `max` | number | 100 | 選択可能な最大値 |
| `value` | number | — | 中心値（制御モード） |
| `margin-low` | number | — | 下側マージン（制御モード） |
| `margin-high` | number | — | 上側マージン（制御モード） |
| `default-value` | number | — | 初期中心値（非制御モード） |
| `default-margin-low` | number | — | 初期下側マージン（非制御モード） |
| `default-margin-high` | number | — | 初期上側マージン（非制御モード） |
| `step` | number \| `"any"` | `"any"` | 値の粒度 |
| `margin-max` | number | — | マージンの最大サイズ |
| `asymmetric` | boolean | `false` | 上下独立マージンを有効化 |
| `initial-margin` | number \| null | `null` | 初回クリック時に自動適用されるマージン（[自動マージン](#自動マージン)参照） |
| `name` | string | — | フォームフィールド名 |
| `required` | boolean | `false` | フォームバリデーション |
| `disabled` | boolean | `false` | コンポーネントを無効化 |
| `no-clear` | boolean | `false` | クリアボタンを非表示 |
| `tick-interval` | number | — | 目盛りの間隔 |

### 自動マージン

ユーザーが初めてトラックをクリックすると、circa-input は `(max - min) / 10` のマージンを自動的に適用します。これは「人間の入力は本質的にあいまいである」というコアの思想を反映しています。

- **デフォルト:** `initial-margin` は `null` → `(max - min) / 10` を自動計算
- **カスタム:** `initial-margin="5"` → 常にマージン5を適用
- **無効化:** `initial-margin="0"` → マージンなしのポイント値

```html
<!-- デフォルト: (100-0)/10 = 10 の自動マージン -->
<circa-input min="0" max="100"></circa-input>

<!-- 自動マージンなし -->
<circa-input min="0" max="100" initial-margin="0"></circa-input>

<!-- カスタム自動マージン: 5 -->
<circa-input min="0" max="100" initial-margin="5"></circa-input>
```

### イベント

| イベント | 型 | 発火タイミング |
|---------|------|------------|
| `change` | `CustomEvent<CircaValue>` | 操作終了時（mouseup/touchend） |
| `input` | `CustomEvent<CircaValue>` | 操作中（mousemove/touchmove） |

### キーボード操作

| キー | 動作 |
|------|------|
| `←` / `→` | 値を1ステップ調整 |
| `Shift + ←` / `Shift + →` | マージンを拡大/縮小 |
| `Home` / `End` | 最小値/最大値にジャンプ |
| `Delete` / `Backspace` | 値をクリア |

### CSSカスタマイズ

| 変数名 | デフォルト | 説明 |
|---|---|---|
| `--circa-track-height` | `8px` | トラックの高さ |
| `--circa-track-color` | `#e0e0e0` | トラックの背景色 |
| `--circa-track-radius` | `4px` | トラックの角丸 |
| `--circa-value-color` | `#1976d2` | 値インジケーターの色 |
| `--circa-margin-color` | `rgba(25,118,210,0.2)` | マージンエリアの色 |
| `--circa-handle-size` | `20px` | ハンドルの直径 |
| `--circa-handle-color` | `#1976d2` | ハンドルの色 |
| `--circa-clear-color` | `#bbb` | クリアボタンの色 |
| `--circa-clear-hover-color` | `#888` | クリアボタンのhover色 |
| `--circa-tick-height` | `6px` | 目盛り線の高さ |
| `--circa-tick-width` | `1px` | 目盛り線の幅 |
| `--circa-tick-color` | `#999` | 目盛り線の色 |
| `--circa-tick-label-size` | `10px` | 目盛りラベルのフォントサイズ |
| `--circa-tick-label-color` | `#666` | 目盛りラベルの色 |

```css
circa-input {
  --circa-track-height: 8px;
  --circa-track-color: #e0e0e0;
  --circa-track-radius: 4px;
  --circa-value-color: #1976d2;
  --circa-margin-color: rgba(25, 118, 210, 0.2);
  --circa-handle-size: 20px;
  --circa-handle-color: #1976d2;
}
```

### フォーム連携

```html
<form>
  <circa-input name="delivery_time" min="9" max="21"></circa-input>
  <button type="submit">送信</button>
</form>
```

値はFormDataにJSON文字列として送信されます。プレーンな数値が必要なバックエンド向け：

```typescript
import { toPlainValue } from "@circa-input/core";

const plain = toPlainValue(circaValue); // 14.0
```

</details>

## ブラウザサポート

Chrome, Firefox, Safari, Edge の最新2バージョン。

## 開発

```bash
pnpm install    # 依存パッケージのインストール
pnpm build      # 全パッケージのビルド
pnpm test       # テスト実行
pnpm dev        # ウォッチモード
pnpm lint       # Biomeでリント

# デモをローカルで起動
pnpm --filter demo dev
```

## ライセンス

MIT
