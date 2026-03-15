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
│   ├── spec.md         # 技術仕様（詳細はこちら）
│   ├── ROADMAP.md      # 計画と進捗
│   └── CONTRIB.md      # 開発ガイド
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
- web-componentのReactラッパー（`<circa-input>`タグをReactコンポーネントとして使えるようにする）
- DX向上のためのオプション

### 依存の方向

- coreはweb-componentに依存しない
- web-componentはreactに依存しない
- reactはweb-componentをラップする（coreにも依存してよい。型の再エクスポート等）

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

## Claude Codeの運用ルール

このプロジェクトはオールClaude Codeで進行する。以下のルールを常に守ること。

### 1. 進捗の常時把握

- `docs/ROADMAP.md` がプロジェクト全体の計画書兼進捗記録である
- マイルストーンやタスクが完了したら、ROADMAPの該当チェックボックスを即座に更新する
- 新しいセッション開始時は、まずROADMAPを読んで現在地を把握する

### 2. ドキュメントの即時更新

- 実装中に仕様が変更・追加された場合、`docs/spec.md` を即座に更新する
- coreのpublic APIが変わった場合、このファイルのアーキテクチャ方針も見直す
- 「後で更新」は禁止。コードとドキュメントは常に同期させる

### 3. 解説の丁寧さ

- Taikiはライブラリ開発初心者である
- 実装を進める際は「なぜこうするのか」「この概念・パターンは何か」を省略せず説明する
- 専門用語を使う場合は簡単な補足を添える
- いきなりコードを書かず、何をやろうとしているかを先に説明してから実装に入る

### 4. 信頼できる情報源の優先順

1. `docs/spec.md` — 技術仕様（最優先）
2. `docs/ROADMAP.md` — 計画と進捗
3. `CLAUDE.md` — 運用ルールとアーキテクチャ方針
4. ソースコード — 実装の実態

仕様とコードが食い違っていたら、Taikiに確認する。

---

## 詳細仕様

`docs/spec.md` を参照してください。