# 実装タスク: マルチテーマ対応デザインシステム

## Phase 1: セットアップ

- [x] T001 ThemeConfig 型定義ファイルの作成 [US3]
  - `apps/preview/types/theme.ts` を作成
  - design.md の ThemeConfig インターフェースをそのまま記述
  - テーマ作成時の参照ドキュメントとして機能させる

- [x] T002 slides.md に `addons` フロントマターを追加 [US1]
  - `addons: ['./themes/relic']` をフロントマターに追加
  - 既存の `theme: default` は維持

## Phase 2: 基盤（全 Story のブロッカー）

- [x] T003 ReLic テーマの addon ディレクトリ構造を作成 [US2, US7]
  - `apps/preview/themes/relic/` 配下に以下を作成:
    - `package.json` (`slidev-addon-relic`, keywords: `["slidev-addon", "slidev"]`)
    - `setup/main.ts` (`import '../styles/tokens.css'`)
    - `layouts/` (空ディレクトリ — T005〜T009 で配置)
    - `components/` (空ディレクトリ — T004, T010〜T011 で配置)
    - `components/decorations/` (空ディレクトリ — T012〜T014 で配置)
    - `styles/` (空ディレクトリ — T004 で配置)
    - `assets/` (logo.png, border.png を配置 — 画像ファイルがない場合はプレースホルダー)

- [x] T004 ReLic テーマの tokens.css を作成 [US3]
  - `apps/preview/themes/relic/styles/tokens.css` を作成
  - 汎用 CSS 変数名で定義: `--color-primary` (#143C5D), `--color-secondary` (#D7A47A), `--color-accent` (#E40077) 等
  - ReLic 固有エイリアスを追加: `--color-navy: var(--color-primary)` 等（後方互換）
  - フォント、フォントサイズ、Slidev overrides を含む
  - design.md の tokens.css セクションに準拠

- [x] T005 apps/preview/styles/index.css から :root トークンを削除 [US1]
  - `:root { ... }` ブロック全体を削除
  - `.slidev-layout` 等の共通タイポグラフィスタイルは残す
  - ユーティリティクラスを汎用名に更新: `.bg-navy` → `.bg-primary`, `.text-navy` → `.text-primary` 等
  - `.accent-heading` の `color` を `var(--color-accent)` に変更

**チェックポイント**: 基盤完了 — addon ディレクトリ構造・tokens.css・index.css 整備済み

## Phase 3: ReLic テーマ移行 (P1) 🎯 MVP

**ゴール**: 既存デザインが addon 構造で動作

- [x] T006 SlideMaster.vue をテーマに移動・改修 [US2, US5]
  - `apps/preview/components/SlideMaster.vue` → `apps/preview/themes/relic/components/SlideMaster.vue` にコピー
  - `masterConfig` に `logoImage` を追加: `import logoImage from '../assets/logo.png'`
  - ロゴ表示テンプレートを画像優先に変更（`<img>` + テキストフォールバック）
  - Props インターフェースは現行維持（showFooter, showCornerBrackets, showLogo, footerTheme, logoPosition）
  - `showFooterLine` prop を追加する（border.png にフッターラインが含まれるため、content レイアウトでライン非表示にする用途）

- [x] T007 DataTable.vue をテーマに移動・改修 [US2, US5]
  - `apps/preview/components/DataTable.vue` → `apps/preview/themes/relic/components/DataTable.vue` にコピー
  - CSS 変数参照を汎用名に更新: `--color-navy` → `--color-primary`, `--color-brown` → `--color-secondary`
  - フォールバック値は維持: `var(--color-primary, #143C5D)`
  - Props インターフェース（headers, rows, rowHeaders）は現行維持

- [x] T008 [P] CoverStripes 装飾コンポーネントを作成 [US2, US4]
  - `apps/preview/themes/relic/components/decorations/CoverStripes.vue` を作成
  - cover-1, cover-2 のインライン斜めストライプを抽出
  - Props: `variant: 'small' | 'large'` でストライプサイズを制御
  - `small` = cover-1 相当（Navy: w200px, Brown: w180px）
  - `large` = cover-2 相当（Navy: w280px, Brown: w240px）

- [x] T009 [P] SectionTriangles 装飾コンポーネントを作成 [US2, US4]
  - `apps/preview/themes/relic/components/decorations/SectionTriangles.vue` を作成
  - section-divider のインライン三角形を抽出
  - Brown (380px), Pink (370px), Navy (360px) の3つの三角形

- [x] T010 [P] EndStripes 装飾コンポーネントを作成 [US2, US4]
  - `apps/preview/themes/relic/components/decorations/EndStripes.vue` を作成
  - end レイアウトのインラインストライプを抽出
  - Brown (w240px), Pink (w8px), Navy (w280px) の3本

- [x] T011 cover-1.vue レイアウトをテーマに移行 [US2]
  - 依存: T006, T008
  - `apps/preview/themes/relic/layouts/cover-1.vue` を作成
  - SlideMaster の import パスをテーマ内相対パスに変更: `'../components/SlideMaster.vue'`
  - decoration スロットに `<CoverStripes variant="small" />` を使用
  - ロゴ画像表示を SlideMaster 経由で実現
  - **検証**: addon 内の `../assets/logo.png` 相対パス import が Vite で正常に解決されることを確認

- [x] T012 cover-2.vue レイアウトをテーマに移行 [US2]
  - 依存: T006, T008
  - `apps/preview/themes/relic/layouts/cover-2.vue` を作成
  - decoration スロットに `<CoverStripes variant="large" />` を使用
  - それ以外は cover-1 と同様の構造

- [x] T013 content.vue レイアウトをテーマに移行 [US2]
  - 依存: T006
  - `apps/preview/themes/relic/layouts/content.vue` を作成
  - `showCornerBrackets` を削除し、border.png を decoration スロットで背景表示
  - `import borderImage from '../assets/border.png'` で画像を参照
  - `<img :src="borderImage" class="content-border" alt="" aria-hidden="true" />` を decoration スロットに配置
  - `showFooter: true` は維持（copyright + ページ番号）
  - border.png にフッターラインが含まれる場合はフッターライン CSS を無効化

- [x] T014 section-divider.vue レイアウトをテーマに移行 [US2]
  - 依存: T006, T009
  - `apps/preview/themes/relic/layouts/section-divider.vue` を作成
  - decoration スロットに `<SectionTriangles />` を使用
  - `showFooter: true`, `footerTheme: 'light'` を維持

- [x] T015 end.vue レイアウトをテーマに移行 [US2]
  - 依存: T006, T010
  - `apps/preview/themes/relic/layouts/end.vue` を作成
  - decoration スロットに `<EndStripes />` を使用
  - ロゴを `import logoImage from '../assets/logo.png'` で画像表示に変更
  - ミッションテキストのデフォルトスロットは維持

- [x] T016 apps/preview/layouts/ と apps/preview/components/ を空にする [US1]
  - 依存: T011〜T015 が全て完了後
  - `apps/preview/layouts/` から cover-1.vue, cover-2.vue, content.vue, section-divider.vue, end.vue を削除
  - `apps/preview/components/` から SlideMaster.vue, DataTable.vue を削除
  - userRoot にレイアウト/コンポーネントが残らないことを確認（addon のものが解決される）

- [x] T017 ReLic テーマでのビルド検証 [US2]
  - 依存: T016
  - `pnpm --filter @slidegen/preview exec slidev build` を実行（dangerouslyDisableSandbox: true）
  - ビルドエラーがないことを確認
  - 全5レイアウト（cover-1, cover-2, content, section-divider, end）が正常に描画されることを確認

**チェックポイント**: ReLic テーマ単独で全レイアウトが動作

## Phase 4: minimal テーマ作成 (P2)

**ゴール**: テーマ切替の検証

- [x] T018 minimal テーマの addon ディレクトリ構造を作成 [US4, US6]
  - `apps/preview/themes/minimal/` 配下に以下を作成:
    - `package.json` (`slidev-addon-minimal`, keywords: `["slidev-addon", "slidev"]`)
    - `setup/main.ts` (`import '../styles/tokens.css'`)
    - `styles/tokens.css` — Blue (#2563EB) / Purple (#7C3AED) / Amber (#F59E0B) カラー
    - `assets/logo.png` — プレースホルダーロゴ画像

- [x] T019 minimal テーマの SlideMaster.vue を作成 [US4, US5]
  - 依存: T018
  - `apps/preview/themes/minimal/components/SlideMaster.vue` を作成
  - masterConfig: copyright = "Copyright (C) 2025 Example Corp.", logoText = "Example", logoTagline = "Innovation for Everyone."
  - ReLic の SlideMaster をベースに簡素化

- [x] T020 [P] minimal テーマの DataTable.vue を作成 [US4]
  - 依存: T018
  - `apps/preview/themes/minimal/components/DataTable.vue` を作成
  - CSS 変数参照は `--color-primary`, `--color-secondary` を使用（ReLic と同じ構造）

- [x] T021 [P] minimal テーマの cover-1.vue を作成 [US4]
  - 依存: T019
  - `apps/preview/themes/minimal/layouts/cover-1.vue` を作成
  - シンプルなテキストのみの表紙（装飾コンポーネントなし）
  - SlideMaster を使用し、ロゴ画像を表示

- [x] T022 [P] minimal テーマの content.vue を作成 [US4]
  - 依存: T019
  - `apps/preview/themes/minimal/layouts/content.vue` を作成
  - border.png の代わりに CSS ボーダーを使用
  - `showFooter: true` でフッター表示

- [x] T023 [P] minimal テーマの end.vue を作成 [US4]
  - 依存: T019
  - `apps/preview/themes/minimal/layouts/end.vue` を作成
  - 装飾なし、ロゴ画像のみ表示

- [x] T024 テーマ切替のビルド検証 [US1, US4]
  - 依存: T017, T021〜T023
  - slides.md の addons を `['./themes/minimal']` に変更
  - `pnpm --filter @slidegen/preview exec slidev build` を実行（dangerouslyDisableSandbox: true）
  - ビルドエラーがないことを確認
  - cover-1, content, end の3レイアウトが minimal テーマのデザインで描画されることを確認
  - 検証後、addons を `['./themes/relic']` に戻す

**チェックポイント**: テーマ切替が動作

## Phase 5: 仕上げ

- [x] T025 DataTable のテーマ連動を検証 [US2]
  - 依存: T024
  - ReLic テーマ: ヘッダー Navy 背景白文字、行ヘッダー Brown 背景白文字
  - minimal テーマ: ヘッダー Blue 背景白文字、行ヘッダー Purple 背景白文字
  - テーマ切替時に色が正しく変わることを確認

- [x] T026 CSS 変数フォールバックの確認 [US3]
  - 依存: T024
  - テーマの tokens.css から一部トークン（例: `--color-accent`）を一時的に削除
  - DataTable やレイアウトが CSS フォールバック値で描画されることを確認
  - 確認後、削除したトークンを復元

- [x] T027 最終ビルド検証 [US1, US2]
  - 依存: T025, T026
  - ReLic テーマで `pnpm --filter @slidegen/preview exec slidev build` を実行（dangerouslyDisableSandbox: true）
  - 全5レイアウト + DataTable の表示を確認
  - 移行前との視覚的差異がないことを目視確認

## 依存関係・実行順序

```
Phase 1 (並列可)
  T001 ──────────────────────────────────────────────┐
  T002 ──────────────────────────────────────────────┤
                                                     │
Phase 2 (T003 → T004, T005 は並列可)                  │
  T003 ─┬─→ T004 [P]                                │
        └─→ T005 [P]                                │
                                                     │
Phase 3                                              │
  T004 ─→ T006 ─┬─→ T011 (cover-1)                  │
                 ├─→ T012 (cover-2)                  │
                 ├─→ T013 (content)                  │
                 ├─→ T014 (section-divider)          │
                 └─→ T015 (end)                      │
  T008 ──────────┤ (CoverStripes → T011, T012)       │
  T009 ──────────┤ (SectionTriangles → T014)         │
  T010 ──────────┘ (EndStripes → T015)               │
  T007 ────────── (DataTable、レイアウトと並列可)       │
  T011〜T015 全完了 → T016 → T017                     │
                                                     │
Phase 4                                              │
  T018 → T019 ─┬─→ T021 [P]                         │
               ├─→ T022 [P]                         │
               └─→ T023 [P]                         │
  T018 → T020 [P]                                    │
  T017 + T021〜T023 → T024                           │
                                                     │
Phase 5                                              │
  T024 → T025, T026 → T027                          │
```

### クリティカルパス

T003 → T004 → T006 → T011〜T015 → T016 → T017 → T024 → T027

## 表記

- `[P]`: 並列実行可能
- `[USn]`: 対応するユーザーストーリー
- `T###`: タスク ID（連番）
