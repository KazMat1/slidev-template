# Slidev ナレッジベース

Slidev（スライデヴ）は Markdown ベースのプレゼンテーションフレームワーク。
Vue 3 + Vite で動作し、開発者向けの高機能スライド作成が可能。

## 基本構文

### フロントマター（1枚目スライド冒頭）

```yaml
---
theme: default
title: プレゼンテーションタイトル
info: 説明文
author: 著者名
keywords: keyword1,keyword2
transition: slide-left
mdc: true
---
```

### スライド区切り

```markdown
---        # 通常の区切り
---        # レイアウト指定付き
layout: center
---
```

### ページごとのフロントマター

```markdown
---
layout: two-cols
transition: fade
---
```

## レイアウト一覧

| レイアウト | 用途 | 備考 |
|-----------|------|------|
| `default` | 通常のコンテンツ | デフォルト |
| `center` | 中央寄せ | タイトル、引用に最適 |
| `cover` | 表紙 | プレゼン冒頭 |
| `end` | 最終スライド | 締めくくり |
| `intro` | イントロ | セクション導入 |
| `two-cols` | 2カラム | `::left::` `::right::` スロット使用 |
| `two-cols-header` | ヘッダー付き2カラム | `::left::` `::right::` + 上部テキスト |
| `image` | 画像全面 | `image: url` で指定 |
| `image-left` | 左画像+右テキスト | `image: url` で指定 |
| `image-right` | 右画像+左テキスト | `image: url` で指定 |
| `iframe` | iframe埋め込み | `url: https://...` で指定 |
| `iframe-left` | 左iframe+右テキスト | `url: https://...` で指定 |
| `iframe-right` | 右iframe+左テキスト | `url: https://...` で指定 |
| `fact` | 大きな数字・事実 | KPI、統計に最適 |
| `quote` | 引用 | 名言、顧客の声 |
| `section` | セクション区切り | 章タイトル |
| `statement` | 声明・主張 | 強調メッセージ |
| `full` | フルブリード | 余白なし |
| `none` | 空白 | 完全カスタム用 |

## 組込みコンポーネント

| コンポーネント | 用途 | 例 |
|--------------|------|-----|
| `<v-click>` | クリックアニメーション | 段階的表示 |
| `<v-clicks>` | 子要素を順次表示 | リスト項目の段階表示 |
| `<Arrow>` | 矢印描画 | `<Arrow x1="10" y1="10" x2="200" y2="200"/>` |
| `<AutoFitText>` | テキスト自動縮小 | 長文の自動調整 |
| `<LightOrDark>` | テーマ切替表示 | `<LightOrDark>` + `#dark` `#light` スロット |
| `<Link>` | スライド間リンク | `<Link to="5">5ページへ</Link>` |
| `<RenderWhen>` | 条件付き表示 | `<RenderWhen context="slide">` |
| `<SlidevVideo>` | 動画埋め込み | 自動再生対応 |
| `<Toc>` | 目次生成 | `<Toc />` |
| `<Transform>` | CSS変形 | `<Transform :scale="1.5">` |

## クリックアニメーション

```markdown
<!-- 基本 -->
<v-click>表示されるコンテンツ</v-click>

<!-- リスト一括 -->
<v-clicks>

- 項目1
- 項目2
- 項目3

</v-clicks>

<!-- v-mark ディレクティブ（ハイライト） -->
<span v-mark.red>重要テキスト</span>
<span v-mark.circle.orange>囲み</span>
```

## UnoCSS スタイリング

Slidev は UnoCSS を内蔵。Tailwind CSS 互換のユーティリティクラスが使用可能。

```markdown
<div class="text-3xl font-bold text-blue-500 mb-4">
  スタイル付きテキスト
</div>

<div class="grid grid-cols-2 gap-4">
  <div class="bg-gray-100 p-4 rounded">左</div>
  <div class="bg-gray-100 p-4 rounded">右</div>
</div>
```

### よく使うクラス

| カテゴリ | クラス例 | 説明 |
|---------|---------|------|
| テキストサイズ | `text-sm`, `text-xl`, `text-3xl` | フォントサイズ |
| テキスト色 | `text-blue-500`, `text-gray-700` | テキスト色 |
| 背景色 | `bg-blue-100`, `bg-gray-50` | 背景色 |
| 余白 | `p-4`, `m-2`, `mt-8`, `px-6` | パディング/マージン |
| フレックス | `flex`, `justify-center`, `items-center` | Flexbox |
| グリッド | `grid`, `grid-cols-2`, `gap-4` | Grid |
| 角丸 | `rounded`, `rounded-lg`, `rounded-full` | Border radius |
| 影 | `shadow`, `shadow-lg`, `shadow-xl` | Box shadow |
| 透明度 | `opacity-50`, `opacity-75` | 不透明度 |

## コードブロック

````markdown
```ts {2-3|5|all}
function greet(name: string) {
  const message = `Hello, ${name}!`  // ハイライト
  console.log(message)               // ハイライト

  return message  // 次のクリックでハイライト
}
```
````

- `{2-3|5|all}` — クリックごとにハイライト行を切替
- `{monaco}` — Monaco エディタ埋め込み（編集可能）
- `{monaco-run}` — 実行可能なコードブロック

## スライド設計原則

1. **1スライド=1メッセージ**: 1枚のスライドで伝えることは1つだけ
2. **3秒ルール**: スライドを見て3秒で要点が伝わること
3. **7項目以下**: 箇条書きは最大7項目（理想は3-5項目）
4. **レイアウトのバリエーション**: 3-4スライドごとにレイアウトを変化させる
5. **ビジュアル優先**: テキストより図、グラフ、コードで伝える
6. **余白を活かす**: 詰め込みすぎない、呼吸できる空間を確保

## テーマ変数（CSS カスタムプロパティ）

```css
/* styles/index.css で上書き可能 */
:root {
  --slidev-theme-primary: #5d8392;
  --slidev-theme-secondary: #6c757d;
  --slidev-theme-background: #ffffff;
}
```

## ディレクトリ構造

```
project/
├── slides.md           # メインスライド
├── pages/              # 分割スライド（slides.md から参照）
│   └── section1.md
├── components/         # カスタム Vue コンポーネント
│   └── Counter.vue
├── layouts/            # カスタムレイアウト
│   └── custom.vue
├── styles/             # グローバルスタイル
│   └── index.css
├── public/             # 静的アセット（画像等）
│   └── images/
└── package.json
```
