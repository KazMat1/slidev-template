# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Slidev (Markdown-based presentation framework) テンプレートリポジトリ。
Spec-Kit + 専門化 SubAgents でスライド自動生成ワークフローを提供する。

## Commands

- `pnpm dev` — 開発サーバー (port 3030)
- `pnpm build` — 本番ビルド
- `pnpm export` — PDF/PNG エクスポート

## Slidev ナレッジ

@docs/slidev-knowhow.md

## スライドパターン

@docs/slide-patterns.md

## SubAgent ワークフロー

専門化 SubAgents でコンテキスト分離して作業する:

1. **spec-analyst** — 要件分析 → spec.md / plan.md / tasks.md 生成
2. **slide-story-writer** — 箇条書き → ストーリー構成 (story.md) 生成
3. **slide-developer** — ストーリー → Slidev マークダウン生成
4. **slide-reviewer** — 品質チェック（読取専用）
5. **doc-maintainer** — docs/ 配下のドキュメントをコードベースと同期

典型的な流れ:
- フル開発: spec-analyst → slide-story-writer → slide-developer → slide-reviewer
- クイック生成: slide-story-writer → slide-developer → slide-reviewer

## ドキュメント管理

- コンポーネント/レイアウト/スタイルを変更したら `@doc-maintainer` でドキュメントを同期
- `/doc-sync` で現在のドキュメントの鮮度をチェック可能
- docs/ 配下のファイルは手動編集も可能（エージェントは既存内容を保持して追記する）

## Spec-Kit ワークフロー

@docs/speckit-workflow.md

## Branch 命名規則

- 連番: `NNN-short-name`（例: `001-slide-template`）
- タイムスタンプ: `YYYYMMDD-HHMMSS-short-name`

## Sandbox 制約

- HEREDOC 不可 → `commit-helper` / `pr-helper` スキルを使用
- ネットワーク不可 → git push/pull/fetch のみ `dangerouslyDisableSandbox: true`
- ファイル操作は Read/Edit/Write ツールを使用（Bash の cat/sed 等は不可）

## 編集禁止ファイル

- `.claude/settings.json`
- `.claude/hooks/check-sensitive-paths.sh`
