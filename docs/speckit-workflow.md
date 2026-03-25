# Spec-Kit ワークフロー

Spec-Kit は仕様駆動開発（Spec-Driven Development）のワークフローを提供する。
以下の順序でコマンドを実行して機能を開発する。

## コマンド実行順序

| # | コマンド | 成果物 | 説明 |
|---|---------|--------|------|
| 1 | `/speckit.specify "機能の説明"` | `spec.md` | 仕様書を作成。フィーチャーブランチも自動作成 |
| 2 | `/speckit.clarify` | `spec.md` (更新) | 仕様の不明点を解消。`[NEEDS CLARIFICATION]` マーカーを解決 |
| 3 | `/speckit.plan` | `plan.md` | 技術設計・実装計画を作成 |
| 4 | `/speckit.tasks` | `tasks.md` | タスク分割。依存関係順に並んだ実行可能タスクリスト |
| 5 | `/speckit.implement` | ソースコード | タスクを順次実行して実装 |
| 6 | `/speckit.analyze` | 分析レポート | 成果物間（spec/plan/tasks）の整合性チェック |
| 7 | `/speckit.taskstoissues` | GitHub Issues | タスクを GitHub Issues に変換 |

## 補助コマンド

| コマンド | 説明 |
|---------|------|
| `/speckit.constitution` | プロジェクト憲章の作成・更新 |
| `/speckit.checklist` | 機能ごとのカスタムチェックリスト生成 |

## ブランチ自動作成

`/speckit.specify` 実行時にフィーチャーブランチが自動作成される。

- **連番形式**（デフォルト）: `NNN-short-name`（例: `001-user-auth`）
- **タイムスタンプ形式**: `YYYYMMDD-HHMMSS-short-name`
- `.specify/init-options.json` で制御

## 成果物の配置

各成果物はフィーチャーブランチのルートに配置される:
- `spec.md` — 仕様書
- `plan.md` — 技術設計・実装計画
- `tasks.md` — タスクリスト

## スクリプト

- `.specify/scripts/bash/create-new-feature.sh` — フィーチャーブランチ作成
- `.specify/scripts/bash/check-prerequisites.sh` — 前提条件チェック
- `.specify/scripts/bash/setup-plan.sh` — 計画セットアップ
- `.specify/scripts/bash/common.sh` — 共通ユーティリティ
