# リサーチ: マルチテーマ対応デザインシステム

## 調査結果

### 1. Slidev のレイアウトローディング

**ソースコード確認箇所**: `@slidev/cli@51.8.2` の `dist/shared-BC4uxnur.js` (行 747-765)

Slidev v51 のレイアウト解決メカニズムは `getLayouts()` 関数で実装されている。具体的な挙動は以下の通り:

```javascript
getLayouts: () => {
  const layouts = {};
  for (const root of [resolved.clientRoot, ...resolved.roots]) {
    const layoutPaths = fg.sync("layouts/**/*.{vue,ts}", {
      cwd: root,
      absolute: true,
      suppressErrors: true
    });
    for (const layoutPath of layoutPaths) {
      const layoutName = path.basename(layoutPath).replace(/\.\w+$/, "");
      layouts[layoutName] = layoutPath;
    }
  }
  return layouts;
}
```

**解決順序**: `clientRoot`(Slidev クライアント組込み) → `themeRoots`(テーマパッケージ) → `addonRoots`(アドオン) → `userRoot`(プロジェクトルート)。後から読み込まれたものが同名レイアウトを上書きする。

**`roots` の構成** (行 696-700):
```javascript
const roots = uniq([
  ...themeRoots,    // Slidev公式テーマのルート
  ...addonRoots,    // アドオンのルート
  rootsInfo.userRoot // プロジェクトルート（slides.md のあるディレクトリ）
]);
```

**重要な知見**: `userRoot` は `slides.md` が存在するディレクトリ（本プロジェクトでは `apps/preview/`）であり、`layouts/` はこのディレクトリ直下の `layouts/` フォルダから読み込まれる。プロジェクト直下の `layouts/` が最も優先度が高い（後から上書きするため）。

**結論**: テーマのレイアウトを Slidev に認識させるには、`apps/preview/layouts/` ディレクトリにテーマのレイアウトが存在する（または参照できる）必要がある。

### 2. テーマ設定ファイルの読み込み方式

**ソースコード確認箇所**: `shared-BC4uxnur.js` (行 2447-2467) — `resolveViteConfigs`

Slidev v51 は各 root ディレクトリの `vite.config.ts` を自動的にロードしマージする:
```javascript
const files = options.roots.map((i) => join(i, "vite.config.ts"));
for (const file of files) {
  if (!existsSync(file)) continue;
  const viteConfig = await loadConfigFromFile(configEnv, file);
  baseConfig = mergeConfig(baseConfig, viteConfig.config);
}
```

これにより、`apps/preview/vite.config.ts` に Vite の `define` オプションを記述することで、ビルド時にテーマ設定をグローバル定数として注入可能。

**検討した方式と推奨**:

| 方式 | 利点 | 欠点 | 採否 |
|------|------|------|------|
| **Vite `define`** | ビルド時定数としてツリーシェイク可能 | オブジェクトはJSON化が必要、HMR非対応 | 不採用 |
| **Vue `provide/inject`** | リアクティブ、型安全、Vue エコシステム標準 | App レベルの provide が必要 | 不採用（Slidev の App セットアップへのフック方法が限定的） |
| **TypeScript モジュール直接 import** | 最もシンプル、型安全、IDE補完、HMR対応 | テーマ切替時にimportパスの変更が必要 | **採用** |
| **Vite plugin でバーチャルモジュール** | 動的切替可能 | 実装が複雑、デバッグしにくい | 不採用 |

**推奨方式**: `theme.config.ts` を TypeScript モジュールとして作成し、テーマ名に応じたテーマ定義ファイルを動的に re-export する。具体的には:

```typescript
// apps/preview/theme.config.ts
export { default as themeConfig } from './themes/relic/theme'
```

テーマ切替時はこの1行の import パスを変更するだけで済む。Vite の HMR が TypeScript モジュールの変更を検知し、開発サーバーでの即時反映も可能。

### 3. テーマごとのレイアウト完全所有の実現方法

**課題**: Slidev は `apps/preview/layouts/` からレイアウトを読み込むが、テーマごとのレイアウトは `themes/relic/layouts/` に配置したい。

**検討した方式**:

| 方式 | 利点 | 欠点 | 採否 |
|------|------|------|------|
| **シンボリックリンク** | OS レベルで透過的 | Windows 互換性問題、Git 管理が煩雑 | 不採用 |
| **Vite alias** | Vite 設定だけで完結 | レイアウト解決が `fg.sync` (fast-glob) でファイルシステムを直接走査するため alias では介入不可 | 不採用 |
| **プロキシ Vue ファイル** | Slidev の解決メカニズムに完全準拠 | ファイル数は増えるがボイラープレートは最小 | **採用** |
| **Slidev addon として登録** | roots に追加される | package.json が必要、構造が複雑化 | 不採用 |
| **Slidev の theme フロントマターにローカルパスを指定** | Slidev 公式メカニズム | 公式テーマの `theme: default` と競合する。要件 FR-006 で「Slidev 公式の theme フロントマターとは別の独自キー」と明記 | 不採用 |

**採用方式の詳細 — プロキシ Vue ファイル方式**:

`apps/preview/layouts/` にプロキシファイルを配置し、テーマのレイアウトを re-export する:

```vue
<!-- apps/preview/layouts/cover-1.vue -->
<script setup lang="ts">
// テーマのレイアウトをそのまま re-export
</script>
<template>
  <component :is="Layout" v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </component>
</template>
<script lang="ts">
import Layout from '../themes/relic/layouts/cover-1.vue'
export default { inheritAttrs: false, components: { Layout } }
</script>
```

ただし、この方式はスロット転送のボイラープレートが多い。より簡潔な代替として、**ビルドスクリプトでプロキシファイルを自動生成**する方式も検討に値する。

**さらに簡潔な推奨方式 — 動的 import + レイアウトマッピング**:

`theme.config.ts` がテーマのレイアウトディレクトリパスを提供し、`apps/preview/layouts/` 内の各プロキシファイルは以下のように単純化する:

```vue
<!-- apps/preview/layouts/cover-1.vue -->
<script lang="ts">
export { default } from '../themes/relic/layouts/cover-1.vue'
</script>
```

この `export { default }` パターンは Vue SFC の仕様で認められており、コンポーネント全体（template + script + style）を転送する。ただし、テーマ切替時にプロキシファイル群の import パスをすべて書き換える必要がある。

**最終推奨 — ビルドスクリプト自動生成方式**:

`theme.config.ts` のテーマ名を読み取り、`apps/preview/layouts/` 配下のプロキシファイルを自動生成するスクリプトを用意する。テーマ切替は `theme.config.ts` の1箇所変更 + スクリプト実行で完了する。

あるいは、**Vite plugin** を使い仮想モジュールとしてレイアウトを解決する方法もあるが、Slidev のレイアウト解決が `fg.sync`（ファイルシステム走査）であるため、物理ファイルが `layouts/` に存在しなければ Slidev が認識しない。

**結論**: 以下の2段階方式を推奨する:
1. **各テーマが `themes/{name}/layouts/` にレイアウト Vue ファイルを完全所有**する
2. **`apps/preview/layouts/` にはテーマのレイアウトを re-export するプロキシファイルを配置**する。プロキシファイルは `theme.config.ts` のテーマ名変更に連動して import パスを切り替える（Vite plugin または手動/スクリプト）

### 4. CSS 変数の動的切り替え

**現状確認**: `apps/preview/styles/index.css` で `:root` に ReLic テーマのデザイントークンが CSS カスタムプロパティとして定義されている。レイアウトやコンポーネント（DataTable 等）は `var(--color-navy)` 等で参照。

**検討した方式**:

| 方式 | 利点 | 欠点 | 採否 |
|------|------|------|------|
| **テーマごとの CSS ファイルを `styles/index.css` から import** | Slidev 標準の CSS 読み込みに準拠 | テーマ切替時に import 先を変更する必要がある | **採用** |
| **JavaScript から `document.documentElement.style.setProperty` で注入** | ランタイム動的切替可能 | SSR 非対応、初期表示のちらつき | 不採用 |
| **`:root` を Vite define で動的生成** | ビルド時確定 | CSS ファイルには define が適用されない | 不採用 |
| **CSS `@import` を条件分岐** | 理想的 | CSS には条件分岐構文がない | 不可能 |

**推奨方式**:

各テーマが `themes/{name}/styles/tokens.css` を持ち、`:root` の CSS カスタムプロパティを定義する:

```css
/* themes/relic/styles/tokens.css */
:root {
  --color-navy: #143C5D;
  --color-brown: #D7A47A;
  --color-pink: #E40077;
  /* ... */
}
```

`apps/preview/styles/index.css` はテーマの CSS を import する:
```css
@import '../../themes/relic/styles/tokens.css';
/* 共通スタイル（.slidev-layout 等）はこのファイルに残す */
```

テーマ切替時は import パスを変更する。この変更を `theme.config.ts` と連動させるため、`styles/index.css` も `theme.config.ts` のテーマ名を参照するように設計する。

**具体的な連動方法**: Vite plugin で `styles/index.css` の `@import` パスをテーマに応じて書き換えるか、あるいは CSS import の代わりに **Vue の `<style>` 内で動的にテーマ CSS を読み込むグローバルコンポーネント** を使う方法がある。

最も実用的なのは以下のアプローチ:
1. テーマごとの `tokens.css` を作成
2. `apps/preview/styles/index.css` の `:root` ブロックをテーマの `tokens.css` に分離
3. テーマ切替時は `index.css` 内の `@import` パスを変更する（`theme.config.ts` の変更と合わせて2箇所になるが、スクリプトで自動化可能）

あるいは、`styles/index.css` からテーマ固有の `:root` 定義を除去し、テーマの `tokens.css` を `apps/preview/setup/main.ts`（Slidev のセットアップファイル）で import することで、`theme.config.ts` のテーマ名1箇所変更に集約できる:

```typescript
// apps/preview/setup/main.ts
import { themeConfig } from '../theme.config'
import(`../themes/${themeConfig.name}/styles/tokens.css`)
```

ただし、動的 import はビルド時に解決できない可能性がある。**確実な方式**として、`theme.config.ts` が CSS import 文も含む形で re-export する:

```typescript
// apps/preview/theme.config.ts
import './themes/relic/styles/tokens.css'
export { default as themeConfig } from './themes/relic/theme'
```

これなら `theme.config.ts` の変更のみで CSS トークンとテーマ設定の両方が切り替わる。

### 5. SlideMaster への設定注入

**現状確認**: `SlideMaster.vue` 内に `masterConfig` オブジェクトがハードコードされている（行 37-43）:
```typescript
const masterConfig = {
  copyright: 'Copyright © 2025 Relic Inc. All Rights Reserved.',
  logoText: 'ReLic',
  logoTagline: 'CO-INNOVATION COMPANY.',
}
```

**検討した方式**:

| 方式 | 利点 | 欠点 | 採否 |
|------|------|------|------|
| **直接 import** | 最もシンプル、型安全、IDE補完 | 密結合 | **採用** |
| **Vue provide/inject** | 疎結合、DI パターン | Slidev の app セットアップで provide が必要。setup/main.ts で可能だが間接的 | 不採用（シンプルさ優先） |
| **Props** | 明示的なインターフェース | 全レイアウトが SlideMaster に毎回 props を渡す必要がある。ボイラープレート増加 | 不採用 |
| **Vuex/Pinia** | グローバルステート | テーマ設定程度にはオーバーエンジニアリング | 不採用 |

**推奨方式**:

`SlideMaster.vue` が `theme.config.ts` から直接 import する:

```typescript
// SlideMaster.vue の <script setup>
import { themeConfig } from '../theme.config'

const masterConfig = {
  copyright: themeConfig.copyright,
  logoText: themeConfig.logo.text,
  logoTagline: themeConfig.logo.tagline,
  logoImage: themeConfig.logo.image,
}
```

**型安全性**: テーマ設定の TypeScript インターフェースを定義し、各テーマの定義ファイルがこの型に準拠することを強制する:

```typescript
// types/theme.ts
export interface ThemeConfig {
  name: string
  copyright: string
  logo: {
    text: string
    tagline?: string
    image?: string  // 画像パス（未指定時はテキストロゴにフォールバック）
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    black: string
    gray: string
    white: string
  }
  fonts: {
    ja: string
    jaBold: string
    en: string
  }
}
```

### 6. Slidev テーマパッケージ互換性

**ソースコード確認箇所**: `@slidev/theme-default@0.25.0` の package.json およびディレクトリ構造

**Slidev 公式テーマパッケージの規約**:

1. **ディレクトリ構造**:
   ```
   theme-package/
   ├── layouts/        # レイアウト Vue ファイル
   ├── components/     # コンポーネント
   ├── styles/         # CSS/スタイル（index.ts がエントリポイント）
   ├── layoutHelper.ts # レイアウトヘルパー（オプション）
   ├── package.json    # slidev フィールド必須
   └── README.md
   ```

2. **package.json の必須フィールド**:
   ```json
   {
     "keywords": ["slidev-theme", "slidev"],
     "engines": { "slidev": ">=v0.47.0" },
     "slidev": {
       "defaults": {
         "fonts": { ... }
       }
     }
   }
   ```
   - `keywords` に `"slidev-theme"` を含む
   - `engines.slidev` でバージョン要件を宣言
   - `slidev` フィールドでデフォルト設定を提供

3. **テーマ解決メカニズム** (`resolver-BShaA6qw.js` 行 66-96):
   - パッケージ名は `@slidev/theme-{name}` または `slidev-theme-{name}` の規約
   - `theme: relic` → `@slidev/theme-relic` → `slidev-theme-relic` の順で npm パッケージを探索
   - ローカルパス（`./` や `@/` プレフィックス）も指定可能だが、FR-006 の要件で Slidev 公式 `theme` フロントマターとは別の独自キーを使う方針

4. **テーマが roots に追加された場合の影響**:
   - `layouts/` が走査対象に追加（テーマのレイアウトが自動認識）
   - `components/` がコンポーネント自動インポートの対象に追加
   - `vite.config.ts` がマージされる
   - `styles/index.ts` がロードされる

**本プロジェクトのテーマディレクトリ構造の推奨**:

```
themes/relic/
├── layouts/              # レイアウト Vue ファイル（Slidev 規約準拠）
│   ├── cover-1.vue
│   ├── cover-2.vue
│   ├── content.vue
│   ├── section-divider.vue
│   └── end.vue
├── components/           # テーマ固有コンポーネント
│   └── decorations/
│       ├── CoverStripes.vue
│       └── SectionTriangles.vue
├── styles/
│   ├── tokens.css        # CSS カスタムプロパティ
│   └── index.ts          # スタイルエントリポイント（将来パッケージ化時）
├── theme.ts              # テーマ設定（TypeScript）
└── package.json          # 将来 npm 公開時に必要
```

この構造は Slidev 公式テーマ規約と完全互換であり、将来的に `package.json` を追加するだけで npm パッケージとして切り出せる。

## 技術的決定事項（改訂: addon 方式に変更）

追加調査により、Slidev addon がローカルパスを直接指定可能（`addons: ['./themes/relic']`）であることが判明。プロキシファイル方式 (旧 TD-2) およびスクリプト自動生成 (旧 TD-8) は不要となった。

| # | Decision | Rationale | Alternatives Considered |
|---|----------|-----------|------------------------|
| TD-1 | 各テーマを Slidev addon として構成し、`addons: ['./themes/relic']` で指定 | Slidev 公式のレイアウト解決チェーン（clientRoot → theme → addon → userRoot）に自然に乗る。プロキシファイル不要、自動生成スクリプト不要 | プロキシファイル方式（ファイル数増+スクリプト必要）、Vite alias（fg.sync に効かない）、シンボリックリンク（Windows 互換性問題） |
| TD-2 | テーマ切替は slides.md の `addons` フロントマターを変更するだけ | Slidev 標準の仕組み。独自設定キー `brandTheme` や `theme.config.ts` は不要 | `theme.config.ts`（Slidev と二重管理）、Vite define（ビルド時のみ） |
| TD-3 | CSS カスタムプロパティは各テーマの `styles/index.css` で定義し、addon の `setup/main.ts` 経由で読み込む | addon のエントリポイントとして標準的。テーマ切替で CSS 変数が自動的に切り替わる | レイアウトから直接 import（各レイアウトに記述必要）、JS での動的注入（SSR 非対応） |
| TD-4 | SlideMaster はテーマごとに所有（各テーマの `components/` に配置） | テーマ間でレイアウト構造が異なるため、共通化は早すぎる抽象化のリスク。copyright/logo はテーマごとに直接設定 | 共通パッケージに抽出（YAGNI）、provide/inject（テーマ構造固定後に検討） |
| TD-5 | テーマのデザイントークンは TypeScript インターフェース `ThemeConfig` で型定義 | NFR-005 の要件。ビルド時に型チェックが走り、トークン欠落を検出可能 | JSON Schema（TS 統合弱い）、Zod（ランタイムバリデーションはオーバー） |
| TD-6 | テーマディレクトリ構造は Slidev 公式テーマ/addon 規約に準拠 | 将来の npm パッケージ化を低コストで実現。FR-008 の要件 | 独自構造（将来の移行コスト大） |
| TD-7 | 画像アセット（logo.png, border.png）は相対パス import で参照 | Vite アセットパイプライン活用。addon 完結性が高い | public/ にコピー（テーマ切替時に残骸） |
| TD-8 | border.png を content レイアウトの背景画像として使用 | ユーザー提供の枠線画像を活用。CSS 再現より正確 | CSS border + corner 要素（微妙なずれ） |

## 未解決の技術的課題

全て解決済み。addon 方式の採用により、旧方式で必要だったプロキシファイル自動生成スクリプトも不要となった。
