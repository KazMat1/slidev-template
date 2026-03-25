# スライドパターンカタログ

再利用可能なスライドパターン集。各パターンのレイアウト＋コンポーネント組合せを定義。

## 1. タイトルスライド

**用途**: プレゼンテーションの表紙
**レイアウト**: `cover`

```markdown
---
layout: cover
---

# プレゼンテーションタイトル

サブタイトル・説明文

<div class="abs-br m-6 text-sm opacity-50">
  著者名 / 日付
</div>
```

## 2. セクション区切り

**用途**: 大きなトピック転換
**レイアウト**: `section`

```markdown
---
layout: section
---

# セクションタイトル
```

## 3. アジェンダ

**用途**: 発表内容の概要提示
**レイアウト**: `default`

```markdown
---
---

# アジェンダ

<v-clicks>

1. 背景と課題
2. 提案するソリューション
3. デモ
4. まとめと次のステップ

</v-clicks>
```

## 4. Before / After 比較

**用途**: 改善効果の視覚化
**レイアウト**: `two-cols`

```markdown
---
layout: two-cols
---

# Before / After

::left::

### Before

- 手動プロセス
- エラー頻発
- 2時間/回

::right::

### After

- 自動化済み
- エラー率 0.1%
- 5分/回
```

## 5. KPI / ファクトカード

**用途**: 重要な数値・統計の強調
**レイアウト**: `fact`

```markdown
---
layout: fact
---

# 95%
削減されたデプロイ時間
```

### KPI 複数表示（default + grid）

```markdown
---
---

# 主要 KPI

<div class="grid grid-cols-3 gap-8 mt-12">
  <div class="text-center">
    <div class="text-5xl font-bold text-blue-500">95%</div>
    <div class="text-gray-500 mt-2">時間削減</div>
  </div>
  <div class="text-center">
    <div class="text-5xl font-bold text-green-500">3x</div>
    <div class="text-gray-500 mt-2">生産性向上</div>
  </div>
  <div class="text-center">
    <div class="text-5xl font-bold text-orange-500">0</div>
    <div class="text-gray-500 mt-2">ダウンタイム</div>
  </div>
</div>
```

## 6. プロセスフロー

**用途**: 手順・ワークフローの説明
**レイアウト**: `default`

```markdown
---
---

# 開発フロー

<div class="flex items-center justify-center gap-4 mt-12">
  <div class="bg-blue-100 p-4 rounded-lg text-center">
    <div class="text-2xl">1</div>
    <div class="text-sm mt-1">仕様作成</div>
  </div>
  <div class="text-2xl">→</div>
  <div class="bg-green-100 p-4 rounded-lg text-center">
    <div class="text-2xl">2</div>
    <div class="text-sm mt-1">設計</div>
  </div>
  <div class="text-2xl">→</div>
  <div class="bg-orange-100 p-4 rounded-lg text-center">
    <div class="text-2xl">3</div>
    <div class="text-sm mt-1">実装</div>
  </div>
  <div class="text-2xl">→</div>
  <div class="bg-purple-100 p-4 rounded-lg text-center">
    <div class="text-2xl">4</div>
    <div class="text-sm mt-1">レビュー</div>
  </div>
</div>
```

## 7. コードデモ

**用途**: 技術的な内容の説明
**レイアウト**: `default`

````markdown
---
---

# API の使い方

```ts {1-3|5-8|all}
import { createClient } from './client'

const client = createClient({ apiKey: 'xxx' })

const result = await client.query({
  model: 'gpt-4',
  prompt: 'Hello, world!'
})
```
````

### コード + 説明（two-cols）

````markdown
---
layout: two-cols
---

# 実装例

::left::

```ts
function fibonacci(n: number): number {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}
```

::right::

### ポイント

- 再帰的なアプローチ
- `n <= 1` が基底条件
- 計算量: O(2^n)
````

## 8. 引用・お客様の声

**用途**: 第三者の評価、権威付け
**レイアウト**: `quote`

```markdown
---
layout: quote
---

# "このツールのおかげで開発速度が3倍になりました"

— CTO, Example Corp.
```

## 9. 画像 + 説明

**用途**: アーキテクチャ図、スクリーンショットの説明
**レイアウト**: `image-right`

```markdown
---
layout: image-right
image: /images/architecture.png
---

# システムアーキテクチャ

- マイクロサービス構成
- Kubernetes でオーケストレーション
- gRPC で内部通信
```

## 10. まとめスライド

**用途**: 要点の振り返り
**レイアウト**: `default`

```markdown
---
---

# まとめ

<v-clicks>

- **課題**: 手動プロセスによる非効率
- **解決策**: 自動化パイプラインの導入
- **効果**: 95%の時間削減、エラー率0.1%

</v-clicks>

<div class="mt-8 text-center text-xl font-bold" v-click>
  次のステップ: パイロット導入（来月）
</div>
```

## 11. 最終スライド

**用途**: プレゼンの締めくくり
**レイアウト**: `end`

```markdown
---
layout: end
---

# ありがとうございました

質問・フィードバックをお待ちしています
```

## パターン選択ガイド

| シーン | 推奨パターン |
|-------|------------|
| プレゼン開始 | タイトル → アジェンダ |
| 課題提起 | Before/After, KPI |
| 技術説明 | コードデモ, プロセスフロー |
| 効果訴求 | KPI, 引用 |
| 章の切替 | セクション区切り |
| 視覚的説明 | 画像+説明 |
| プレゼン終了 | まとめ → 最終スライド |
