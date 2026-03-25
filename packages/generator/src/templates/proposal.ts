import type { Template } from '@slidegen/shared'

export const proposalTemplate: Template = {
  id: 'proposal',
  name: '提案書',
  description: 'ビジネス提案書向けのレイアウト構成。表紙→アジェンダ→セクション→比較→KPI→引用→まとめ',
  layoutSequence: [
    { layout: 'cover', purpose: 'title' },
    { layout: 'default', purpose: 'agenda' },
    { layout: 'section', purpose: 'section-break' },
    { layout: 'default', purpose: 'problem-statement' },
    { layout: 'two-cols', purpose: 'comparison' },
    { layout: 'default', purpose: 'solution' },
    { layout: 'fact', purpose: 'kpi' },
    { layout: 'quote', purpose: 'testimonial', optional: true },
    { layout: 'default', purpose: 'timeline' },
    { layout: 'default', purpose: 'summary' },
    { layout: 'end', purpose: 'closing' },
  ],
  components: ['CompareCards', 'KpiHighlight', 'StepFlow'],
  promptTemplate: `あなたはビジネス提案書のプレゼンテーションを作成するエキスパートです。

構成ガイドライン:
- 表紙(cover) → アジェンダ → 課題提起 → 比較(Before/After) → ソリューション → KPI/数値 → お客様の声(quote) → タイムライン → まとめ → 最終スライド(end)
- 課題と解決策のコントラストを明確に
- KPI は fact レイアウトで大きく表示
- Before/After は two-cols レイアウトで対比
- 数値データには <KpiHighlight> コンポーネントの代わりに fact レイアウトを使用
- 比較には two-cols レイアウトの ::left:: と ::right:: スロットを使用
- プロセス説明には箇条書き + v-clicks で段階的表示
- 引用は quote レイアウトを使用
- ビジネストーンを維持しつつ、視覚的にインパクトのあるスライドを作成`,
}
