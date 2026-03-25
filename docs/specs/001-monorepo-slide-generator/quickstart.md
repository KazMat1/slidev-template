# Quickstart: Monorepo スライド自動生成アプリ

**Branch**: `001-monorepo-slide-generator`

## Prerequisites

- Node.js v18+
- pnpm v9+
- Claude API キー（Anthropic）

## Setup

```bash
# リポジトリクローン後
pnpm install

# 環境変数設定
cp .env.example .env
# .env に ANTHROPIC_API_KEY=sk-ant-... を設定
```

## Development

```bash
# 全アプリを同時起動（Turborepo）
pnpm dev

# 個別起動
pnpm --filter @slidegen/web dev      # Web UI (port 3000)
pnpm --filter @slidegen/server dev   # API Server (port 3001)
pnpm --filter @slidegen/preview dev  # Slidev Preview (port 3030)
```

## Architecture

```
http://localhost:3000    → Web UI (入力・テンプレート選択・エディタ)
http://localhost:3001    → API Server (生成・プロジェクト管理)
http://localhost:3030    → Slidev Preview (スライドプレビュー)
```

**Data Flow**:
1. ユーザーが Web UI でテキスト入力 + テンプレート選択
2. Web UI → API Server: `POST /api/projects/:id/generate`
3. API Server → Claude API: ストリーミング生成
4. API Server → `slides.md`: ファイル書き込み
5. Slidev Dev Server: HMR で自動プレビュー更新
6. Web UI: iframe で Slidev プレビューを埋め込み表示

## Monorepo Structure

```
pnpm-workspace.yaml
turbo.json
package.json

apps/
├── web/         # @slidegen/web - Vue 3 SPA
├── preview/     # @slidegen/preview - Slidev

packages/
├── generator/   # @slidegen/generator - AI 生成エンジン
├── server/      # @slidegen/server - Hono API
└── shared/      # @slidegen/shared - 共有型・ユーティリティ
```

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | 全パッケージの開発サーバー起動 |
| `pnpm build` | 全パッケージのビルド |
| `pnpm test` | 全パッケージのテスト実行 |
| `pnpm lint` | リント実行 |
| `pnpm --filter @slidegen/generator test` | 生成エンジンのテストのみ |

## Testing

```bash
# Unit tests
pnpm test

# E2E tests (Playwright)
pnpm --filter @slidegen/web test:e2e
```

## PDF Export

```bash
# API 経由
curl -X POST http://localhost:3001/api/projects/{id}/export

# CLI 直接（apps/preview ディレクトリで）
cd apps/preview && pnpm export
```
