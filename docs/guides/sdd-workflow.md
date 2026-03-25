# SDD (Spec-Driven Development) ワークフロー

## 概要

`/sdd` コマンドで 7 フェーズを統一的にオーケストレーション。
各フェーズの重い処理は SubAgent に委譲し、フェーズ間のユーザーフィードバックはメインセッションで処理する。

## フェーズ一覧

| # | フェーズ | 成果物 | SubAgent |
|---|---------|--------|----------|
| 1 | 事前準備 | - | - |
| 2 | 要件定義 | requirements.md, checklists/ | spec-analyst |
| 3 | 設計 | research.md, design.md | spec-analyst |
| 4 | 実装計画 | tasks.md | spec-analyst |
| 5 | 整合性分析 | 分析レポート | spec-analyst |
| 6 | 実装 | slides.md, components/, styles/ | slide-developer + slide-reviewer |
| 7 | 完了 | GitHub Issues, ドキュメント同期 | doc-maintainer |

## 成果物の配置

```
docs/specs/{spec-name}/
├── requirements.md           # Phase 2: 要件
├── checklists/
│   └── requirements.md       # Phase 2: 要件品質チェックリスト
├── research.md               # Phase 3a: リサーチ
├── design.md                 # Phase 3b: 設計
└── tasks.md                  # Phase 4: 実装計画

docs/specs/constitution.md    # プロジェクト全体の Constitution（オプション）
docs/specs/extensions.yml     # 拡張フック定義（オプション）

slides.md                     # Phase 6: 実装成果物
components/                   # Phase 6: カスタムコンポーネント
styles/                       # Phase 6: スタイル
```

## ブランチ命名規則

- 連番: `NNN-short-name`（例: `001-slide-template`）
- タイムスタンプ: `YYYYMMDD-HHMMSS-short-name`

## 個別 SubAgents

`/sdd` から自動的に呼ばれるが、個別利用も可能:

- **spec-analyst** — 要件分析・設計・タスク分割・整合性分析
- **slide-story-writer** — 箇条書き → ストーリー構成 (story.md) 生成
- **slide-developer** — ストーリー → Slidev マークダウン生成
- **slide-reviewer** — 品質チェック・仕様分析レビュー（読取専用）
- **doc-maintainer** — docs/ 配下のドキュメントをコードベースと同期

## フェーズ詳細

### Phase 1: 事前準備

- スペック名決定（英語ケバブケース）
- プロジェクトドキュメント読み込み
- Constitution ファイルの読み込み（存在する場合）

### Phase 2: 要件定義

- requirements.md 作成（ユーザーストーリー、機能要件、非機能要件）
- 明確化ループ（8カテゴリ分類法で曖昧点スキャン、最大5問）
- 要件品質チェックリスト生成
- Constitution チェック

### Phase 3: 設計

- Phase 3a: リサーチ（技術的決定事項を research.md に記録）
- Phase 3b: 設計ドキュメント（スライド構成、コンポーネント設計を design.md に記録）

### Phase 4: 実装計画

- ユーザーストーリーごとにフェーズ分割された tasks.md を作成
- チェックポイント設置、並列実行可能タスクの明示

### Phase 5: 整合性分析

- 6パス検出（重複、曖昧性、未定義、Constitution 整合性、カバレッジギャップ、矛盾）
- 重大度分類（CRITICAL / HIGH / MEDIUM / LOW）
- CRITICAL 問題がある場合、Phase 3-4 に戻る

### Phase 6: 実装

- チェックリストゲーティング（未完了項目の確認）
- slide-developer でスライド生成
- slide-reviewer でレビュー
- タスク進捗追跡

### Phase 7: 完了

- 未完了タスクの GitHub Issues 変換（オプション）
- doc-maintainer でドキュメント同期
