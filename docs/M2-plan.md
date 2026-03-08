# M2 実装計画: Web Component `<circa-input>`

## コンテキスト

M1（coreパッケージ）が完了し、次のステップとしてWeb Componentの実装に進む。
coreの純粋なTypeScriptロジック（状態管理・バリデーション・計算）を使って、
ブラウザ上で動作する `<circa-input>` カスタム要素を作る。

**ゴール**: HTMLに `<circa-input min="0" max="100">` と書くだけで、マウス/タッチ/キーボードで
「値」と「曖昧さ（マージン）」を入力でき、`change`イベントで`CircaValue`が取れる。

---

## ファイル構成

```
packages/web-component/src/
  attributes.ts       # 属性パース、config構築（純粋関数）
  dom-utils.ts        # 座標変換ユーティリティ（純粋関数）
  styles.ts           # Shadow DOM用CSSテンプレート
  template.ts         # Shadow DOM HTML構築
  circa-input.ts      # メインのHTMLElementクラス
  index.ts            # エクスポート + customElements.define()
  __tests__/
    dom-utils.test.ts
    attributes.test.ts
    circa-input.test.ts
```

各モジュールは単一責務。ビルド時にはtree-shakingで1つのバンドルになる。

---

## Shadow DOM構造

```html
<div part="container" role="group" aria-label="circa input">
  <div part="track">
    <div part="margin" aria-hidden="true"></div>
    <div part="value" role="slider" tabindex="0"
         aria-label="center value"
         aria-valuenow="..." aria-valuemin="..." aria-valuemax="...">
    </div>
    <div part="handle-low" role="slider" tabindex="0"
         aria-label="lower margin" aria-hidden="true">
    </div>
    <div part="handle-high" role="slider" tabindex="0"
         aria-label="upper margin" aria-hidden="true">
    </div>
  </div>
</div>
```

- `track`: クリック領域（水平バー）
- `value`: つまみ（ドラッグ可能）
- `margin`: 曖昧さの帯（視覚的表示）
- `handle-low/high`: 非対称モード時のみ表示

---

## 操作モデル

| 操作 | 結果 |
|------|------|
| トラックをクリック | value設定 |
| つまみを**縦ドラッグ** | margin対称拡縮（下に引くと大きく） |
| ←/→キー | value ±1step（step="any"なら範囲の1%） |
| Shift+←/→ | margin ±1step 対称拡縮 |
| Home/End | value → min/max |
| 非対称ハンドルを**横ドラッグ** | marginLow/marginHigh個別調整 |

**ポインターイベント使用**: mouse/touchを統一。`setPointerCapture`で確実なドラッグ。

---

## Controlled / Uncontrolled

- **Uncontrolled（デフォルト）**: `default-value`等で初期値設定。操作で内部状態が変わる。
- **Controlled**: `value`属性が存在すれば制御モード。イベントは発火するが、外部から属性を更新しないと表示は変わらない。

---

## CSS Custom Properties

| 変数名 | デフォルト |
|--------|-----------|
| `--circa-track-height` | 8px |
| `--circa-track-color` | #e0e0e0 |
| `--circa-track-radius` | 4px |
| `--circa-value-color` | #1976d2 |
| `--circa-margin-color` | rgba(25, 118, 210, 0.2) |
| `--circa-handle-size` | 20px |
| `--circa-handle-color` | #1976d2 |

---

## 実装フェーズと並行実装マップ

### 依存関係図

```
                    ┌──────────────┐
                    │   Phase 1    │
                    │    M2-a      │
                    └──────┬───────┘
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌────────────┐ ┌────────────┐ ┌────────────┐
     │ attributes │ │  dom-utils │ │   styles   │
     │    .ts     │ │    .ts     │ │    .ts     │
     └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
           │              │              │
           │              │         ┌────┘
           │              │         ▼
           │              │    ┌──────────┐
           │              │    │ template │
           │              │    │   .ts    │
           │              │    └────┬─────┘
           │              │         │
           ▼              ▼         ▼
         ┌──────────────────────────────┐
         │       circa-input.ts         │
         │  (メインクラス: M2-a スコープ) │
         └──────────────┬───────────────┘
                        │
                        ▼
                  ┌───────────┐
                  │ index.ts  │
                  └─────┬─────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
     ┌────────────┐ ┌────────┐ ┌────────┐
     │   Phase 2  │ │Phase 3a│ │Phase 3b│
     │    M2-b    │ │ M2-c   │ │ M2-c   │
     │  マージン   │ │非対称   │ │Ctrl/   │
     │  ドラッグ   │ │ハンドル │ │Unctrl  │
     └─────┬──────┘ └───┬────┘ └───┬────┘
           │            │          │
           └────────────┼──────────┘
                        ▼
                  ┌───────────┐
                  │  Phase 4  │
                  │   M2-d    │
                  │フォーム+   │
                  │モバイル    │
                  └───────────┘
```

### 並行実装可能なグループ

#### 🟢 グループA（Phase 1 前半 — 完全並行可能）

以下3ファイルは互いに依存しないため、**同時に実装可能**:

| ファイル | 内容 | 依存 |
|---------|------|------|
| `attributes.ts` | parseNumberAttr, parseBooleanAttr, buildConfig, buildInitialValue | core のみ |
| `dom-utils.ts` | valueToPercent, percentToValue, clientXToPercent | 依存なし |
| `styles.ts` | Shadow DOM CSS テンプレート文字列 | 依存なし |

各ファイルのテスト（`attributes.test.ts`, `dom-utils.test.ts`）も並行で書ける。

#### 🟡 グループB（Phase 1 後半 — グループA完了後）

| ファイル | 内容 | 依存 |
|---------|------|------|
| `template.ts` | Shadow DOM HTML テンプレート | styles.ts |
| `circa-input.ts` | メインクラス（M2-aスコープ） | attributes.ts, dom-utils.ts, template.ts |
| `index.ts` | define + export | circa-input.ts |

`template.ts` は `styles.ts` のみに依存するので、グループAの他の2つが終わる前でも着手可能。

#### 🟢 グループC（Phase 2 + Phase 3 — 部分並行可能）

M2-a完了後、以下は**部分的に並行可能**:

| タスク | 内容 | 依存 |
|--------|------|------|
| M2-b マージンドラッグ | ポインターイベント、マージン帯可視化 | M2-a |
| M2-c 非対称ハンドル | ハンドル表示・ドラッグ | M2-a（M2-bのドラッグパターンを参考にするが、独立実装可能） |
| M2-c Controlled/Uncontrolled | 属性監視と状態分岐 | M2-a |

**注意**: M2-bとM2-cは同じ `circa-input.ts` を変更するため、ファイル単位での完全並行はできない。
ただし**設計・テスト作成**は並行可能。実装の統合はシーケンシャルに行う。

#### 🔴 グループD（Phase 4 — シーケンシャル）

| タスク | 内容 | 依存 |
|--------|------|------|
| M2-d フォーム統合 | ElementInternals, FormData, required | M2-a, M2-c（Controlled実装が必要） |
| M2-d モバイル最適化 | タッチ領域、pointercancel | M2-b（ドラッグ実装が必要） |

これらはPhase 2・3の完了が前提。

---

### セッション分割の推奨

| セッション | 作業内容 | 並行度 |
|-----------|---------|--------|
| **Session 1** | attributes.ts + dom-utils.ts + styles.ts（＋テスト） | ⭐⭐⭐ 3並列 |
| **Session 2** | template.ts → circa-input.ts → index.ts（＋統合テスト） | ⭐ 順次 |
| **Session 3** | M2-b マージンドラッグ + M2-c Controlled/Uncontrolled設計 | ⭐⭐ 2並列（設計のみ） |
| **Session 4** | M2-c 非対称ハンドル + テスト | ⭐ 順次 |
| **Session 5** | M2-d フォーム統合 + モバイル + ビルド検証 | ⭐ 順次 |

---

## 主要設計決定

### ポインターイベント統一
mouse/touchを`PointerEvent`で統一。`setPointerCapture()`でドラッグ中のイベント漏れを防止。

### 縦ドラッグでマージン操作
水平軸はvalue用に使用済み。仕様書の「上下ドラッグ」に合致。
`margin = (deltaPixels / 100) * (max - min)` をベースにscaleFactorで調整。

### ElementInternals for フォーム
`static formAssociated = true` + `attachInternals()` でネイティブフォーム連携。
`setFormValue(JSON.stringify(circaValue))` でFormDataにJSON格納。

### happy-dom for テスト
jsdomよりShadow DOM対応が良い。純粋関数テストを厚くし、統合テストはベストエフォート。

---

## coreから使用する関数

| 関数 | 用途 |
|------|------|
| `createDefaultConfig(overrides)` | 属性 → config変換 |
| `createInitialValue(config)` | 初期状態作成 |
| `updateValue(current, updates, config)` | 操作時の状態更新（snap + sync + clamp） |
| `validateConfig(config)` | config妥当性チェック |
| `checkRequired(circaValue, config)` | フォームバリデーション |

---

## テスト戦略

- **テストランナー**: Vitest + happy-dom
- **追加devDependency**: `happy-dom`
- **テスト数目安**: 約60件

| カテゴリ | 対象 |
|---------|------|
| ユニット | dom-utils.ts, attributes.ts（純粋関数） |
| 統合 | circa-input.ts（要素生成、属性、イベント、ARIA） |
| 手動 | ブラウザ動作確認（M3デモサイトで） |
| サイズ | ビルド後gzip 5KB以下（core+WC合算） |

---

## リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| 縦ドラッグの操作感 | 高 | M2-bで最小実装→手動テスト→scaleFactor調整 |
| happy-domのShadow DOM制限 | 中 | 純粋関数テストを厚く。統合テストはベストエフォート |
| バンドルサイズ超過 | 中 | M2-a後に測定し早期修正 |
| Controlledモードのエッジケース | 中 | native `<input>`のメンタルモデルに従う |

---

## 完了条件

- `pnpm --filter @circa-input/web-component test` 全グリーン
- `pnpm --filter @circa-input/web-component build` 成功
- core + web-component合算 gzip 5KB以下
- ROADMAP.md の M2 チェックボックス更新済み
