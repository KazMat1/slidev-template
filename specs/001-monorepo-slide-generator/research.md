# Research: Monorepo スライド自動生成アプリ

**Date**: 2026-03-25 | **Branch**: `001-monorepo-slide-generator`

## Decision 1: フロントエンド UI フレームワーク

**Decision**: Vue 3 SPA (Vite + Vue Router)

**Rationale**:
- Slidev が Vue 3 + Vite + UnoCSS で動作するため、同一エコシステムでコンポーネント・型定義・スタイリングを共有可能
- 3-4 ページのローカルツールに Nuxt のモジュールシステム・SSR・Nitro は不要。SPA モードで使っても複雑性コストだけ発生
- pnpm workspace + Turborepo との統合が最もシンプル（標準 Vite ビルドのみ）
- Vue 3 ネイティブの Markdown エディタ（md-editor-v3, vue-codemirror）が利用可能

**Alternatives Considered**:
- **Nuxt 3**: SSR/SEO 不要のローカルツールには過剰。40+ 依存 vs Vue SPA の 3 依存
- **React/Next.js**: Slidev の Vue エコシステムとの断絶。コンポーネント共有不可、二重ツーリングコスト

**Tech Stack**:
| 関心事 | 選択 | 理由 |
|--------|------|------|
| フレームワーク | Vue 3 (`<script setup>` + Composition API) | Slidev と同一 |
| ビルド | Vite | Slidev と同一 |
| ルーティング | Vue Router 4 | 3-4 ルート、ファイルベースルーティングは不要 |
| スタイリング | UnoCSS | Slidev と同一、設定共有可能 |
| エディタ | md-editor-v3 or vue-codemirror (CodeMirror 6) | Vue 3 ネイティブ |
| 状態管理 | Pinia (必要に応じて) | 軽量、初期は composables で十分 |
| HTTP | ofetch or native fetch | ローカル Hono サーバーへの呼び出し |

---

## Decision 2: ストレージ方式

**Decision**: ファイルベース JSON

**Rationale**:
- プロジェクトデータは単純な単一エンティティ（id, name, inputText, templateId, settings, timestamps）。RDB は不要
- 生成される Slidev ファイル（slides.md, components/, styles/）は本質的にファイルシステムアーティファクト。メタデータを横に置くのが自然
- シングルユーザー・ローカル実行のため ACID トランザクションは不要
- 依存ゼロ（better-sqlite3 のネイティブアドオンコンパイル不要）
- 開発者が `cat project.json | jq` で直接確認可能。透明性がフィーチャー

**Alternatives Considered**:
- **SQLite (better-sqlite3)**: ネイティブアドオンの複雑性、ORM のオーバーヘッド。将来マルチユーザー化する場合に検討
- **IndexedDB**: ブラウザ限定でサーバー側からアクセス不可。Slidev のファイルシステム要件と非互換
- **Hybrid (IndexedDB + FS)**: 二重ストレージの同期コストが高すぎる

**Directory Structure**:
```
data/
└── projects/
    ├── index.json              # プロジェクト一覧キャッシュ
    └── {project-id}/
        ├── project.json        # メタデータ
        ├── slides.md           # 生成された Slidev マークダウン
        ├── components/         # カスタム Vue コンポーネント
        └── styles/             # カスタムスタイル
```

---

## Decision 3: Slidev 統合アーキテクチャ

**Decision**: 別プロセスの Slidev Dev Server + ファイルシステム書き込み + iframe 埋め込み

**Rationale**:
- Slidev の Vite プラグインは Vite サーバー全体を占有する前提。メインアプリの Vite にプラグインとして組み込むのは不可
- `slides.md` への `fs.writeFile()` で Vite のファイルウォッチャーが自動検知 → HMR でブラウザ更新。カスタム API 不要
- iframe 埋め込みは同一ホスト（localhost）で制約なし
- PDF エクスポートは `child_process.spawn('slidev', 'export', ...)` が最も安定

**Architecture**:
```
Main Web App (port 3000)
  ├── Input UI / Template Selector / Editor
  │         │
  │    fs.writeFile() → apps/preview/slides.md
  │         │
  │    Vite file watcher (automatic HMR)
  │         │
  │    Slidev Dev Server (port 3030)
  │         │
  │    <iframe src="localhost:3030" />
  │         │
  └── Preview Panel (iframe in main app)

Export: child_process.spawn('slidev', 'export', 'slides.md')
```

**Key Details**:
- Slidev の HMR は `chokidar` ベースのファイルウォッチャーで slides.md の変更を検知
- コンテンツのみの変更は `slidev:update-slide` WebSocket イベント、構造変更はフルリロード
- リアルタイム編集時は書き込みを 300ms デバウンスしてウォッチャーの過負荷を防止
- PDF エクスポートは `playwright-chromium` を使用（Slidev 標準）

**What NOT to Do**:
- Slidev の Vite プラグインをメインアプリの Vite に組み込まない
- `createServer` をミドルウェアとして Express/Hono に埋め込まない
- Slidev の内部 API（`createServer`, `exportSlides`）に依存しない（CLI がサポートされたインターフェース）

---

## Decision 4: API サーバーフレームワーク

**Decision**: Hono

**Rationale**:
- 軽量・高速で TypeScript ファースト
- Zod バリデーションの組み込みサポート
- Web Standards API ベースでテストが容易
- Slidev（Vite ベース）とポートを分けて並行実行

**Alternatives Considered**:
- **Express**: レガシー。TypeScript サポートが弱い
- **Fastify**: 高機能だがこの規模には過剰
- **Nitro (Nuxt)**: Nuxt を使わないため不要

---

## Decision 5: AI スライド生成アプローチ

**Decision**: Claude API (Anthropic SDK) + テンプレート駆動プロンプト

**Rationale**:
- spec.md の前提条件で Claude API 指定
- テンプレートごとにプロンプトを定義し、入力テキスト + テンプレート仕様 → Slidev マークダウンを生成
- docs/slidev-knowhow.md と docs/slide-patterns.md の知識をプロンプトに組み込み
- ストリーミングレスポンスで生成進捗を UI に表示

**Generation Flow**:
1. ユーザー入力テキスト + テンプレート選択を受信
2. テンプレート定義（レイアウト構成、コンポーネント指定）をロード
3. Slidev ナレッジ（レイアウト、コンポーネント、設計原則）をコンテキストに追加
4. Claude API にストリーミングリクエスト
5. 生成されたマークダウンを `slides.md` に書き込み
6. Slidev HMR が自動的にプレビュー更新

---

## Resolved NEEDS CLARIFICATION

| Item | Resolution |
|------|-----------|
| フロントエンド UI フレームワーク | Vue 3 SPA (Vite + Vue Router) |
| ストレージ方式 | ファイルベース JSON |
| Slidev 統合方式 | 別プロセス + ファイルシステム + iframe |
| API サーバー | Hono |
| AI 生成方式 | Claude API + テンプレート駆動プロンプト |
