---
name: doc-sync
description: >
  ドキュメント同期チェッカー。コンポーネント、レイアウト、スライドファイルに変更があった際に
  プロアクティブに発動し、docs/ のドキュメントが最新かチェックする。
  Use proactively after changes to components/, layouts/, styles/, or slides*.md files.
user-invocable: true
allowed-tools: Read, Glob, Grep
---

# doc-sync: ドキュメント鮮度チェック

docs/ 配下のドキュメントがコードベースの現状と一致しているかを軽量チェックする。

## 実行手順

1. **コンポーネントスキャン**: `components/` 配下の `.vue` ファイル一覧を取得
2. **レイアウトスキャン**: `layouts/` 配下の `.vue` ファイル一覧を取得
3. **スタイルスキャン**: `styles/` 配下のファイル一覧を取得
4. **ドキュメント読み込み**: `docs/slidev-knowhow.md` を読み込み
5. **差分検出**: ドキュメントに記載されているコンポーネント/レイアウト名と、実際のファイル一覧を比較

## 判定ロジック

### 差分あり

以下のいずれかに該当する場合:
- `components/` に存在するが `docs/slidev-knowhow.md` に記載がないコンポーネント
- `layouts/` に存在するが `docs/slidev-knowhow.md` に記載がないレイアウト
- `package.json` の scripts と `CLAUDE.md` の Commands セクションに差分

→ ユーザーに報告:

```
ドキュメントの更新が必要です:
- 未記載のコンポーネント: [一覧]
- 未記載のレイアウト: [一覧]

`@doc-maintainer ドキュメントを同期して` で自動更新できます。
```

### 差分なし

→ ユーザーに報告:

```
ドキュメントは最新です。コードベースとの差分はありません。
```

## 注意事項

- このスキルは読取専用（ファイル変更は行わない）
- 更新が必要な場合は doc-maintainer エージェントの利用を提案する
- Slidev プロジェクトが初期化されていない段階（components/ 等が存在しない）では、その旨を報告する
