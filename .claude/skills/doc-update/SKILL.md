---
name: doc-update
description: >
  docs/ 配下のドキュメントをコードベースと同期する。
  doc-maintainer エージェントを起動してドキュメントを自動更新する。
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# doc-update: ドキュメント自動更新

doc-maintainer エージェントを Task ツールで起動し、docs/ 配下のドキュメントをコードベースと同期する。

## 実行手順

1. Task ツールで doc-maintainer エージェントを起動:

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "ドキュメント同期"
  prompt: |
    あなたは doc-maintainer です。以下の手順でドキュメントを同期してください。

    1. components/, layouts/, styles/, pages/ をスキャン
    2. docs/ 配下の各ドキュメントを読み込み
    3. 差分を検出
    4. 差分がある場合、ドキュメントを更新（既存内容は保持して追記・修正）
    5. 更新箇所ごとのサマリーを出力

    同期対象:
    - docs/slidev-knowhow.md ↔ components/, layouts/
    - docs/slide-patterns.md ↔ 実際のスライドパターン
    - docs/speckit-workflow.md ↔ .claude/commands/speckit.*.md
    - CLAUDE.md の Commands ↔ package.json の scripts
```

2. doc-maintainer の結果をユーザーに報告

## 関連

- `/doc-sync` — 読取専用の鮮度チェック（このスキルの前段として使用可能）
- `doc-maintainer` エージェント — 実際の更新処理を担当
