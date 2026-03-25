---
name: sdd
description: "Spec-Driven Development: 要件→設計→実装計画→整合性分析→実装→完了を統一的にオーケストレーション"
---

# Spec-Driven Development (SDD)

ユーザーの機能要件を受け取り、7つのフェーズを順に実行して成果物を生成する統一コマンド。
各フェーズの重い処理は SubAgent に委譲し、フェーズ間のユーザーフィードバックはメインセッションで処理する。

## 引数

- `$ARGUMENTS` — 機能の概要説明（自然言語）

---

## Phase 1: 事前準備

このフェーズは軽量なのでメインセッションで直接実行する。

1. `$ARGUMENTS` からスペック名（英語のケバブケース、例: `ai-code-gen-intro`）を決定
2. `docs/specs/{spec-name}/` ディレクトリを作成（Write ツールでファイル作成時に自動生成）
3. 以下のプロジェクトドキュメントを読み込み、後続フェーズのコンテキストとして保持:
   - `CLAUDE.md` — プロジェクト概要・コマンド・制約
   - `docs/reference/slidev-knowhow.md` — Slidev 構文・レイアウト・設計原則
   - `docs/reference/slide-patterns.md` — スライドパターンカタログ
   - `docs/specs/constitution.md` — プロジェクト Constitution（存在する場合のみ）
4. ユーザーに準備完了を報告し、Phase 2 に進む

---

## Phase 2: 要件定義

**SubAgent 委譲**: Task ツールで `spec-analyst` エージェントを起動する。

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "要件分析と requirements.md 作成"
  prompt: |
    あなたは spec-analyst です。以下の要件を分析し、requirements.md を作成してください。

    ## 機能概要
    {$ARGUMENTS の内容}

    ## プロジェクトコンテキスト
    - Slidev プレゼンテーションプロジェクト
    - 技術スタック: Vue 3 + TypeScript + UnoCSS + Slidev

    ## 出力先
    docs/specs/{spec-name}/requirements.md

    ## 出力フォーマット

    ### 要件ファイル構造:
    ```markdown
    # 要件: {機能名}

    ## 概要
    [機能の目的と背景を2-3文で]

    ## ユーザーストーリー
    ### US-1: [タイトル] (Priority: P1)
    [ユーザージャーニーの説明]
    - プレゼンターとして、[目的] のために [機能] がほしい
    **受入シナリオ**:
    1. **Given** [状態], **When** [アクション], **Then** [期待結果]
    **独立テスト**: [このストーリー単独でテスト可能な方法]

    ### US-2: [タイトル] (Priority: P2)
    ...

    ## エッジケース
    - [境界条件への対応]

    ## 機能要件
    - **FR-001**: システムは [具体的な能力] を提供しなければならない

    ## 非機能要件
    - スライド枚数の目安
    - 対象聴衆のレベル
    - プレゼン時間の目安

    ## 成功基準
    - **SC-001**: [計測可能・技術非依存な指標]

    ## 前提条件
    - [前提]

    ## スコープ外
    - [明示的に含めないもの]

    ## 未解決事項
    - [NEEDS CLARIFICATION] [不明点]（最大3個）
    ```

    ## 制約
    - 日本語で記述
    - Markdown 形式
    - ユーザーストーリーは「プレゼンターとして」「聴衆として」の視点を含む
    - 不明点には必ず [NEEDS CLARIFICATION] マーカーを付与（最大3個）
    - 各ユーザーストーリーに優先度 (P1, P2, P3) を割り当て
    - 各ストーリーは独立してテスト可能であること
```

### SubAgent 完了後: 明確化ループ

1. requirements.md の内容をユーザーに提示
2. `[NEEDS CLARIFICATION]` マーカーを抽出（最大3個）
3. **8カテゴリ分類法で曖昧点をスキャン**:
   - 機能スコープ / ドメイン・データモデル / UX フロー / 非機能品質
   - 外部依存 / エッジケース / 制約・トレードオフ / 用語の一貫性
4. **優先度ヒューリスティック**: (影響度 × 不確実性) で最大5問に絞る
5. 各質問に推奨回答を提示（テーブル形式）:

   | Option | Answer | Implications |
   |--------|--------|-------------|
   | A | [推奨回答] | [影響] |
   | B | [代替案] | [影響] |

6. ユーザーの回答を requirements.md に即座に反映（アトミック保存）
7. 反映後バリデーション: 重複なし、矛盾なし、Markdown構造正常

### 要件品質チェックリスト

requirements.md 完成後、`docs/specs/{spec-name}/checklists/requirements.md` を生成:
- 内容品質（実装詳細なし、ユーザー価値中心、非技術者向け）
- 要件完全性（テスト可能、曖昧さなし、成功基準が計測可能）
- 機能準備完了（受入条件定義済み、スコープ明確）

### Constitution チェック

`docs/specs/constitution.md` が存在する場合、要件を constitution 原則と照合。違反は CRITICAL として報告。

ユーザーが承認したら Phase 3 に進む。

---

## Phase 3: 設計

**SubAgent 委譲**: Task ツールで設計エージェントを起動する。2段階で実行。

### Phase 3a: リサーチ

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "技術リサーチと research.md 作成"
  prompt: |
    あなたは spec-analyst です。要件に基づいて技術リサーチを実施してください。

    ## 入力
    - docs/specs/{spec-name}/requirements.md の内容

    ## 参照
    - docs/reference/slidev-knowhow.md — レイアウト一覧・コンポーネント・設計原則
    - docs/reference/slide-patterns.md — パターンカタログ
    - docs/specs/constitution.md — Constitution（存在する場合）

    ## 出力先
    docs/specs/{spec-name}/research.md

    ## 出力フォーマット
    ```markdown
    # リサーチ: {機能名}

    ## 技術的決定事項
    | Decision | Rationale | Alternatives Considered |
    |----------|-----------|------------------------|

    ## 未解決の技術的課題
    [全て解決済みであること]
    ```

    ## 制約
    - 日本語で記述
    - Technical Context の不明点（NEEDS CLARIFICATION）を全て解決
    - 各決定に根拠と却下した代替案を記載
```

### Phase 3b: 設計ドキュメント

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "設計ドキュメント作成"
  prompt: |
    あなたは spec-analyst です。要件とリサーチに基づいて design.md を作成してください。

    ## 入力
    - docs/specs/{spec-name}/requirements.md
    - docs/specs/{spec-name}/research.md

    ## 参照
    - docs/reference/slidev-knowhow.md — レイアウト一覧・コンポーネント・設計原則
    - docs/reference/slide-patterns.md — パターンカタログ

    ## 出力先
    docs/specs/{spec-name}/design.md

    ## 出力フォーマット

    ```markdown
    # 設計: {機能名}

    ## 技術コンテキスト
    - 技術スタック: Vue 3 + TypeScript + UnoCSS + Slidev
    - テスト方針: pnpm build（構文検証）
    - パフォーマンス目標: [該当する場合]
    - 制約: [該当する場合]

    ## スライド構成
    | # | タイトル | レイアウト | パターン | 備考 |
    |---|---------|----------|---------|------|
    | 1 | 表紙 | cover | タイトルスライド | - |
    | 2 | アジェンダ | default | アジェンダ | v-clicks 使用 |
    ...

    ## プロジェクト構造
    docs/specs/{spec-name}/
    ├── requirements.md
    ├── research.md
    ├── design.md
    └── tasks.md

    slides.md              # 実装成果物
    components/            # カスタムコンポーネント
    styles/                # グローバルスタイル

    ## コンポーネント設計
    [必要な場合のみ]

    ## スタイル設計
    [必要な場合のみ]

    ## 技術的考慮事項
    - [Slidev 固有の制約・注意点]

    ## Constitution チェック
    [constitution.md が存在する場合、原則との整合性を検証]
    ```

    ## 制約
    - 日本語で記述
    - レイアウトは docs/reference/slidev-knowhow.md の一覧から選択
    - パターンは docs/reference/slide-patterns.md のカタログから選択
    - 3-4スライドごとにレイアウトを変化させる（設計原則）
    - 1スライド=1メッセージの原則を守る
```

### SubAgent 完了後

1. design.md の内容をユーザーに提示
2. スライド構成・レイアウト選択についてフィードバックを収集
3. フィードバックを反映して design.md を更新
4. ユーザーが承認したら Phase 4 に進む

---

## Phase 4: 実装計画

**SubAgent 委譲**: Task ツールでタスク分割エージェントを起動する。

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "実装タスク分割"
  prompt: |
    あなたは spec-analyst です。設計に基づいて tasks.md を作成してください。

    ## 入力
    - docs/specs/{spec-name}/requirements.md
    - docs/specs/{spec-name}/design.md

    ## 出力先
    docs/specs/{spec-name}/tasks.md

    ## 出力フォーマット

    ```markdown
    # 実装タスク: {機能名}

    ## Phase 1: セットアップ
    - [ ] T001 slides.md のフロントマター設定
    - [ ] T002 [P] 必要な依存パッケージの確認

    ## Phase 2: 基盤（全 Story のブロッカー）
    - [ ] T003 テーマ設定とグローバルスタイル
    - [ ] T004 [P] カスタムコンポーネントの雛形作成
    **チェックポイント**: 基盤完了、Story 実装開始可能

    ## Phase 3: [US-1 タイトル] (P1) 🎯 MVP
    **ゴール**: [このストーリーが提供する価値]
    **独立テスト**: [単独でテスト可能な方法]
    - [ ] T005 [US1] cover レイアウトで表紙スライド作成
    - [ ] T006 [US1] アジェンダスライド作成（v-clicks 使用）
    - [ ] T007 [US1] [P] セクション区切りスライド作成
    **チェックポイント**: US-1 が独立して機能・テスト可能

    ## Phase 4: [US-2 タイトル] (P2)
    ...

    ## Phase N: 仕上げ
    - [ ] TXXX [P] ドキュメント更新
    - [ ] TXXX コード品質チェック
    - [ ] TXXX パフォーマンス最適化

    ## 依存関係・実行順序
    - Phase 1 → Phase 2（ブロック）
    - Phase 2 完了後、全 Story は並列実行可能
    - 各 Story 内: モデル → サービス → UI の順

    ## 表記
    - `[P]`: 並列実行可能（異なるファイル、依存なし）
    - `[USn]`: 対応するユーザーストーリー
    - `T###`: タスク ID（連番）
    ```

    ## 制約
    - 日本語で記述
    - 各タスクは独立して実行可能な粒度
    - 依存関係を明示
    - ユーザーストーリーごとにフェーズを分割
    - 各フェーズにチェックポイントを設置
    - スライド設計の各セクション（design.md のスライド構成表）を1-2タスクに対応させる
```

### SubAgent 完了後

1. tasks.md の内容をユーザーに提示
2. タスクの粒度・順序についてフィードバックを収集
3. ユーザーが承認したら Phase 5 に進む

---

## Phase 5: 整合性分析

**SubAgent 委譲**: Task ツールで分析エージェントを起動する。

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "要件・設計・タスク整合性分析"
  prompt: |
    あなたは spec-analyst です。以下の成果物の整合性を分析してください。
    **STRICTLY READ-ONLY**: ファイルは一切変更しないこと。

    ## 入力
    - docs/specs/{spec-name}/requirements.md
    - docs/specs/{spec-name}/design.md
    - docs/specs/{spec-name}/tasks.md
    - docs/specs/constitution.md（存在する場合）

    ## 分析手順

    ### 1. セマンティックモデル構築
    要件・設計・タスクの内部表現を作成。

    ### 2. 6パス検出
    A. **重複検出**: 類似要件の検出
    B. **曖昧性検出**: vague な形容詞（高速、スケーラブル等）
    C. **未定義検出**: アクション/成果物の欠落
    D. **Constitution 整合性**: 原則違反の検出
    E. **カバレッジギャップ**: タスクのない要件 / 要件のないタスク
    F. **矛盾検出**: 用語のドリフト、データモデル競合

    ### 3. 重大度ヒューリスティック
    - CRITICAL: Constitution 違反 / コア機能のカバレッジ 0%
    - HIGH: 重複 / 矛盾する要件 / テスト不能な基準
    - MEDIUM: 用語ドリフト / 非機能要件の欠落
    - LOW: 文言改善 / 軽微な冗長

    ## 出力フォーマット
    ```markdown
    # 整合性分析レポート

    ## Findings
    | ID | Category | Severity | Location(s) | Summary | Recommendation |
    |----|----------|----------|-------------|---------|----------------|

    ## カバレッジサマリー
    | Requirement Key | Has Task? | Task IDs | Notes |
    |-----------------|-----------|----------|-------|

    ## メトリクス
    - Total Requirements:
    - Total Tasks:
    - Coverage %:
    - Ambiguity Count:
    - Critical Issues Count:
    ```

    ## 制約
    - 日本語で記述
    - ファイルの変更は一切行わない（読取専用）
    - Findings は最大50件
    - CRITICAL 問題がある場合、その旨を明記
```

### SubAgent 完了後

1. 分析レポートをユーザーに提示
2. **CRITICAL 問題がある場合**: Phase 3-4 に戻って修正を提案
3. CRITICAL なしの場合、ユーザーが承認したら Phase 6 に進む

---

## Phase 6: 実装

### チェックリストゲーティング

実装開始前に `docs/specs/{spec-name}/checklists/` を検証:
- チェックリストファイルが存在する場合、各項目の完了状態を確認
- 未完了項目がある場合、ユーザーに確認してから続行

### 実装 SubAgent

**SubAgent 委譲**: Task ツールで `slide-developer` 相当のエージェントを起動する。
tasks.md のタスクを順に実行し、スライドを生成する。

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "スライド実装"
  prompt: |
    あなたは slide-developer です。タスクリストに従ってスライドを実装してください。

    ## 入力
    - docs/specs/{spec-name}/requirements.md
    - docs/specs/{spec-name}/design.md
    - docs/specs/{spec-name}/tasks.md

    ## 参照
    - docs/reference/slidev-knowhow.md — Slidev 構文リファレンス
    - docs/reference/slide-patterns.md — スライドパターンカタログ

    ## 出力
    - slides.md — メインスライドファイル
    - components/*.vue — カスタムコンポーネント（必要に応じて）
    - styles/index.css — グローバルスタイル（必要に応じて）

    ## 品質基準
    - 1スライド7箇条書き以下
    - コードブロックは言語指定必須
    - レイアウト指定は明示的に
    - クリックアニメーション活用
    - UnoCSS クラスで統一（インラインスタイル不可）

    ## タスク進捗追跡
    - 各タスク完了後 `- [ ]` → `- [x]` に更新
    - 進捗レポート出力

    ## 制約
    - tasks.md のタスクを順に実行
    - 各タスク完了後、tasks.md の状態を更新
    - 全タスク完了後、実装サマリーを出力
```

### レビュー SubAgent

実装 SubAgent 完了後:

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "スライドレビュー"
  prompt: |
    あなたは slide-reviewer です。生成されたスライドをレビューしてください。

    ## 入力
    - slides.md
    - docs/specs/{spec-name}/requirements.md（要件との整合性チェック用）
    - docs/specs/{spec-name}/design.md（設計との整合性チェック用）

    ## チェック項目
    - 構文検証（フロントマター、レイアウト名、コードブロック）
    - コンテンツ密度（1スライド7項目以下、3秒ルール）
    - レイアウト多様性（同一レイアウト3枚連続禁止）
    - ストーリーフロー（論理的な流れ）
    - 要件・設計との整合性

    ## 出力
    構造化されたレビューレポート（スコア、問題点、改善提案）
```

### SubAgent 完了後

1. 生成されたスライドの概要をユーザーに報告
2. レビュー結果をユーザーに提示
3. 修正が必要な場合はユーザーと相談して対応

---

## Phase 7: 完了

### GitHub Issues 変換（オプション）

tasks.md の未完了タスクがある場合、GitHub Issues に変換するか確認:
- ユーザーが希望する場合、`gh issue create` で依存関係順に Issue を作成
- 各 Issue にはタスク ID、説明、依存関係を含む

### ドキュメント同期

doc-maintainer を起動して docs/ の同期を実行:

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "ドキュメント同期"
  prompt: |
    あなたは doc-maintainer です。以下のドキュメントを同期してください。

    同期対象:
    - docs/reference/slidev-knowhow.md ↔ components/, layouts/
    - docs/reference/slide-patterns.md ↔ 実際のスライドパターン
    - docs/guides/sdd-workflow.md ↔ .claude/commands/sdd.md
    - CLAUDE.md の Commands ↔ package.json の scripts
```

---

## フェーズ間のルール

- **各フェーズ終了時にユーザー承認を得てから次に進む**
- ユーザーが「スキップ」と言った場合、そのフェーズの成果物をデフォルト内容で作成して次に進む
- ユーザーが「戻る」と言った場合、指定フェーズに戻って再実行
- SubAgent のエラー時はメインセッションでリカバリを試みる
- **Constitution 違反が CRITICAL の場合、該当フェーズの再実行を強制**
- **整合性分析で CRITICAL 問題がある場合、Phase 3-4 に戻る**
- 拡張フック: `docs/specs/extensions.yml` が存在する場合、各フェーズの前後でフック実行

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

slides.md                     # Phase 6: 実装（プロジェクトルート）
components/                   # Phase 6: カスタムコンポーネント（必要に応じて）
styles/                       # Phase 6: スタイル（必要に応じて）
```
