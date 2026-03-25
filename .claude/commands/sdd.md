---
name: sdd
description: "Spec-Driven Development: 要件→設計→実装計画→実装を統一的にオーケストレーション"
---

# Spec-Driven Development (SDD)

ユーザーの機能要件を受け取り、5つのフェーズを順に実行して成果物を生成する統一コマンド。
各フェーズの重い処理は SubAgent に委譲し、フェーズ間のユーザーフィードバックはメインセッションで処理する。

## 引数

- `$ARGUMENTS` — 機能の概要説明（自然言語）

---

## Phase 1: 事前準備

このフェーズは軽量なのでメインセッションで直接実行する。

1. `$ARGUMENTS` からスペック名（英語のケバブケース、例: `ai-code-gen-intro`）を決定
2. `.kiro/specs/{spec-name}/` ディレクトリを作成（Write ツールでファイル作成時に自動生成）
3. 以下のプロジェクトドキュメントを読み込み、後続フェーズのコンテキストとして保持:
   - `CLAUDE.md` — プロジェクト概要・コマンド・制約
   - `docs/slidev-knowhow.md` — Slidev 構文・レイアウト・設計原則
   - `docs/slide-patterns.md` — スライドパターンカタログ
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
    .kiro/specs/{spec-name}/requirements.md

    ## 出力フォーマット

    ### 要件ファイル構造:
    ```markdown
    # 要件: {機能名}

    ## 概要
    [機能の目的と背景を2-3文で]

    ## ユーザーストーリー
    - プレゼンターとして、[目的] のために [機能] がほしい
    - 聴衆として、[目的] のために [機能] がほしい

    ## 機能要件
    ### FR-1: [要件名]
    - 説明: [詳細]
    - 受入条件: [テスト可能な条件]

    ## 非機能要件
    - スライド枚数の目安
    - 対象聴衆のレベル
    - プレゼン時間の目安

    ## スコープ外
    - [明示的に含めないもの]

    ## 未解決事項
    - [NEEDS CLARIFICATION] [不明点]
    ```

    ## 制約
    - 日本語で記述
    - Markdown 形式
    - ユーザーストーリーは「プレゼンターとして」「聴衆として」の視点を含む
    - 不明点には必ず [NEEDS CLARIFICATION] マーカーを付与
```

### SubAgent 完了後

1. requirements.md の内容をユーザーに提示
2. `[NEEDS CLARIFICATION]` マーカーがあれば、ユーザーに確認
3. ユーザーのフィードバックを反映して requirements.md を更新
4. ユーザーが承認したら Phase 3 に進む

---

## Phase 3: 設計

**SubAgent 委譲**: Task ツールで設計エージェントを起動する。

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "設計ドキュメント作成"
  prompt: |
    あなたは spec-analyst です。要件に基づいて design.md を作成してください。

    ## 入力
    - .kiro/specs/{spec-name}/requirements.md の内容

    ## 参照
    - docs/slidev-knowhow.md — レイアウト一覧・コンポーネント・設計原則
    - docs/slide-patterns.md — パターンカタログ

    ## 出力先
    .kiro/specs/{spec-name}/design.md

    ## 出力フォーマット

    ```markdown
    # 設計: {機能名}

    ## スライド構成
    | # | タイトル | レイアウト | パターン | 備考 |
    |---|---------|----------|---------|------|
    | 1 | 表紙 | cover | タイトルスライド | - |
    | 2 | アジェンダ | default | アジェンダ | v-clicks 使用 |
    ...

    ## コンポーネント設計
    [カスタムコンポーネントが必要な場合のみ]

    ## スタイル設計
    [テーマカスタマイズが必要な場合のみ]

    ## 技術的考慮事項
    - [Slidev 固有の制約・注意点]
    ```

    ## 制約
    - 日本語で記述
    - レイアウトは docs/slidev-knowhow.md の一覧から選択
    - パターンは docs/slide-patterns.md のカタログから選択
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
    - .kiro/specs/{spec-name}/requirements.md
    - .kiro/specs/{spec-name}/design.md

    ## 出力先
    .kiro/specs/{spec-name}/tasks.md

    ## 出力フォーマット

    ```markdown
    # 実装タスク: {機能名}

    ## タスク一覧

    ### Task 1: プロジェクト初期化
    - [ ] slides.md のフロントマター設定
    - [ ] 必要な依存パッケージの確認
    状態: pending
    依存: なし

    ### Task 2: 表紙・アジェンダスライド作成
    - [ ] cover レイアウトで表紙スライド作成
    - [ ] アジェンダスライド作成（v-clicks 使用）
    状態: pending
    依存: Task 1

    ### Task N: ...
    ```

    ## 制約
    - 日本語で記述
    - 各タスクは独立して実行可能な粒度
    - 依存関係を明示
    - スライド設計の各セクション（design.md のスライド構成表）を1-2タスクに対応させる
```

### SubAgent 完了後

1. tasks.md の内容をユーザーに提示
2. タスクの粒度・順序についてフィードバックを収集
3. ユーザーが承認したら Phase 5 に進む

---

## Phase 5: 実装

**SubAgent 委譲**: Task ツールで `slide-developer` 相当のエージェントを起動する。
tasks.md のタスクを順に実行し、スライドを生成する。

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "スライド実装"
  prompt: |
    あなたは slide-developer です。タスクリストに従ってスライドを実装してください。

    ## 入力
    - .kiro/specs/{spec-name}/requirements.md
    - .kiro/specs/{spec-name}/design.md
    - .kiro/specs/{spec-name}/tasks.md

    ## 参照
    - docs/slidev-knowhow.md — Slidev 構文リファレンス
    - docs/slide-patterns.md — スライドパターンカタログ

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

    ## 制約
    - tasks.md のタスクを順に実行
    - 各タスク完了後、tasks.md の状態を更新（pending → done）
    - 全タスク完了後、実装サマリーを出力
```

### SubAgent 完了後

1. 生成されたスライドの概要をユーザーに報告
2. **レビュー**: Task ツールで `slide-reviewer` エージェントを起動してレビュー

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "スライドレビュー"
  prompt: |
    あなたは slide-reviewer です。生成されたスライドをレビューしてください。

    ## 入力
    - slides.md
    - .kiro/specs/{spec-name}/requirements.md（要件との整合性チェック用）
    - .kiro/specs/{spec-name}/design.md（設計との整合性チェック用）

    ## チェック項目
    - 構文検証（フロントマター、レイアウト名、コードブロック）
    - コンテンツ密度（1スライド7項目以下、3秒ルール）
    - レイアウト多様性（同一レイアウト3枚連続禁止）
    - ストーリーフロー（論理的な流れ）
    - 要件・設計との整合性

    ## 出力
    構造化されたレビューレポート（スコア、問題点、改善提案）
```

3. レビュー結果をユーザーに提示
4. 修正が必要な場合はユーザーと相談して対応

---

## フェーズ間のルール

- **各フェーズ終了時にユーザー承認を得てから次に進む**
- ユーザーが「スキップ」と言った場合、そのフェーズの成果物をデフォルト内容で作成して次に進む
- ユーザーが「戻る」と言った場合、指定フェーズに戻って再実行
- SubAgent のエラー時はメインセッションでリカバリを試みる

## 成果物の配置

```
.kiro/specs/{spec-name}/
├── requirements.md   # Phase 2: 要件
├── design.md         # Phase 3: 設計
└── tasks.md          # Phase 4: 実装計画

slides.md             # Phase 5: 実装（プロジェクトルート）
components/           # Phase 5: カスタムコンポーネント（必要に応じて）
styles/               # Phase 5: スタイル（必要に応じて）
```

## 既存コマンドとの関係

- `/sdd` は `/speckit.*` コマンド群の上位レイヤーとして機能
- 既存の `/speckit.*` コマンドは個別利用も引き続き可能
- `/sdd` は SubAgent 委譲を内蔵しているため、コンテキスト効率が良い
