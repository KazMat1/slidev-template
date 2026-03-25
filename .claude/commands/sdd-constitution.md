---
name: sdd-constitution
description: "プロジェクト Constitution の作成・更新。プロジェクト全体の方針・原則・制約を定義する"
---

# SDD Constitution

プロジェクト全体の方針・原則・制約を `docs/specs/constitution.md` に定義する独立コマンド。
`/sdd` パイプライン外でも利用可能。spec 作成前に実行することを推奨。

## 引数

- `$ARGUMENTS` — プロジェクトの方針・原則（自然言語）。空の場合は対話的に収集。

---

## 実行手順

### 1. 既存 Constitution の確認

`docs/specs/constitution.md` が存在するか確認する。

- **存在する場合**: 既存内容を読み込み、マージモード（原則の追加・更新）で動作
- **存在しない場合**: 新規作成モード

### 2. SubAgent 委譲

Task ツールで `spec-analyst` エージェントを起動する。

```
Task ツール呼び出し:
  subagent_type: "general-purpose"
  description: "Constitution 作成・更新"
  prompt: |
    あなたは spec-analyst です。プロジェクトの Constitution を作成・更新してください。

    ## ユーザー入力
    {$ARGUMENTS の内容}

    ## 既存 Constitution
    {既存内容がある場合はここに含める。ない場合は「新規作成」}

    ## プロジェクトコンテキスト
    - Slidev プレゼンテーションプロジェクト
    - 技術スタック: Vue 3 + TypeScript + UnoCSS + Slidev
    - CLAUDE.md の内容を参照

    ## 出力先
    docs/specs/constitution.md

    ## 出力フォーマット

    ```markdown
    # Project Constitution

    ## Core Principles
    プロジェクト全体を貫く基本原則（3-7項目）。
    各原則に ID を付与（CP-001, CP-002, ...）。
    - **CP-001: [原則名]** — [説明]

    ## Quality Standards
    成果物の品質基準。
    - **QS-001: [基準名]** — [説明]

    ## Constraints
    技術的・組織的な制約条件。
    - **CT-001: [制約名]** — [説明]

    ## Glossary
    プロジェクト固有の用語定義。
    | Term | Definition |
    |------|-----------|
    ```

    ## 制約
    - 日本語で記述
    - Markdown 形式
    - マージモードの場合: 既存の原則 ID を維持し、新しい原則を追番で追加
    - 各原則に一意の ID を付与
    - 原則は具体的かつ検証可能であること（曖昧な表現を避ける）
```

### 3. SubAgent 完了後

1. 生成/更新された `docs/specs/constitution.md` の内容をユーザーに提示
2. フィードバックを収集し、必要に応じて修正
3. 完了を報告

---

## 注意事項

- Constitution は `/sdd` パイプラインの全フェーズで参照される
- `/sdd` Phase 2（要件定義）で Constitution 違反がないかチェックされる
- `/sdd` Phase 5（整合性分析）で Constitution 整合性パスが実行される
- Constitution の変更後は、既存の spec に対して `/sdd-analyze` で再分析を推奨
