# Implementation Plan: Monorepo スライド自動生成アプリ

**Branch**: `001-monorepo-slide-generator` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-monorepo-slide-generator/spec.md`

## Summary

pnpm workspace + Turborepo によるモノレポ構成で、ユーザーが箇条書きテキストを入力すると Claude API を使って Slidev 互換のマークダウンスライドを自動生成する Web アプリケーション。フロントエンド（入力 UI・エディタ）とスライド生成エンジンを分離し、テンプレート選択・ライブプレビュー・PDF エクスポートを提供する。

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js v18+
**Primary Dependencies**: Vue 3 SPA (Vite + Vue Router), Slidev, Hono (API server), Anthropic SDK, UnoCSS, Pinia, md-editor-v3
**Storage**: ファイルベース JSON (`data/projects/{id}/project.json`)
**Testing**: Vitest (unit/integration), Playwright (E2E)
**Target Platform**: Web ブラウザ (Chrome/Firefox/Safari), ローカル開発サーバー
**Project Type**: web-application (monorepo)
**Performance Goals**: 20行の入力 → スライド生成 2分以内 (SC-001)、生成→PDF全工程 5分以内 (SC-005)
**Constraints**: Claude API のレイテンシに依存、API キーはユーザー提供、ローカル実行前提
**Scale/Scope**: 個人〜小チーム向け、3種テンプレート、10-20ページ/生成

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> **Note**: プロジェクト憲章（constitution.md）は未作成のため、暗黙的な設計原則でチェックする。

| Principle | Status | Notes |
|-----------|--------|-------|
| モノレポ構成 (FR-001) | PASS | pnpm workspace + Turborepo で分離管理 |
| Slidev 互換 (FR-003, FR-006) | PASS | Slidev をそのまま使用 |
| パッケージ独立性 (SC-006) | PASS | 各パッケージが独立ビルド・テスト可能な設計 |
| 過度な複雑性の回避 | PASS | 5パッケージ構成は FR-001 の分離要件に基づく。各パッケージの責務が明確 |

## Project Structure

### Documentation (this feature)

```text
specs/001-monorepo-slide-generator/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
pnpm-workspace.yaml
turbo.json
package.json                    # Root package (workspaces config)

apps/
├── web/                        # フロントエンド Web UI
│   ├── src/
│   │   ├── components/         # UI コンポーネント (入力フォーム, テンプレート選択, エディタ)
│   │   ├── pages/              # ページ (ホーム, エディタ, プレビュー)
│   │   ├── composables/        # Vue composables
│   │   └── types/              # フロントエンド型定義
│   ├── package.json
│   └── vite.config.ts
│
└── preview/                    # Slidev プレビュー/エクスポート用アプリ
    ├── slides.md               # 生成されたスライド (動的に書き換え)
    ├── components/             # カスタム Vue コンポーネント
    ├── styles/                 # グローバルスタイル
    └── package.json

packages/
├── generator/                  # スライド生成エンジン
│   ├── src/
│   │   ├── generator.ts        # メイン生成ロジック
│   │   ├── prompt-builder.ts   # Claude API プロンプト構築
│   │   ├── templates/          # テンプレート定義
│   │   └── types.ts            # 共有型定義
│   ├── tests/
│   └── package.json
│
├── server/                     # API サーバー
│   ├── src/
│   │   ├── routes/             # API ルート
│   │   ├── services/           # ビジネスロジック
│   │   └── index.ts            # エントリーポイント
│   ├── tests/
│   └── package.json
│
└── shared/                     # 共有ユーティリティ・型定義
    ├── src/
    │   ├── types.ts
    │   └── utils.ts
    └── package.json
```

**Structure Decision**: pnpm workspace モノレポ。FR-001 の要件に従い、フロントエンド（apps/web）とスライド生成エンジン（packages/generator）を分離。Slidev は独立アプリ（apps/preview）として配置し、生成されたマークダウンを書き込んでプレビュー/エクスポートする。API サーバー（packages/server）が Claude API 呼び出しとプロジェクト管理を担当。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 5パッケージ構成 | フロントエンド・生成エンジン・API・プレビュー・共有の分離が FR-001 で要求 | 2-3パッケージでは生成エンジンの独立テスト (SC-006) が困難 |
