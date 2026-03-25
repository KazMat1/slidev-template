# Tasks: Monorepo スライド自動生成アプリ

**Input**: Design documents from `/specs/001-monorepo-slide-generator/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo 初期化とパッケージ構成

- [x] T001 Create monorepo root configuration with package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .env.example in project root
- [x] T002 [P] Initialize packages/shared with package.json, tsconfig.json, and shared type definitions (Project, Template, GenerationSettings, ProjectStatus, LayoutHint) in packages/shared/src/types.ts
- [x] T003 [P] Initialize packages/generator with package.json, tsconfig.json, and entry point in packages/generator/src/index.ts
- [x] T004 [P] Initialize packages/server with package.json, tsconfig.json, Hono setup, and entry point in packages/server/src/index.ts
- [x] T005 [P] Initialize apps/web with package.json, vite.config.ts, Vue 3, Vue Router, UnoCSS, and App.vue scaffold in apps/web/
- [x] T006 [P] Initialize apps/preview with package.json, Slidev configuration, and placeholder slides.md in apps/preview/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全 User Story が依存するコアインフラ

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Implement file-based project storage service (CRUD operations on data/projects/{id}/project.json) with ULID generation in packages/server/src/services/storage.ts
- [x] T008 [P] Implement Slidev file sync service (write generated markdown to apps/preview/slides.md with debounce) in packages/server/src/services/slidev-sync.ts
- [x] T009 [P] Configure Hono API server with CORS, error handling middleware, and Zod validation helpers in packages/server/src/index.ts
- [x] T010 [P] Setup Slidev preview project with default theme, UnoCSS, and initial placeholder content in apps/preview/slides.md and apps/preview/styles/index.css
- [x] T011 [P] Create Vue Router configuration with route definitions (/, /generate, /editor/:id) in apps/web/src/router.ts and apps/web/src/main.ts

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — 箇条書きからスライド生成 (Priority: P1) MVP

**Goal**: ユーザーがテキスト入力 → AI スライド生成 → ブラウザプレビュー → PDF エクスポートの全フローを実行できる

**Independent Test**: テキスト入力画面から箇条書きを入力し、「生成」ボタンを押すと Slidev 形式のスライドが生成され、ブラウザプレビューで確認でき、PDF としてエクスポートできる

### Implementation for User Story 1

- [x] T012 [P] [US1] Implement prompt builder with Slidev knowledge (layouts, components, design principles from docs/) in packages/generator/src/prompt-builder.ts
- [x] T013 [P] [US1] Define general template (cover → agenda → default → section → center → end) in packages/generator/src/templates/general.ts
- [x] T014 [US1] Implement Claude API streaming generation (Anthropic SDK, SSE output) in packages/generator/src/generator.ts
- [x] T015 [US1] Implement POST /api/projects route (create project with draft status) in packages/server/src/routes/projects.ts
- [x] T016 [US1] Implement POST /api/projects/:id/generate route (SSE streaming, write slides.md to project dir + Slidev sync) in packages/server/src/routes/generate.ts
- [x] T017 [US1] Implement GET /api/projects/:id/slides route (return generated markdown) in packages/server/src/routes/projects.ts
- [x] T018 [US1] Implement POST /api/projects/:id/export and GET /api/projects/:id/export/download routes (spawn slidev export CLI) in packages/server/src/routes/export.ts
- [x] T019 [US1] Create text input page with textarea, generate button, and SSE progress display in apps/web/src/pages/GeneratePage.vue
- [x] T020 [US1] Create slide preview panel component (iframe embedding localhost:3030) in apps/web/src/components/PreviewPanel.vue
- [x] T021 [US1] Create generation progress indicator component (SSE event handling, stage display) in apps/web/src/components/GenerationProgress.vue
- [x] T022 [US1] Create PDF export button component with download handling in apps/web/src/components/ExportButton.vue
- [x] T023 [US1] Wire up GeneratePage with API calls, preview panel, and export button in apps/web/src/pages/GeneratePage.vue

**Checkpoint**: User Story 1 fully functional — text input → generation → preview → PDF export works end-to-end

---

## Phase 4: User Story 2 — テンプレート選択によるデザイン適用 (Priority: P2)

**Goal**: ユーザーが 3 種類のテンプレート（提案書、技術発表、一般）を選択し、テンプレートに応じたレイアウト・コンポーネント構成のスライドが生成される

**Independent Test**: テンプレート選択 UI から異なるテンプレートを選び、同じ入力テキストで異なるデザインのスライドが生成されることを確認する

### Implementation for User Story 2

- [x] T024 [P] [US2] Define proposal template (cover → agenda → section → two-cols → fact → quote → end, components: CompareCards, KpiHighlight, StepFlow) in packages/generator/src/templates/proposal.ts
- [x] T025 [P] [US2] Define tech-talk template (cover → agenda → default/code → two-cols → image-right → end, components: DataTable) in packages/generator/src/templates/tech-talk.ts
- [x] T026 [P] [US2] Implement custom Slidev Vue components (CompareCards, KpiHighlight, StepFlow, DataTable) in apps/preview/components/
- [x] T027 [US2] Update prompt builder to accept template definition and incorporate layout sequence and component hints in packages/generator/src/prompt-builder.ts
- [x] T028 [US2] Implement GET /api/templates route (return all template definitions) in packages/server/src/routes/templates.ts
- [x] T029 [US2] Create template selector component (card grid with name, description, layout preview) in apps/web/src/components/TemplateSelector.vue
- [x] T030 [US2] Integrate template selection into GeneratePage (selector → templateId in project creation → generation) in apps/web/src/pages/GeneratePage.vue

**Checkpoint**: User Story 2 complete — 3 templates available, different layouts generated per template

---

## Phase 5: User Story 3 — 生成済みスライドの編集・再生成 (Priority: P3)

**Goal**: ユーザーが生成されたスライドのマークダウンを直接編集し、リアルタイムプレビューで確認できる。追加指示による再生成も可能

**Independent Test**: 生成済みスライドの編集画面でマークダウンを変更し、プレビューにリアルタイム反映されることを確認する

### Implementation for User Story 3

- [x] T031 [P] [US3] Create markdown editor component (md-editor-v3 integration) in apps/web/src/components/MarkdownEditor.vue
- [x] T032 [P] [US3] Implement PUT /api/projects/:id/slides route (update markdown, sync to Slidev) in packages/server/src/routes/projects.ts
- [x] T033 [US3] Create editor page with split pane layout (markdown editor left, iframe preview right) in apps/web/src/pages/EditorPage.vue
- [x] T034 [US3] Implement debounced auto-save composable (300ms debounce, PUT to API, Slidev HMR sync) in apps/web/src/composables/useAutoSave.ts
- [x] T035 [US3] Create regeneration panel component (additional instructions input + regenerate button, SSE handling) in apps/web/src/components/RegeneratePanel.vue
- [x] T036 [US3] Integrate editor page into router and add navigation from GeneratePage after generation complete in apps/web/src/router.ts

**Checkpoint**: User Story 3 complete — markdown editing with live preview and re-generation works

---

## Phase 6: User Story 4 — プロジェクト管理 (Priority: P3)

**Goal**: ユーザーが複数のプレゼンテーションプロジェクトを作成・管理でき、過去のプロジェクトを再開できる

**Independent Test**: プロジェクト一覧画面で新規作成・既存プロジェクトの再開ができることを確認する

### Implementation for User Story 4

- [x] T037 [P] [US4] Implement GET /api/projects route (list all projects with summary) in packages/server/src/routes/projects.ts
- [x] T038 [P] [US4] Implement GET /api/projects/:id route (full project detail) in packages/server/src/routes/projects.ts
- [x] T039 [P] [US4] Implement DELETE /api/projects/:id route (delete project dir) in packages/server/src/routes/projects.ts
- [x] T040 [US4] Create project list (home) page with project cards in apps/web/src/pages/HomePage.vue
- [x] T041 [US4] Create project card component (name, template, status, timestamps, actions) in apps/web/src/components/ProjectCard.vue
- [x] T042 [US4] Implement project state restoration composable (load project → navigate to generate or editor page) in apps/web/src/composables/useProject.ts
- [x] T043 [US4] Wire up HomePage as default route, add navigation between project list ↔ generate ↔ editor in apps/web/src/router.ts

**Checkpoint**: User Story 4 complete — full project CRUD and navigation works

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge case 対応、エラーハンドリング強化、全体品質向上

- [x] T044 [P] Handle edge cases in generator: empty/short input (minimal slide), long input (section splitting), mixed ja/en in packages/generator/src/generator.ts
- [x] T045 [P] Add error handling for Claude API timeout/failure with user-friendly messages and retry option in packages/server/src/routes/generate.ts
- [x] T046 [P] Add loading states, error toasts, and empty states across all UI pages in apps/web/src/components/
- [x] T047 Validate quickstart.md workflow end-to-end (setup → dev → generate → preview → export)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — MVP, complete first
- **Phase 4 (US2)**: Depends on Phase 2 + T014 (generator core) — Can start after US1 core is done
- **Phase 5 (US3)**: Depends on Phase 2 + US1 (needs generated slides to edit)
- **Phase 6 (US4)**: Depends on Phase 2 — Can proceed in parallel with US2/US3
- **Phase 7 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories. Foundation → US1 = MVP
- **US2 (P2)**: Depends on generator core from US1 (T014). Template definitions are independent, but prompt builder update (T027) extends US1's prompt-builder
- **US3 (P3)**: Depends on US1 complete (needs generated slides to edit)
- **US4 (P3)**: Independent of other stories. Only needs Foundation (Phase 2). Storage service already exists from Phase 2

### Within Each User Story

- Server routes before frontend pages (API must exist for frontend to call)
- Generator/service logic before routes (routes delegate to services)
- Components before pages (pages compose components)

### Parallel Opportunities

**Phase 1**: T002-T006 all in parallel (independent packages)
**Phase 2**: T008-T011 all in parallel (different services/apps)
**Phase 3**: T012+T013 in parallel, then T014; T015-T018 server routes can partially parallelize; T019-T022 frontend components in parallel
**Phase 4**: T024+T025+T026 all in parallel (independent templates + components)
**Phase 5**: T031+T032 in parallel (editor component + API route)
**Phase 6**: T037+T038+T039 all in parallel (independent API routes)

---

## Parallel Example: User Story 1

```bash
# Launch generator tasks in parallel:
Task: "Implement prompt builder in packages/generator/src/prompt-builder.ts"
Task: "Define general template in packages/generator/src/templates/general.ts"

# After generator core (T014), launch server routes in parallel where possible:
Task: "POST /api/projects route in packages/server/src/routes/projects.ts"
Task: "POST /api/projects/:id/export route in packages/server/src/routes/export.ts"

# Launch frontend components in parallel:
Task: "PreviewPanel in apps/web/src/components/PreviewPanel.vue"
Task: "GenerationProgress in apps/web/src/components/GenerationProgress.vue"
Task: "ExportButton in apps/web/src/components/ExportButton.vue"
```

## Parallel Example: User Story 2

```bash
# Launch all template definitions + components in parallel:
Task: "Proposal template in packages/generator/src/templates/proposal.ts"
Task: "Tech-talk template in packages/generator/src/templates/tech-talk.ts"
Task: "Custom Slidev components in apps/preview/components/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T011)
3. Complete Phase 3: User Story 1 (T012-T023)
4. **STOP and VALIDATE**: テキスト入力 → 生成 → プレビュー → PDF エクスポートの全フロー確認
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Test → **MVP release**
3. User Story 2 → Test → テンプレート選択追加
4. User Story 3 → Test → 編集・再生成追加
5. User Story 4 → Test → プロジェクト管理追加
6. Polish → 品質向上

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1 — must complete for MVP)
   - Developer B: User Story 4 (P3 — independent, only needs Foundation)
3. After US1 complete:
   - Developer A: User Story 2 (P2 — extends generator)
   - Developer B: User Story 3 (P3 — needs US1 output)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- apps/preview/slides.md is dynamically written by the server — no manual editing needed
- Slidev HMR handles preview updates automatically via file system watch
