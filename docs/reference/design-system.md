# デザインシステム

マルチテーマ対応の Slidev テンプレートデザインシステム。
各テーマは Slidev addon として構成され、`addons` フロントマターの1行変更でテーマ切替可能。

## テーマ切替方法

```yaml
# slides.md のフロントマター
---
addons:
  - ./preview/themes/relic      # ReLic テーマ
  # - ./preview/themes/minimal  # 検証用テーマ
---
```

変更後は `pnpm dev` の再起動が必要。

## テーマ構造

各テーマは以下のディレクトリ構造を持つ Slidev addon:

```
themes/{name}/
├── package.json          # slidev-addon-{name}
├── setup/main.ts         # CSS 読み込みエントリポイント
├── styles/tokens.css     # :root CSS カスタムプロパティ
├── layouts/              # テーマ固有レイアウト（種類・数は自由）
├── components/
│   ├── SlideMaster.vue   # フッター、ロゴ、装飾スロット
│   ├── DataTable.vue     # テーブルコンポーネント
│   └── decorations/      # 装飾コンポーネント
└── assets/               # ロゴ、枠線画像等
```

## CSS 変数（汎用名）

| カテゴリ | 変数名 | 用途 |
|---------|--------|------|
| カラー | `--color-primary` | メインカラー（テーブルヘッダー、装飾） |
| カラー | `--color-secondary` | セカンダリ（装飾、テーブル行ヘッダー） |
| カラー | `--color-accent` | アクセント（ピンクバー、装飾） |
| カラー | `--color-black` | テキスト |
| カラー | `--color-gray` | テーブル交互背景 |
| カラー | `--color-white` | 背景 |
| フォント | `--font-ja` | 和文 |
| フォント | `--font-ja-bold` | 和文太字 |
| フォント | `--font-en` | 欧文 |
| サイズ | `--text-h1` | H1 (18pt) |
| サイズ | `--text-h2` | H2 (14pt) |
| サイズ | `--text-body` | 本文 (12pt) |
| サイズ | `--text-small` | 注釈 (10pt) |

## テーマ: ReLic

### カラー

| 名前 | 汎用変数 | HEX | 注意 |
|------|---------|-----|------|
| Wise Navy | `--color-primary` | `#143C5D` | — |
| Passion Brown | `--color-secondary` | `#D7A47A` | White との組合せは避ける |
| Crazy Pink | `--color-accent` | `#E40077` | White との組合せは避ける |

### フォント

- 和文: 遊ゴシック Medium / Bold
- 欧文: Arial Regular / Bold
- 最小フォントサイズ: 10pt

### レイアウト（5種）

| レイアウト | 用途 | 装飾 |
|-----------|------|------|
| `cover-1` | 表紙（小ストライプ） | CoverStripes small + ロゴ画像 |
| `cover-2` | 表紙（大ストライプ） | CoverStripes large + ロゴ画像 |
| `content` | 本文 | border.png 背景 + フッター |
| `section-divider` | セクション区切り | SectionTriangles + フッター(light) |
| `end` | 最終ページ | EndStripes + ミッション + ロゴ画像 |

### コンポーネント

- **SlideMaster** — フッター（copyright + ページ番号）、ロゴ、decoration スロット
- **DataTable** — Navy ヘッダー、Gray 交互行、Brown 行ヘッダー
- **CoverStripes** — 斜めストライプ装飾（small/large）
- **SectionTriangles** — 三角形装飾（Brown/Pink/Navy）
- **EndStripes** — 斜めストライプ装飾（Brown/Pink/Navy）

## 新テーマ追加手順

1. `themes/relic/` をコピーして `themes/{new-name}/` を作成
2. `package.json` の `name` を `slidev-addon-{new-name}` に変更
3. `styles/tokens.css` のカラー・フォント値を変更
4. `components/SlideMaster.vue` の `masterConfig`（copyright, logo）を変更
5. `assets/` のロゴ画像を差し替え
6. レイアウトの種類・装飾を必要に応じてカスタマイズ
7. slides.md の `addons` を `./preview/themes/{new-name}` に変更
