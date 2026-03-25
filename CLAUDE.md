# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Slidev (Markdown-based presentation framework) テンプレートリポジトリ。
SDD (Spec-Driven Development) + 専門化 SubAgents でスライド自動生成ワークフローを提供する。

## Commands

- `pnpm dev` — 開発サーバー (port 3030)
- `pnpm build` — 本番ビルド
- `pnpm export` — PDF/PNG エクスポート

## Slidev ナレッジ

@docs/reference/slidev-knowhow.md

## SDD ワークフロー

`/sdd` コマンドで 7 フェーズの Spec-Driven Development を実行（推奨）。

サブコマンド（パイプライン外で個別実行可能）:
- `/sdd-constitution` — Constitution の作成・更新
- `/sdd-analyze {spec-name}` — 整合性分析（読取専用）
- `/sdd-review [spec-name]` — スライドレビュー（読取専用）

ドキュメント管理: `/doc-sync` (チェック), `/doc-update` (更新)

個別 SubAgents: spec-analyst, slide-story-writer, slide-developer, slide-reviewer, doc-maintainer

## 成果物の配置

```
docs/specs/{spec-name}/
├── requirements.md           # 要件
├── checklists/               # 品質チェックリスト
├── research.md               # リサーチ
├── design.md                 # 設計
└── tasks.md                  # 実装計画
```

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

## Active Technologies
- TypeScript 5.x / Node.js v18+ (001-monorepo-slide-generator)

## Recent Changes
- 001-monorepo-slide-generator: Added TypeScript 5.x / Node.js v18+
