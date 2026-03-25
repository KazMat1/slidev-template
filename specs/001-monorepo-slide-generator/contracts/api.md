# API Contracts: Monorepo スライド自動生成アプリ

**Date**: 2026-03-25 | **Branch**: `001-monorepo-slide-generator`
**Server**: Hono (packages/server) | **Base URL**: `http://localhost:3001/api`

---

## POST /api/projects

新規プロジェクトを作成する。

**Request Body**:
```json
{
  "name": "Q4 提案書",
  "inputText": "- 背景と課題\n- 提案するソリューション\n- 期待される効果",
  "templateId": "proposal",
  "settings": {
    "language": "ja",
    "slideCount": null,
    "theme": "default"
  }
}
```

**Response 201**:
```json
{
  "id": "01JBCDEFG12345",
  "name": "Q4 提案書",
  "inputText": "...",
  "templateId": "proposal",
  "settings": { ... },
  "status": "draft",
  "createdAt": "2026-03-25T10:00:00Z",
  "updatedAt": "2026-03-25T10:00:00Z"
}
```

**Error 400**: バリデーションエラー
```json
{
  "error": "VALIDATION_ERROR",
  "details": [{ "field": "name", "message": "Required" }]
}
```

---

## GET /api/projects

プロジェクト一覧を取得する。

**Response 200**:
```json
{
  "projects": [
    {
      "id": "01JBCDEFG12345",
      "name": "Q4 提案書",
      "templateId": "proposal",
      "status": "generated",
      "createdAt": "2026-03-25T10:00:00Z",
      "updatedAt": "2026-03-25T10:30:00Z"
    }
  ]
}
```

---

## GET /api/projects/:id

プロジェクト詳細を取得する。

**Response 200**: Project オブジェクト全体（POST /api/projects のレスポンスと同型）

**Error 404**:
```json
{ "error": "NOT_FOUND", "message": "Project not found" }
```

---

## POST /api/projects/:id/generate

スライド生成を開始する（ストリーミング）。

**Request Body** (optional):
```json
{
  "additionalInstructions": "もっと簡潔に、図を多めに"
}
```

**Response 200** (Server-Sent Events):
```
event: progress
data: {"stage": "analyzing", "message": "入力テキストを分析中..."}

event: progress
data: {"stage": "generating", "message": "スライド 3/12 を生成中..."}

event: slide
data: {"slideIndex": 0, "markdown": "---\nlayout: cover\n---\n\n# タイトル\n"}

event: complete
data: {"totalSlides": 12, "slidesPath": "data/projects/01JBCDEFG12345/slides.md"}

event: error
data: {"error": "GENERATION_FAILED", "message": "Claude API timeout"}
```

**Error 409**: 既に生成中
```json
{ "error": "ALREADY_GENERATING", "message": "Generation already in progress" }
```

---

## GET /api/projects/:id/slides

生成されたスライドのマークダウンを取得する。

**Response 200**:
```json
{
  "markdown": "---\ntheme: default\ntitle: Q4 提案書\n---\n\n# Q4 提案書\n...",
  "slideCount": 12
}
```

**Error 404**: スライド未生成

---

## PUT /api/projects/:id/slides

スライドのマークダウンを更新する（手動編集）。

**Request Body**:
```json
{
  "markdown": "---\ntheme: default\ntitle: Q4 提案書\n---\n\n# 更新されたタイトル\n..."
}
```

**Response 200**:
```json
{
  "markdown": "...",
  "slideCount": 12,
  "updatedAt": "2026-03-25T11:00:00Z"
}
```

Slidev の `slides.md` にも同時に書き込み、HMR で自動プレビュー更新。

---

## POST /api/projects/:id/export

PDF エクスポートを実行する。

**Request Body** (optional):
```json
{
  "format": "pdf",
  "withClicks": false,
  "dark": false
}
```

**Response 200**:
```json
{
  "exportPath": "data/projects/01JBCDEFG12345/export.pdf",
  "downloadUrl": "/api/projects/01JBCDEFG12345/export/download"
}
```

**Error 400**: スライド未生成

---

## GET /api/projects/:id/export/download

エクスポートされた PDF をダウンロードする。

**Response 200**: `application/pdf` バイナリ

**Error 404**: エクスポートファイルが存在しない

---

## GET /api/templates

利用可能なテンプレート一覧を取得する。

**Response 200**:
```json
{
  "templates": [
    {
      "id": "proposal",
      "name": "提案書",
      "description": "ビジネス提案書向けのレイアウト構成。表紙→アジェンダ→セクション→比較→KPI→引用→まとめ",
      "layoutSequence": [
        { "layout": "cover", "purpose": "title" },
        { "layout": "default", "purpose": "agenda" },
        { "layout": "section", "purpose": "section-break" },
        { "layout": "two-cols", "purpose": "comparison" },
        { "layout": "fact", "purpose": "kpi" },
        { "layout": "quote", "purpose": "testimonial" },
        { "layout": "end", "purpose": "closing" }
      ],
      "components": ["CompareCards", "KpiHighlight", "StepFlow"]
    }
  ]
}
```

---

## DELETE /api/projects/:id

プロジェクトを削除する。

**Response 204**: 削除成功（ファイルシステム上のプロジェクトディレクトリも削除）

**Error 404**: プロジェクトが存在しない

---

## Error Format

全エラーレスポンスは以下の形式:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "details": []
}
```

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | リクエストバリデーション失敗 |
| NOT_FOUND | 404 | リソースが存在しない |
| ALREADY_GENERATING | 409 | 生成が既に進行中 |
| GENERATION_FAILED | 500 | AI 生成エラー |
| EXPORT_FAILED | 500 | PDF エクスポートエラー |
