# Data Model: Monorepo スライド自動生成アプリ

**Date**: 2026-03-25 | **Branch**: `001-monorepo-slide-generator`

## Entities

### 1. Project

ユーザーが作成するプレゼンテーション単位。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (ULID) | Yes | 一意識別子 |
| name | string | Yes | プロジェクト名 |
| inputText | string | Yes | ユーザー入力テキスト（箇条書き等） |
| templateId | string | Yes | 選択されたテンプレートの ID |
| settings | GenerationSettings | Yes | 生成設定 |
| status | ProjectStatus | Yes | プロジェクト状態 |
| createdAt | string (ISO 8601) | Yes | 作成日時 |
| updatedAt | string (ISO 8601) | Yes | 更新日時 |

**State Transitions**:
```
draft → generating → generated → editing → generated
                  ↘ error ↗
```

- `draft`: 初期状態。入力テキスト編集中
- `generating`: AI 生成実行中
- `generated`: 生成完了。プレビュー・エクスポート可能
- `editing`: ユーザーがマークダウンを手動編集中
- `error`: 生成エラー発生

**Storage**: `data/projects/{id}/project.json`

---

### 2. GenerationSettings

スライド生成時の設定。Project に埋め込み。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| language | string | Yes | 出力言語 ('ja' \| 'en') |
| slideCount | number \| null | No | 希望スライド数（null = 自動） |
| theme | string | Yes | Slidev テーマ名 (default: 'default') |
| additionalInstructions | string | No | 追加指示（「もっと簡潔に」等） |

---

### 3. Template

スライドのレイアウト構成・デザイン・使用コンポーネントを定義したプリセット。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | テンプレート ID ('proposal' \| 'tech-talk' \| 'general') |
| name | string | Yes | 表示名 |
| description | string | Yes | テンプレートの説明 |
| layoutSequence | LayoutHint[] | Yes | 推奨レイアウト順序 |
| components | string[] | Yes | 使用するカスタムコンポーネント名 |
| promptTemplate | string | Yes | AI 生成用プロンプトテンプレート |

**Storage**: `packages/generator/src/templates/{id}.ts` (コード定義、静的)

**Initial Templates**:

| ID | Name | Layout Sequence | Components |
|----|------|-----------------|------------|
| `proposal` | 提案書 | cover → agenda → section → two-cols → fact → quote → end | CompareCards, KpiHighlight, StepFlow |
| `tech-talk` | 技術発表 | cover → agenda → default (code) → two-cols → image-right → end | DataTable, code blocks |
| `general` | 一般プレゼン | cover → agenda → default → section → center → end | (minimal) |

---

### 4. LayoutHint

テンプレートが推奨するスライドレイアウトのヒント。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| layout | string | Yes | Slidev レイアウト名 (cover, default, two-cols, etc.) |
| purpose | string | Yes | このスライドの目的 (title, agenda, content, summary, etc.) |
| optional | boolean | No | 省略可能かどうか (default: false) |

---

### 5. SlideSet (File-based, not JSON)

生成された Slidev ファイル群。JSON ではなくファイルシステム上のアーティファクト。

| File/Dir | Description |
|----------|-------------|
| `slides.md` | メイン Slidev マークダウン |
| `components/` | カスタム Vue コンポーネント (.vue) |
| `styles/index.css` | グローバルスタイル |

**Storage**: `data/projects/{id}/slides.md`, `data/projects/{id}/components/`, etc.

---

## Relationships

```
Project 1──1 GenerationSettings (embedded)
Project *──1 Template (by templateId reference)
Project 1──1 SlideSet (by file system co-location)
Template 1──* LayoutHint (embedded array)
```

---

## Validation Rules

### Project
- `name`: 1-100 文字
- `inputText`: 1-10,000 文字（空入力は edge case で最小スライド生成）
- `templateId`: 登録済みテンプレート ID のいずれか

### GenerationSettings
- `language`: 'ja' | 'en'
- `slideCount`: null または 3-50 の整数
- `theme`: 'default' | (将来拡張)

### Template
- `layoutSequence`: 最低 3 要素（cover + content + end）
- `components`: 既存コンポーネント名のみ
