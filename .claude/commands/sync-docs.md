コードとドキュメントの整合性をチェックしてください。

## チェック手順

### 1. coreのpublic APIチェック
- `packages/core/src/index.ts` のexportを読む
- `docs/spec.md` のデータ構造・属性仕様と比較する
- 食い違い（exportされているがspec.mdに記載なし、またはその逆）を報告する

### 2. 型定義チェック
- `packages/core/src/types.ts` の `CircaValue` と `CircaInputConfig` を読む
- `docs/spec.md` Section 2, 3 の定義と比較する
- フィールドの追加・削除・型の変更がないか確認する

### 3. ROADMAP整合性チェック
- `docs/ROADMAP.md` の残タスクリストを確認
- 実際のコード状態（実装済みかどうか）と照合する
- 完了済みなのにチェックされていないタスクを報告する

### 4. CLAUDE.mdチェック
- `CLAUDE.md` のディレクトリ構成が実際のファイル構造と一致しているか確認する

## 出力
- 「問題なし」または「不整合あり」を明確に報告する
- 不整合がある場合は、修正方法を提案し、ユーザーの承認を得てから修正する
