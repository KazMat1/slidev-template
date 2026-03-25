PR #$ARGUMENTS をレビューしてください。

## 手順
1. `gh pr view $ARGUMENTS` でPR情報を確認
2. `gh pr diff $ARGUMENTS` で差分を確認
3. CLAUDE.mdのアーキテクチャと注意点に照らしてレビュー
4. レビュー結果をまとめて報告

## レビュー観点
- セキュリティ（SQLインジェクション、認証・認可）
- バグ（Null参照、型エラー、エラーハンドリング）
- パフォーマンス（N+1クエリ、不要なデータ取得）
- OpenAPI定義との整合性（`validateResponses: true` が有効なため、レスポンス不一致は500エラーになる）
- CLAUDE.md準拠（entityToItem登録、application.ts登録、DI配線など）
- マイグレーションの安全性（ロールバック定義の有無）
- テストの有無と品質

## レビュー結果フォーマット
- **概要**: PR全体の変更内容を1-2文で要約
- **問題点**: 重大度（Critical / Warning / Info）付きで列挙
- **改善提案**: 具体的なコード修正案
