# 設計: マルチテーマ対応デザインシステム

## 技術コンテキスト

### 技術スタック

- **Slidev v51** — Markdown ベースのプレゼンテーションフレームワーク
- **Vue 3** — コンポーネントフレームワーク（Composition API + `<script setup>`）
- **TypeScript 5.x** — 型安全なテーマ設定インターフェース
- **Vite** — ビルドツール（HMR、アセットパイプライン）
- **UnoCSS** — ユーティリティ CSS（Slidev 内蔵）
- **CSS カスタムプロパティ** — デザイントークンの受け渡し手段

### 制約

- Slidev のレイアウト解決は `fg.sync`（fast-glob）によるファイルシステム走査のため、Vite alias では介入不可
- Slidev addon の `layouts/` と `components/` は自動的に解決チェーンに追加される
- addon の `setup/main.ts` はエントリポイントとして自動ロードされる
- `userRoot`（`apps/preview/`）のレイアウトが最優先で addon のレイアウトを上書きする
- monorepo 構成のため、テーマディレクトリは `apps/preview/themes/` 配下に配置

## アーキテクチャ概要

### レイアウト解決フロー

```
slides.md
  └─ addons: ['./themes/relic']
       │
       ▼
Slidev レイアウト解決チェーン（後勝ち）
  1. clientRoot（Slidev 組込みレイアウト: default, center, etc.）
  2. themeRoots（Slidev 公式テーマ: theme: default）
  3. addonRoots ← ./themes/relic/layouts/ がここに追加
  4. userRoot  ← apps/preview/layouts/（空にする）
       │
       ▼
テーマの layouts/ から Vue コンポーネントが解決される
  cover-1.vue → themes/relic/layouts/cover-1.vue
  content.vue → themes/relic/layouts/content.vue
  ...
```

### テーマ構成の全体像

```
┌─────────────────────────────────────────────┐
│  slides.md                                   │
│  addons: ['./themes/relic']                  │
│  layout: cover-1 / content / ...             │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  themes/relic/ (Slidev addon)                │
│                                              │
│  ┌─ layouts/        レイアウト Vue ファイル   │
│  ├─ components/     SlideMaster, DataTable,  │
│  │                  装飾コンポーネント        │
│  ├─ styles/         CSS 変数（tokens.css）    │
│  ├─ assets/         logo.png, border.png     │
│  ├─ setup/main.ts   CSS import エントリ      │
│  └─ package.json    addon メタデータ          │
└─────────────────────────────────────────────┘
```

### テーマ切替時の動作

```
addons: ['./themes/relic']  →  addons: ['./themes/minimal']
         │                               │
         ▼                               ▼
  relic/layouts/*            minimal/layouts/*
  relic/components/*         minimal/components/*
  relic/styles/tokens.css    minimal/styles/tokens.css
  relic/assets/logo.png      minimal/assets/logo.png
```

Slidev が addon の roots を再解決し、レイアウト・コンポーネント・スタイルが一括で切り替わる。

## プロジェクト構造

### 変更後のディレクトリツリー

```
apps/preview/
├── slides.md                          # addons: ['./themes/relic'] を指定
├── package.json
├── styles/
│   └── index.css                      # 共通スタイル（.slidev-layout 等）のみ残す
│                                      #  ※ :root のデザイントークンはテーマ側に移動
├── layouts/                           # ★ 空にする（テーマ addon のレイアウトを優先させるため）
│   └── (削除 or 空ディレクトリ)
├── components/                        # ★ 空にする（テーマ addon のコンポーネントを優先させるため）
│   └── (削除 or 空ディレクトリ)
│
├── themes/
│   ├── relic/                         # ★ ReLic テーマ（addon）
│   │   ├── package.json               # { "name": "slidev-addon-relic" }
│   │   ├── setup/
│   │   │   └── main.ts               # import '../styles/tokens.css'
│   │   ├── layouts/
│   │   │   ├── cover-1.vue
│   │   │   ├── cover-2.vue
│   │   │   ├── content.vue
│   │   │   ├── section-divider.vue
│   │   │   └── end.vue
│   │   ├── components/
│   │   │   ├── SlideMaster.vue        # copyright/logo をテーマ固有値で定義
│   │   │   ├── DataTable.vue          # CSS 変数でテーマ連動
│   │   │   └── decorations/
│   │   │       ├── CoverStripes.vue   # 斜めストライプ装飾
│   │   │       ├── SectionTriangles.vue  # 三角形装飾
│   │   │       └── EndStripes.vue     # end 用ストライプ装飾
│   │   ├── styles/
│   │   │   └── tokens.css             # :root CSS カスタムプロパティ
│   │   └── assets/
│   │       ├── logo.png               # ReLic ロゴ画像
│   │       └── border.png             # コンテンツ枠線画像
│   │
│   └── minimal/                       # ★ 検証用ダミーテーマ（addon）
│       ├── package.json               # { "name": "slidev-addon-minimal" }
│       ├── setup/
│       │   └── main.ts
│       ├── layouts/
│       │   ├── cover-1.vue
│       │   ├── content.vue
│       │   └── end.vue
│       ├── components/
│       │   ├── SlideMaster.vue
│       │   └── DataTable.vue
│       ├── styles/
│       │   └── tokens.css
│       └── assets/
│           └── logo.png
│
└── types/
    └── theme.ts                       # ★ ThemeConfig 型定義（参照用ドキュメント）
```

### apps/preview/layouts/ を空にする理由

Slidev のレイアウト解決は「後勝ち」であり、`userRoot`（`apps/preview/`）が最優先。`apps/preview/layouts/` にファイルが残っていると addon のレイアウトを上書きしてしまう。テーマ addon のレイアウトを有効にするには、`apps/preview/layouts/` を空にするか削除する必要がある。

## テーマ設定インターフェース

### ThemeConfig 型定義

```typescript
// apps/preview/types/theme.ts

/**
 * テーマのデザイントークン型定義
 *
 * この型はドキュメント/参照用。実際のテーマ設定は以下で管理する:
 * - CSS カスタムプロパティ → styles/tokens.css
 * - copyright / logo → SlideMaster.vue 内の masterConfig
 * - 画像アセット → assets/ ディレクトリ
 *
 * 新テーマ作成時は、この型の全プロパティに対応する値を定義すること。
 */
export interface ThemeConfig {
  /** テーマ識別名（ディレクトリ名と一致） */
  name: string

  /** フッターの copyright 文言 */
  copyright: string

  /** ロゴ設定 */
  logo: {
    /** ロゴ画像パス（assets/ からの相対パス） */
    image: string
    /** テキストフォールバック（画像未指定/読込失敗時） */
    text: string
    /** タグライン（任意） */
    tagline?: string
  }

  /** カラーパレット（CSS カスタムプロパティ名と対応） */
  colors: {
    /** メインブランドカラー — --color-primary */
    primary: string
    /** セカンダリカラー — --color-secondary */
    secondary: string
    /** アクセントカラー — --color-accent */
    accent: string
    /** テキスト/ダーク基調 — --color-black */
    black: string
    /** 背景グレー — --color-gray */
    gray: string
    /** 背景ホワイト — --color-white */
    white: string
  }

  /** フォント設定 */
  fonts: {
    /** 和文フォント — --font-ja */
    ja: string
    /** 和文太字フォント — --font-ja-bold */
    jaBold: string
    /** 欧文フォント — --font-en */
    en: string
  }

  /** フォントサイズ */
  fontSizes: {
    /** 見出し1 — --text-h1 */
    h1: string
    /** 見出し2 — --text-h2 */
    h2: string
    /** 本文 — --text-body */
    body: string
    /** 小文字 — --text-small */
    small: string
  }

  /** テーマが提供するレイアウト名の一覧 */
  layouts: string[]
}
```

### CSS カスタムプロパティの命名規則

テーマ間で共通の CSS 変数名を使用し、値のみテーマごとに変える:

| カテゴリ | CSS 変数名 | ReLic での値 | 用途 |
|---------|-----------|-------------|------|
| カラー | `--color-primary` | `#143C5D` (Navy) | ヘッダー背景、ストライプ |
| カラー | `--color-secondary` | `#D7A47A` (Brown) | ストライプ、行ヘッダー |
| カラー | `--color-accent` | `#E40077` (Pink) | アクセントバー、装飾 |
| カラー | `--color-black` | `#212121` | テキスト |
| カラー | `--color-gray` | `#F5F5F5` | テーブル交互背景 |
| カラー | `--color-white` | `#FFFFFF` | 背景 |
| フォント | `--font-ja` | `"Yu Gothic Medium", ...` | 本文 |
| フォント | `--font-ja-bold` | `"Yu Gothic Bold", ...` | 見出し |
| フォント | `--font-en` | `Arial, sans-serif` | 欧文 |
| サイズ | `--text-h1` | `18pt` | H1 |
| サイズ | `--text-h2` | `14pt` | H2 |
| サイズ | `--text-body` | `12pt` | 本文 |
| サイズ | `--text-small` | `10pt` | 注釈 |
| Slidev | `--slidev-theme-primary` | `#143C5D` | Slidev 内部 |
| Slidev | `--slidev-theme-secondary` | `#D7A47A` | Slidev 内部 |
| Slidev | `--slidev-theme-background` | `#FFFFFF` | Slidev 内部 |

**注意**: 既存の `--color-navy`, `--color-brown`, `--color-pink` は ReLic 固有の命名。汎用的な `--color-primary`, `--color-secondary`, `--color-accent` に変更し、テーマ間で同じ変数名を共有する。ReLic テーマ内では後方互換のため旧名もエイリアスとして定義可能。

## テーマ: ReLic（初期実装）

### デザイントークン

#### カラーパレット

| トークン名 | CSS 変数 | 値 | 用途 |
|-----------|---------|------|------|
| Primary (Wise Navy) | `--color-primary` | `#143C5D` | ストライプ、三角形、テーブルヘッダー |
| Secondary (Passion Brown) | `--color-secondary` | `#D7A47A` | ストライプ、三角形、テーブル行ヘッダー |
| Accent (Innovation Pink) | `--color-accent` | `#E40077` | アクセントバー、三角形 |
| Black | `--color-black` | `#212121` | テキスト、フッターライン |
| Gray | `--color-gray` | `#F5F5F5` | テーブル交互背景 |
| White | `--color-white` | `#FFFFFF` | 背景 |

#### フォント

| トークン名 | CSS 変数 | 値 |
|-----------|---------|------|
| 和文 | `--font-ja` | `"Yu Gothic Medium", "Yu Gothic", "游ゴシック Medium", "游ゴシック", sans-serif` |
| 和文太字 | `--font-ja-bold` | `"Yu Gothic Bold", "Yu Gothic", "游ゴシック Bold", "游ゴシック", sans-serif` |
| 欧文 | `--font-en` | `Arial, sans-serif` |

#### フォントサイズ

| トークン名 | CSS 変数 | 値 |
|-----------|---------|------|
| H1 | `--text-h1` | `18pt` |
| H2 | `--text-h2` | `14pt` |
| Body | `--text-body` | `12pt` |
| Small | `--text-small` | `10pt` |

#### tokens.css

```css
/* themes/relic/styles/tokens.css */
:root {
  /* カラー（汎用名） */
  --color-primary: #143C5D;
  --color-secondary: #D7A47A;
  --color-accent: #E40077;
  --color-black: #212121;
  --color-gray: #F5F5F5;
  --color-white: #FFFFFF;

  /* ReLic 固有エイリアス（既存コードとの後方互換） */
  --color-navy: var(--color-primary);
  --color-brown: var(--color-secondary);
  --color-pink: var(--color-accent);

  /* Typography */
  --font-ja: "Yu Gothic Medium", "Yu Gothic", "游ゴシック Medium", "游ゴシック", sans-serif;
  --font-ja-bold: "Yu Gothic Bold", "Yu Gothic", "游ゴシック Bold", "游ゴシック", sans-serif;
  --font-en: Arial, sans-serif;

  /* Font Sizes */
  --text-h1: 18pt;
  --text-h2: 14pt;
  --text-body: 12pt;
  --text-small: 10pt;

  /* Slidev overrides */
  --slidev-theme-primary: #143C5D;
  --slidev-theme-secondary: #D7A47A;
  --slidev-theme-background: #FFFFFF;
}
```

### レイアウト構成

ReLic テーマは 5 種のレイアウトを提供する。テーマがレイアウトを完全所有するため、他テーマとレイアウトの種類・数が異なってよい。

| # | ファイル名 | 用途 | 主な装飾/特徴 |
|---|-----------|------|-------------|
| 1 | `cover-1.vue` | 表紙（小ストライプ） | 右側に Navy + Brown の斜めストライプ（細め）、ピンクアクセントバー、ロゴ画像表示 |
| 2 | `cover-2.vue` | 表紙（大ストライプ） | 右側に Navy + Brown の斜めストライプ（太め）、ピンクアクセントバー、ロゴ画像表示 |
| 3 | `content.vue` | 本文スライド | **border.png を背景画像として全面表示**、フッター（copyright + ページ番号） |
| 4 | `section-divider.vue` | セクション区切り | 左下から Navy + Pink + Brown の三角形、フッター（light テーマ） |
| 5 | `end.vue` | 最終スライド | 右側に Navy + Brown + Pink の斜めストライプ、ミッションテキスト、ロゴ画像表示 |

### コンポーネント構成

#### SlideMaster.vue（テーマ所有）

`themes/relic/components/SlideMaster.vue` に移動。既存の Props インターフェースを維持しつつ、以下を変更:

**変更点**:
1. `masterConfig` の `copyright`、`logoText`、`logoTagline` をテーマ固有値として直接記述（現行と同じ値）
2. `logoImage` を追加し、`assets/logo.png` を相対パス import で参照
3. ロゴ表示部分を画像優先に変更（画像読み込み失敗時はテキストフォールバック）

```typescript
// themes/relic/components/SlideMaster.vue の <script setup> 内
import logoImage from '../assets/logo.png'

const masterConfig = {
  copyright: 'Copyright (C) 2025 Relic Inc. All Rights Reserved.',
  logoText: 'ReLic',
  logoTagline: 'CO-INNOVATION COMPANY.',
  logoImage,  // Vite アセットパイプラインで解決されたパス
}
```

**ロゴ表示のテンプレート変更**:

```vue
<slot name="logo">
  <div class="slide-master__logo-default">
    <img
      v-if="masterConfig.logoImage"
      :src="masterConfig.logoImage"
      alt="ReLic"
      class="slide-master__logo-image"
      @error="($event.target as HTMLImageElement).style.display = 'none'"
    />
    <!-- テキストフォールバック（画像がない場合 or 読込失敗時） -->
    <template v-else>
      <div class="slide-master__logo-brackets">
        <span class="slide-master__logo-name">{{ masterConfig.logoText }}</span>
      </div>
      <span class="slide-master__logo-tagline">{{ masterConfig.logoTagline }}</span>
    </template>
  </div>
</slot>
```

Props インターフェースは現行を維持:

| Prop | 型 | デフォルト | 用途 |
|------|------|---------|------|
| `showFooter` | `boolean` | `false` | copyright + ページ番号フッター |
| `showCornerBrackets` | `boolean` | `false` | 四隅のブラケット装飾 |
| `showLogo` | `boolean` | `false` | ロゴ表示 |
| `footerTheme` | `'dark' \| 'light'` | `'dark'` | フッター文字色テーマ |
| `logoPosition` | `'bottom-right' \| 'content'` | `'bottom-right'` | ロゴ配置 |

Slots:

| Slot | 用途 |
|------|------|
| `default` | メインコンテンツ |
| `decoration` | 背景装飾（ストライプ、三角形など） |
| `logo` | ロゴのオーバーライド |

#### DataTable.vue（テーマ所有）

`themes/relic/components/DataTable.vue` に移動。CSS 変数参照を汎用名に更新:

```css
/* 変更前 */
.data-table__header { background: var(--color-navy, #143C5D); }
.data-table__cell--row-header { background: var(--color-brown, #D7A47A) !important; }

/* 変更後 */
.data-table__header { background: var(--color-primary, #143C5D); }
.data-table__cell--row-header { background: var(--color-secondary, #D7A47A) !important; }
```

Props インターフェースは現行を維持（`headers`, `rows`, `rowHeaders`）。

#### 装飾コンポーネント

既存レイアウトのインライン装飾を独立コンポーネントに抽出:

| コンポーネント | 抽出元 | 装飾内容 |
|--------------|--------|---------|
| `CoverStripes.vue` | cover-1.vue, cover-2.vue | 斜めストライプ（Navy + Brown） |
| `SectionTriangles.vue` | section-divider.vue | 左下三角形（Navy + Pink + Brown） |
| `EndStripes.vue` | end.vue | 斜めストライプ（Navy + Brown + Pink） |

各装飾コンポーネントは SlideMaster の `decoration` スロットに挿入される。Props でバリエーション（size: 'small' | 'large' 等）を制御。

例: `CoverStripes.vue`

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'small' | 'large'
}>(), {
  variant: 'small',
})
</script>

<template>
  <div :class="['cover-stripes', `cover-stripes--${variant}`]">
    <div class="cover-stripes__brown" />
    <div class="cover-stripes__navy" />
  </div>
</template>
```

### content レイアウトの border.png 背景設計

`content.vue` は `border.png` をスライド全体の背景画像として使用する。border.png はコーナーブラケットやフッターラインを含む枠線画像であり、CSS で再現する代わりに画像として適用する。

```vue
<!-- themes/relic/layouts/content.vue -->
<script setup lang="ts">
import SlideMaster from '../components/SlideMaster.vue'
import borderImage from '../assets/border.png'
</script>

<template>
  <SlideMaster :showFooter="true" footerTheme="dark">
    <template #decoration>
      <img
        :src="borderImage"
        class="content-border"
        alt=""
        aria-hidden="true"
      />
    </template>

    <div class="content-body">
      <slot />
    </div>
  </SlideMaster>
</template>

<style scoped>
.content-border {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.content-body {
  padding: 48px 64px 56px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
```

**設計判断**: `showCornerBrackets` prop による CSS ブラケット描画から、`border.png` 画像による背景表示に切り替える。これにより:
- ピクセルパーフェクトな枠線再現が可能
- フッターラインも border.png に含まれている場合、SlideMaster の `showFooter` との併用で二重表示を避ける設計が必要
- border.png にフッターラインが含まれない場合は `showFooter: true` を維持

### end レイアウトのロゴ画像対応

`end.vue` は SlideMaster 経由ではなくインラインでロゴを表示している。テーマ移行後も同様に、ロゴ画像を直接 import して表示する:

```vue
<!-- themes/relic/layouts/end.vue の一部 -->
<script setup lang="ts">
import logoImage from '../assets/logo.png'
</script>

<template>
  <!-- ... -->
  <div class="end-body__logo">
    <slot name="logo">
      <img
        v-if="logoImage"
        :src="logoImage"
        alt="ReLic"
        class="end-body__logo-image"
      />
    </slot>
  </div>
  <!-- ... -->
</template>
```

## テーマ切替の仕組み

### 手順（1箇所の変更で完了）

```yaml
# slides.md — 変更前
---
theme: default
addons: ['./themes/relic']
---

# slides.md — 変更後
---
theme: default
addons: ['./themes/minimal']
---
```

### 切替時に起こること

1. **Slidev が addon の roots を再解決**
   - `resolved.roots` から `themes/relic/` が外れ、`themes/minimal/` が追加される

2. **レイアウト解決の変更**
   - `themes/relic/layouts/*` の代わりに `themes/minimal/layouts/*` が使用される
   - 新テーマにないレイアウト名を slides.md で使用している場合、Slidev がエラーを表示

3. **コンポーネント解決の変更**
   - `themes/relic/components/` の代わりに `themes/minimal/components/` が自動インポート対象になる
   - SlideMaster, DataTable などが新テーマのものに切り替わる

4. **CSS 変数の切替**
   - `themes/relic/setup/main.ts` の代わりに `themes/minimal/setup/main.ts` が実行される
   - 新テーマの `tokens.css` が読み込まれ、`:root` の CSS カスタムプロパティが上書きされる

5. **アセットの切替**
   - 各レイアウトが相対パス import で参照する `logo.png`, `border.png` が新テーマのものに切り替わる

### setup/main.ts の実装

```typescript
// themes/relic/setup/main.ts
import '../styles/tokens.css'

// 将来的に defineAppSetup() でグローバル設定を追加可能
// import { defineAppSetup } from '@slidev/types'
// export default defineAppSetup(({ app }) => { ... })
```

## 検証用ダミーテーマ（minimal）

SC-003（第2テーマの追加と正常動作確認）を達成するための最小テーマ。

### 目的

- テーマ切替が正しく動作することの検証
- テーマごとにレイアウトの種類・数が異なることの検証（3種 vs ReLic の5種）
- デザイントークンの差し替えが全コンポーネントに波及することの検証

### ディレクトリ構成

```
themes/minimal/
├── package.json
├── setup/
│   └── main.ts              # import '../styles/tokens.css'
├── layouts/
│   ├── cover-1.vue           # シンプルな表紙（装飾なし）
│   ├── content.vue           # シンプルな本文（border.png なし、CSS ボーダーのみ）
│   └── end.vue               # シンプルな終了スライド
├── components/
│   ├── SlideMaster.vue       # minimal 用 copyright/logo
│   └── DataTable.vue         # CSS 変数参照（共通）
├── styles/
│   └── tokens.css            # 別カラーのデザイントークン
└── assets/
    └── logo.png              # プレースホルダーロゴ画像
```

### デザイントークン（minimal）

```css
/* themes/minimal/styles/tokens.css */
:root {
  --color-primary: #2563EB;    /* Blue */
  --color-secondary: #7C3AED;  /* Purple */
  --color-accent: #F59E0B;     /* Amber */
  --color-black: #1F2937;
  --color-gray: #F3F4F6;
  --color-white: #FFFFFF;

  --font-ja: "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif;
  --font-ja-bold: "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif;
  --font-en: "Inter", sans-serif;

  --text-h1: 18pt;
  --text-h2: 14pt;
  --text-body: 12pt;
  --text-small: 10pt;

  --slidev-theme-primary: #2563EB;
  --slidev-theme-secondary: #7C3AED;
  --slidev-theme-background: #FFFFFF;
}
```

### SlideMaster（minimal）

```typescript
const masterConfig = {
  copyright: 'Copyright (C) 2025 Example Corp. All Rights Reserved.',
  logoText: 'Example',
  logoTagline: 'Innovation for Everyone.',
  logoImage,  // assets/logo.png
}
```

### レイアウトの差異

| レイアウト | ReLic (5種) | minimal (3種) | 差異のポイント |
|-----------|-------------|---------------|-------------|
| `cover-1` | 斜めストライプ + ロゴ画像 | テキストのみ、装飾なし | レイアウト構造が完全に異なる |
| `cover-2` | 太めストライプ + ロゴ画像 | (なし) | minimal にはこのレイアウトがない |
| `content` | border.png 背景 + フッター | CSS ボーダー + フッター | 装飾方法が異なる |
| `section-divider` | 三角形 + フッター | (なし) | minimal にはこのレイアウトがない |
| `end` | ストライプ + ミッション + ロゴ画像 | ロゴ画像のみ | 装飾なし |

## apps/preview/styles/index.css の変更

`:root` のデザイントークン定義をテーマの `tokens.css` に移動した後、共通スタイルのみ残す:

```css
/* apps/preview/styles/index.css */

/* ※ :root のデザイントークンは削除（テーマの tokens.css に移動済み） */

/* --- Global Typography --- */
.slidev-layout {
  font-family: var(--font-ja), var(--font-en);
  color: var(--color-black);
}

.slidev-layout h1 {
  font-family: var(--font-ja-bold), var(--font-en);
  font-weight: 700;
  font-size: var(--text-h1);
  color: var(--color-black);
}

.slidev-layout h2 {
  font-family: var(--font-ja-bold), var(--font-en);
  font-weight: 700;
  font-size: var(--text-h2);
  color: var(--color-black);
}

.slidev-layout p,
.slidev-layout li {
  font-size: var(--text-body);
  line-height: 1.8;
}

.slidev-layout .text-small {
  font-size: var(--text-small);
}

/* --- Accent Heading (pink label) --- */
.accent-heading {
  color: var(--color-accent);
  font-weight: 700;
  font-size: var(--text-h2);
}

/* --- Utility Classes --- */
.bg-primary { background-color: var(--color-primary); }
.bg-secondary { background-color: var(--color-secondary); }
.bg-accent { background-color: var(--color-accent); }
.bg-gray { background-color: var(--color-gray); }
.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--color-secondary); }
.text-accent { color: var(--color-accent); }
```

**注意**: この共通 `index.css` は `apps/preview/` の `userRoot` スタイルとして Slidev が自動読み込みする。テーマの `tokens.css` は addon の `setup/main.ts` 経由で読み込まれるため、両方が適用される。

## package.json（addon 用）

```json
// themes/relic/package.json
{
  "name": "slidev-addon-relic",
  "version": "0.1.0",
  "private": true,
  "keywords": ["slidev-addon", "slidev"],
  "engines": {
    "slidev": ">=0.51.0"
  },
  "slidev": {
    "defaults": {}
  }
}
```

## 技術的考慮事項

### 1. userRoot レイアウトの優先度問題

Slidev のレイアウト解決は「後勝ち」で、`userRoot`（`apps/preview/`）が最優先。`apps/preview/layouts/` に既存レイアウトが残っていると、addon のレイアウトが無視される。

**対策**: 移行時に `apps/preview/layouts/` の全 Vue ファイルを削除する。同様に `apps/preview/components/` の SlideMaster.vue と DataTable.vue も削除し、テーマ addon のコンポーネントを使用する。

### 2. CSS 変数名の移行

既存コードは `--color-navy`, `--color-brown`, `--color-pink` を使用。汎用名 `--color-primary`, `--color-secondary`, `--color-accent` への移行が必要。

**対策**: ReLic テーマの `tokens.css` にエイリアスを定義し、段階的に移行する:
```css
--color-navy: var(--color-primary);
--color-brown: var(--color-secondary);
--color-pink: var(--color-accent);
```

### 3. 画像アセットの Vite 解決

`import logoImage from '../assets/logo.png'` は Vite のアセットパイプラインで処理され、ビルド時にハッシュ付きファイル名に変換される。addon 内の相対パス import が正しく解決されることを確認する必要がある。

**対策**: addon の `assets/` ディレクトリからの相対パス import で統一。`public/` ディレクトリへのコピーは行わない（テーマ切替時に残骸が生じるため）。

### 4. HMR（Hot Module Replacement）の動作

`addons` フロントマターの変更は Vite の HMR 対象ではなく、開発サーバーの再起動が必要になる可能性がある。

**対策**: テーマ切替時は `pnpm dev` の再起動を推奨手順に含める。日常的なテーマ内編集（CSS 変数値の変更、レイアウト修正）は HMR で即時反映される。

### 5. slides.md で存在しないレイアウトを指定した場合

テーマを切り替えた際、旧テーマにあって新テーマにないレイアウト名（例: minimal テーマで `layout: cover-2`）を指定すると、Slidev が警告またはエラーを表示する。

**対策**: テーマ切替時は slides.md のレイアウト指定もテーマに合わせて更新する。ThemeConfig の `layouts` プロパティでテーマが提供するレイアウト一覧を参照可能にする。

### 6. Slidev テーマパッケージへの将来的昇格

現在の addon 構造は Slidev テーマパッケージの `layouts/`, `components/`, `styles/` 規約と互換性がある。将来 npm パッケージ化する際は:
1. `package.json` の `keywords` を `["slidev-theme", "slidev"]` に変更
2. パッケージ名を `slidev-theme-relic` に変更
3. `addons` 指定から `theme: relic` 指定に変更

### 7. DataTable の CSS 変数フォールバック

DataTable は CSS 変数のフォールバック値（`var(--color-primary, #143C5D)`）を持つため、テーマが CSS 変数を定義し忘れた場合でもデフォルト値で描画される。これは FR-002 のトークン欠落時の安全策として機能する。

### 8. border.png と showCornerBrackets の関係

ReLic テーマの content レイアウトでは `border.png` を背景画像として使用するため、SlideMaster の `showCornerBrackets: true` は不要になる。border.png にコーナーブラケットとフッターラインの両方が含まれている場合、`showFooter` の copyright テキストとページ番号のみ SlideMaster から表示し、フッターラインの CSS 描画（`.slide-master__footer-line`）は無効化する必要がある。

**対策**: content レイアウトでは `showCornerBrackets: false`（デフォルト）とし、border.png で枠線を表現する。SlideMaster に `showFooterLine` prop を追加するか、border.png の内容に応じて `showFooter` の表示要素を調整する。
