---
theme: default
title: ReLic Design System Demo
mdc: true
addons:
  - ./preview/themes/relic
---

---
layout: cover-1
title: 表紙スライドパターン1
subtitle1: テキストを入力
subtitle2: テキストを入力
---

---
layout: cover-2
title: 表紙スライドパターン2
subtitle1: テキストを入力
subtitle2: テキストを入力
---

---
layout: content
---

# スライドページ

これは本文スライドのレイアウトです。

- コーナーブラケットで枠を表現
- フッターにCopyrightとページ番号
- 1スライド = 1メッセージの原則

<v-clicks>

- クリックアニメーション対応
- UnoCSS クラス利用可能

</v-clicks>

---
layout: content
---

# テーブルコンポーネント

<DataTable
  :headers="['項目A', '項目B', '項目C']"
  :rows="[
    ['データ1', 'データ2', 'データ3'],
    ['データ4', 'データ5', 'データ6'],
    ['データ7', 'データ8', 'データ9'],
    ['データ10', 'データ11', 'データ12']
  ]"
/>

---
layout: content
---

# テーブル（行ヘッダー付き）

<DataTable
  :headers="['カテゴリ', '項目A', '項目B']"
  :rows="[
    ['行見出し1', 'データ1', 'データ2'],
    ['行見出し2', 'データ3', 'データ4'],
    ['行見出し3', 'データ5', 'データ6']
  ]"
  :rowHeaders="true"
/>

---
layout: section-divider
---

# セクションスライド

---
layout: end
---

大志ある挑戦を創造し、日本から世界へ

想いを持った挑戦者と共に走り、共に創る
