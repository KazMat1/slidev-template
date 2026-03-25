---
name: sdd-analyze
description: "SDD 整合性分析: 要件・設計・タスクの整合性を読取専用でチェック"
---

# SDD Analyze

既存の spec 成果物（requirements.md, design.md, tasks.md）の整合性を分析する独立コマンド。
`/sdd` Phase 5 と同等の分析を、パイプライン外で個別実行できる。

手動編集後の品質ゲートや、定期的な整合性チェックに利用する。

## 引数

- `$ARGUMENTS` — spec-name（例: `ai-code-gen-intro`）

---

## 実行手順

### 1. 入力ファイルの確認

以下のファイルが存在するか確認:
- `docs/specs/{spec-name}/requirements.md`
- `docs/specs/{spec-name}/design.md`
- `docs/specs/{spec-name}/tasks.md`
- `docs/specs/constitution.md`（オプション）

いずれか必須ファイル（requirements.md, design.md, tasks.md）が欠けている場合はエラーを報告して終了。

### 2. SubAgent 委譲

Task ツールで `spec-analyst` エージェントを起動する。

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

### 3. SubAgent 完了後

1. 分析レポートをユーザーに提示
2. **CRITICAL 問題がある場合**: 修正対象の成果物と具体的な修正案を提示
3. CRITICAL なしの場合、レポートのサマリーを報告

---

## 注意事項

- **読取専用**: このコマンドはファイルを一切変更しない
- `/sdd` Phase 5 と同等の分析ロジックだが、パイプライン外で独立実行可能
- 手動で requirements.md や design.md を編集した後の品質確認に最適
- Constitution が存在しない場合、Pass D（Constitution 整合性）はスキップされる
