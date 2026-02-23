# CLAUDE.md — circa-input Project

このファイルはClaude Codeが作業を開始する際に必ず最初に読む指示書です。

---

## プロジェクト概要

**circa-input** は、ユーザーが「値」と「その曖昧さ」を同時に入力できるUIプリミティブです。

`circa`はラテン語由来で「約〜」を意味します。従来のUIはユーザーに「点」での入力を強制しますが（例：配達時間=14:00）、人間の本音は「14時前後」「5万円くらい」といった曖昧さを含みます。circa-inputはこの曖昧さをそのままデータ化します。

---

## ディレクトリ構成

```
circa-input/
├── packages/
│   ├── core/           # Vanilla TS コアロジック（フレームワーク非依存）
│   ├── web-component/  # Web Components実装（<circa-input>タグ）
│   └── react/          # Reactアダプター（@circa-input/react）
├── apps/
│   └── demo/           # デモサイト
├── docs/
│   └── spec.md         # 技術仕様（詳細はこちら）
├── CLAUDE.md           # このファイル
└── package.json        # モノレポルート（pnpm workspaces）
```

---

## パッケージ名

```
@circa-input/core
@circa-input/web-component
@circa-input/react
```

---

## アーキテクチャ方針

### 3層構造を厳守する

**層1：core**
- フレームワーク非依存の純粋なTypeScript
- 状態管理・バリデーション・計算ロジックのみ
- DOMに一切触れない

**層2：web-component**
- coreを使ってWeb Componentsを実装
- `<circa-input>`タグとして任意の環境で動作
- React・Vue・Svelteすべてで使える

**層3：react（およびその他フレームワーク）**
- web-componentのReactラッパー
- DX向上のためのオプション

### 層をまたいだ依存を作らない

- coreはweb-componentに依存しない
- web-componentはreactに依存しない
- reactはcoreに直接依存してよい（web-componentを経由しなくてよい）

---

## 技術スタック

- **言語**：TypeScript（strict mode）
- **パッケージ管理**：pnpm workspaces
- **ビルド**：Vite（各パッケージ）
- **テスト**：Vitest
- **デモ**：Vite + Vanilla TS（フレームワークなし）

---

## コーディング規則

- `any`型は使用禁止
- すべてのpublic APIに型定義とJSDocコメントを付ける
- エラーはカスタムエラークラスを使う（`CircaInputError`）
- テストを必ず書く（特にバリデーションロジック）

---

## 作業の進め方

1. **まずcoreから実装する**（web-component・reactは後）
2. 新しいパッケージを作る前に`docs/spec.md`を参照する
3. public APIを変更する場合は必ずTaikiに確認する（破壊的変更になる可能性があるため）

---

## 詳細仕様

`docs/spec.md` を参照してください。