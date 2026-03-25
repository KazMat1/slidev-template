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

### `/sdd` コマンド（推奨）

統一的な Spec-Driven Development コマンド。5フェーズを順に実行し、各フェーズの重い処理を SubAgent に委譲:

1. 事前準備 → プロジェクトドキュメント読み込み
2. 要件定義 → `spec-analyst` SubAgent で requirements.md 作成
3. 設計 → `spec-analyst` SubAgent で design.md 作成
4. 実装計画 → `spec-analyst` SubAgent で tasks.md 作成
5. 実装 → `slide-developer` SubAgent でスライド生成 + `slide-reviewer` でレビュー

### 個別 SubAgents

専門化 SubAgents は `/sdd` から自動的に呼ばれるが、個別利用も可能:

- **spec-analyst** — 要件分析・設計・タスク分割
- **slide-story-writer** — 箇条書き → ストーリー構成 (story.md) 生成
- **slide-developer** — ストーリー → Slidev マークダウン生成
- **slide-reviewer** — 品質チェック・仕様分析レビュー（読取専用）
- **doc-maintainer** — docs/ 配下のドキュメントをコードベースと同期

### 既存 spec-kit コマンド

`/speckit.*` コマンド群は個別利用も引き続き可能。`/sdd` はその上位レイヤーとして機能する。

## ドキュメント管理

- `/doc-sync` で現在のドキュメントの鮮度をチェック
- `/doc-update` で doc-maintainer を起動してドキュメントを自動更新
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

## Active Technologies
- TypeScript 5.x / Node.js v18+ (001-monorepo-slide-generator)

## Recent Changes
- 001-monorepo-slide-generator: Added TypeScript 5.x / Node.js v18+
