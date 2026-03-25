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

## スライドパターン

@docs/reference/slide-patterns.md

## SubAgent ワークフロー

### `/sdd` コマンド（推奨）

統一的な Spec-Driven Development コマンド。7フェーズを順に実行し、各フェーズの重い処理を SubAgent に委譲:

1. 事前準備 → プロジェクトドキュメント読み込み
2. 要件定義 → `spec-analyst` SubAgent で requirements.md 作成 + 明確化ループ
3. 設計 → `spec-analyst` SubAgent で research.md + design.md 作成
4. 実装計画 → `spec-analyst` SubAgent で tasks.md 作成
5. 整合性分析 → `spec-analyst` SubAgent で要件・設計・タスクの整合性チェック
6. 実装 → `slide-developer` SubAgent でスライド生成 + `slide-reviewer` でレビュー
7. 完了 → GitHub Issues 変換（オプション）+ `doc-maintainer` でドキュメント同期

### `/sdd-*` サブコマンド

`/sdd` パイプライン外で個別フェーズを独立実行できるコマンド:

- `/sdd-constitution` — プロジェクト Constitution の作成・更新（spec 不要、パイプライン外）
- `/sdd-analyze {spec-name}` — 要件・設計・タスクの整合性分析（読取専用、Phase 5 相当）
- `/sdd-review [spec-name]` — slides.md の品質レビュー（読取専用、Phase 6b 相当）

### 個別 SubAgents

専門化 SubAgents は `/sdd` から自動的に呼ばれるが、個別利用も可能:

- **spec-analyst** — 要件分析・設計・タスク分割・整合性分析
- **slide-story-writer** — 箇条書き → ストーリー構成 (story.md) 生成
- **slide-developer** — ストーリー → Slidev マークダウン生成
- **slide-reviewer** — 品質チェック・仕様分析レビュー（読取専用）
- **doc-maintainer** — docs/ 配下のドキュメントをコードベースと同期

## ドキュメント管理

- `/doc-sync` で現在のドキュメントの鮮度をチェック
- `/doc-update` で doc-maintainer を起動してドキュメントを自動更新
- docs/ 配下のファイルは手動編集も可能（エージェントは既存内容を保持して追記する）

## SDD ワークフロー

@docs/guides/sdd-workflow.md

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
