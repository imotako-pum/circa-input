# circa-input プロジェクト計画書

---

## ビジョン

ユーザーが「値」と「その曖昧さ」を同時に入力できるUIプリミティブを、
npm公開可能な品質で3パッケージ + デモサイトとして完成させる。

---

## 全体マイルストーン

```
M1        M2            M3          M4            M5
 ●────────●─────────────●───────────●─────────────●
core完成  WC動作        デモ公開    React対応     npm公開準備
```

---

## M1: coreパッケージの完成

**ゴール**: フレームワーク非依存のロジック層が仕様書のすべての要件を満たしている。

**現状**: 基本実装・テスト28件が全グリーン。ビルドも成功。

**残タスク**:
- [x] `step`属性によるスナップ処理（値を刻み幅に丸めるロジック）
- [x] 対称モード連動（`asymmetric=false`時にmarginLow/marginHighを同期）
- [x] 上記に対するテスト追加

**完了条件**:
- `pnpm --filter @circa-input/core test` 全グリーン
- `pnpm --filter @circa-input/core build` 成功
- 仕様書 Section 2〜6 のロジックが全てcoreでカバーされている

---

## M2: Web Componentが動作する

**ゴール**: HTMLに `<circa-input min="0" max="100"></circa-input>` と書くだけで、
マウス/タッチ操作で値と曖昧さを入力でき、`change`イベントで`CircaValue`が取れる。

**サブマイルストーン**:

### M2-a: 最小限の描画と値の設定
- [x] Shadow DOM構造（トラック + 値インジケータ）
- [x] HTML属性バインディング（min, max, value, margin-low, margin-high）
- [x] クリック/タップで`value`を設定
- [x] ARIA属性（role="slider", aria-valuenow等）とキーボード操作（矢印キー）
- [x] CSS Custom Propertiesによるスタイルカスタマイズの基盤

### M2-b: マージン操作
- [x] ドラッグでmarginを対称に拡縮
- [x] マージン領域の可視化（トラック上の範囲表示）
- [x] `input`イベント（操作中リアルタイム）と`change`イベント（操作完了時）の発火

### M2-c: 非対称モードとControlled/Uncontrolled
- [x] `asymmetric=true`時の両端ハンドル
- [x] Controlled属性（value, margin-low, margin-high）とUncontrolled属性（default-*）の両対応

### M2-d: フォーム統合とモバイル
- [x] `name`属性によるFormData連携
- [x] `required`属性によるバリデーション
- [x] タッチイベント対応

**完了条件**:
- ブラウザでHTMLファイルに`<circa-input>`を書いて操作できる
- `change`イベントのdetailに正しい`CircaValue`が入っている
- Controlled/Uncontrolledの両方が動く
- フォーム送信でFormDataにJSONが入る

---

## M3: デモサイト

**ゴール**: 第三者がcirca-inputの動作とコンセプトを理解・体験できるページ。

**現状**: デモサイト実装完了。

**内容**:
- [x] 基本的な使い方（対称モード）
- [x] 非対称モードのデモ
- [x] 各種ユースケース（時間入力、金額入力など）
- [x] イベント出力のリアルタイム表示
- [x] 属性を動的に切り替えるコントロールパネル
- [x] フォーム統合デモ（FormData + requiredバリデーション）

**完了条件**:
- [x] `pnpm dev` でローカルに立ち上がる
- [x] circa-inputを触ったことがない人がページを見て使い方を理解できる

---

## M4: Reactアダプター

**ゴール**: `<CircaInput min={0} max={100} onChange={(v) => ...} />` で使える。

**内容**:
- [x] Web ComponentのReactラッパー
- [x] props → HTML属性の変換
- [x] CustomEvent → Reactコールバックの変換
- [x] Controlled/UncontrolledのReact的なDX
- [x] TypeScript型定義のエクスポート

**完了条件**:
- Reactアプリ内で`<CircaInput>`が正しく動作する
- 型補完が効く
- テストがグリーン

---

## M5: 公開準備

**ゴール**: `npm publish` できる状態。

**内容**:
- 各パッケージのビルド出力確認（ESM + CJS + 型定義）
- package.jsonのmetadata整備（license, repository, keywords等）
- CHANGELOG / README
- CI（lint + test + build）
- [ ] デモサイト日英両対応
  - i18n モジュール（言語切替、翻訳オブジェクト、`t()` 関数）
  - HTML の `data-i18n` 属性化 + `translatePage()` 関数
  - 言語切替 UI（EN / JA トグル）
  - フォーマッター文字列のロケール対応（format.ts）
  - セクションモジュールの動的文字列対応
  - テスト更新（en ロケール用テスト追加）
- [ ] ソースコードコメント英語化（JSDoc・インラインコメント・テスト description）
- [ ] ドキュメント英語化（spec.md, ROADMAP.md, CONTRIB.md）
  - CLAUDE.md は日本語のまま維持

**完了条件**:
- `pnpm build && pnpm test` が全パッケージで成功
- `npm pack --dry-run` で意図したファイルだけが含まれる

---

## 依存関係

```
M1 ──→ M2 ──→ M3
              ↘
               M4 ──→ M5
```

- M2はM1に依存（coreのロジックが完成していないとWeb Componentが作れない）
- M3はM2に依存（Web Componentがないとデモが作れない）
- M4はM2に依存（ラップ対象が必要）、ただしM3と並行可能
- M5は全マイルストーンの完了が前提

---

## アーキテクチャ決定事項

2026-02-23 に以下を決定。詳細は `docs/spec.md` Section 8〜11 を参照。

| 項目 | 決定 | 理由 |
|------|------|------|
| a11y | 最初からしっかり対応（role, ARIA, キーボード操作） | 後付けは構造変更リスク大 |
| CSSカスタマイズ | CSS Custom Properties | シンプルで初心者にも分かりやすい |
| ブラウザ対応 | モダンのみ（最新2バージョン） | Polyfill不要で軽量化 |
| ライセンス | MIT | OSS標準 |
| バンドルサイズ | core + WC合計 gzip 5KB以下 | 軽量ライブラリとしての競争力 |
| React設計 | Web Componentをラップ | 描画ロジック二重管理を避ける |

---

## リスクと未解決課題

| リスク | 影響 | 対策 |
|--------|------|------|
| Web ComponentのUXデザイン | M2の最大の不確実性。「ドラッグでマージンを広げる」操作が直感的になるか | M2-aで最小限を作り、触ってから調整 |
| タッチ操作のUX | デスクトップと同じ操作感にならない可能性 | M2-dで別途設計、仕様書にもモバイル別操作の記載あり |
| `distribution: "skewed"` のUI | 仕様書で未解決課題として明記 | M5以降に先送り可 |
| `distributionParams`の設計 | 仕様書で未解決課題として明記 | M5以降に先送り可 |
| React 18/19の両対応 | Web Component経由で差異が出る可能性 | M4で動作検証 |

---

## 推奨する作業順序

1. **まずM1を片付ける**（小さい。step処理と対称連動の追加のみ）
2. **M2に集中する**（ここがプロジェクトの核心。段階的にa→b→c→dで進める）
3. **M3とM4は並行可能**（M2が終われば独立して進められる）
4. **M5は全体が落ち着いてから**

---

## 進捗ログ

| 日付 | マイルストーン | 内容 |
|------|---------------|------|
| 2026-02-23 | M1 途中 | core基本実装済み（types, state, validation, helpers, errors）。テスト28件全グリーン。ビルド成功。step処理・対称連動が未実装。 |
| 2026-02-23 | M1 完了 | step属性スナップ処理（snapToStep関数）と対称モード連動を実装。テスト45件全グリーン。ビルド成功（gzip 0.97KB）。 |
| 2026-03-08 | M2 完了 | Web Component実装完了。dom-utils/attributes/styles/template/circa-input/indexの6モジュール。Shadow DOM、クリック/キーボード/ドラッグ操作、マージン対称・非対称、Controlled/Uncontrolled、フォーム統合(ElementInternals)、モバイル対応(pointercancel)。テスト72件全グリーン。ビルド成功（gzip 3.79KB、core合算4.76KB < 5KB）。カバレッジ91.2%。 |
| 2026-03-08 | M2 品質改善 | コードレビューで検出したCRITICAL/HIGH 6件・MEDIUM/LOW 8件を全て修正。handle-low/highキーボード操作追加、disabled状態ブロック、validateConfig呼び出し、valueToPercentゼロ除算ガード、--circa-value-color CSS変数追加。lint/type-check全クリア。テスト87件全グリーン。合算gzip 4.95KB < 5KB。 |
| 2026-03-08 | M3 完了 | デモサイト実装完了。5セクション構成（基本操作・非対称モード・ユースケース集・プレイグラウンド・フォーム統合）。セクション分割のモジュール設計（sections/ + utils/）。レスポンシブ対応。ビルド成功。lint/type-checkクリア。全テスト132件グリーン。 |
| 2026-03-15 | M4 完了 | Reactアダプター実装完了。CircaInput コンポーネント（forwardRef + useImperativeHandle）、型定義（CircaInputProps/CircaInputHandle）、camelCase→kebab-case属性マッピング、CustomEvent→コールバック橋渡し、Controlled/Uncontrolled両対応。テスト25件全グリーン。ビルド成功（ESM gzip 0.97KB / CJS gzip 0.83KB）。lint/type-check全クリア。全テスト188件グリーン。 |

---

## 仕様変更履歴

実装中に変更・追加された仕様をここに記録する。`docs/spec.md` への反映も必ず行うこと。

| 日付 | 変更内容 | spec.md反映 |
|------|----------|-------------|
| 2026-02-23 | Section 8〜11 追加（a11y, CSSカスタマイズ, 対応環境, ライセンス） | 済 |
