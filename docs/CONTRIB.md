# 開発ガイド（CONTRIB.md）

circa-input の開発に参加するための手順とルールをまとめたドキュメント。

---

## 前提条件

- **Node.js**: >= 18
- **パッケージマネージャ**: pnpm

---

## セットアップ

```bash
git clone <repo>
cd circa-input
pnpm install
pnpm build
```

---

## 利用可能なスクリプト

### ルート（モノレポ全体）

| コマンド | 説明 |
|---|---|
| `pnpm build` | 全パッケージをビルド |
| `pnpm test` | 全パッケージのテストを実行 |
| `pnpm dev` | 全パッケージをwatchモードでビルド |
| `pnpm lint` | Biomeによる静的解析 |
| `pnpm lint:fix` | Biomeによる自動修正 |
| `pnpm format` | Biomeによるフォーマット |
| `pnpm type-check` | 全パッケージのTypeScript型チェック |

### @circa-input/core

| コマンド | 説明 |
|---|---|
| `pnpm --filter @circa-input/core build` | coreをビルド |
| `pnpm --filter @circa-input/core test` | coreのテストを実行 |
| `pnpm --filter @circa-input/core test:watch` | coreのテストをwatchモードで実行 |
| `pnpm --filter @circa-input/core dev` | coreをwatchモードでビルド |
| `pnpm --filter @circa-input/core type-check` | coreの型チェック |

### @circa-input/web-component

| コマンド | 説明 |
|---|---|
| `pnpm --filter @circa-input/web-component build` | web-componentをビルド |
| `pnpm --filter @circa-input/web-component test` | web-componentのテストを実行 |
| `pnpm --filter @circa-input/web-component dev` | web-componentをwatchモードでビルド |
| `pnpm --filter @circa-input/web-component type-check` | web-componentの型チェック |

---

## テスト

- **フレームワーク**: Vitest
- **web-componentのテスト環境**: happy-dom（Shadow DOMサポート）
- **カバレッジ**: `@vitest/coverage-v8`

```bash
# 全テスト実行
pnpm test

# カバレッジ付き
pnpm --filter @circa-input/web-component test -- --coverage
```

---

## リンター・フォーマッター

**Biome** を使用。設定は `biome.json`。

```bash
# チェックのみ
pnpm lint

# 自動修正
pnpm lint:fix
```

主なルール:
- `noExplicitAny`: error（`any`型の使用禁止）
- インデント: スペース2
- 行幅: 80文字
- クォート: ダブルクォート
- セミコロン: 必須

---

## ブランチ戦略

| ブランチ | 用途 |
|---|---|
| `main` | リリース用 |
| `develop` | 開発統合 |
| `feature/*` | 機能開発 |
| `fix/*` | バグ修正 |

---

## パッケージ構成

```
circa-input/
├── packages/
│   ├── core/           # 純粋TSロジック（DOM非依存）
│   └── web-component/  # <circa-input> カスタム要素
├── docs/
│   ├── spec.md         # 技術仕様書（最優先の情報源）
│   ├── ROADMAP.md      # 計画と進捗
│   └── CONTRIB.md      # このファイル
├── CLAUDE.md           # Claude Code運用ルール
└── biome.json          # リンター/フォーマッター設定
```

### 依存の方向

```
core ← web-component ← react（未実装）
```

- core は他パッケージに依存しない
- web-component は core に依存する
- react は web-component をラップする（将来）

---

## バンドルサイズ制約

| パッケージ | 目標（gzip） |
|---|---|
| @circa-input/core | 1KB以下 |
| core + web-component 合算 | 5KB以下 |

ビルド後に `dist/index.js` の gzip サイズを確認すること。

---

## コーディング規則

- `any` 型の使用禁止
- public APIには型定義 + JSDocコメント必須
- エラーは `CircaInputError` カスタムクラスを使用
- テスト必須（特にバリデーションロジック）
- 詳細は `CLAUDE.md` を参照
