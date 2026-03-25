import type { Template, GenerationSettings } from '@slidegen/shared'

export interface PromptResult {
  systemPrompt: string
  userPrompt: string
}

export function buildPrompt(params: {
  inputText: string
  template: Template
  settings: GenerationSettings
}): PromptResult {
  const { inputText, template, settings } = params

  const systemPrompt = buildSystemPrompt(settings)
  const userPrompt = buildUserPrompt(inputText, template, settings)

  return { systemPrompt, userPrompt }
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

function buildSystemPrompt(settings: GenerationSettings): string {
  const lang = settings.language === 'ja' ? 'Japanese' : 'English'

  return `You are an expert Slidev presentation generator. You produce high-quality, \
visually appealing Slidev Markdown that is ready to render without modification. \
All slide content MUST be written in ${lang}.

${SLIDEV_FORMAT_RULES}

${LAYOUT_REFERENCE}

${COMPONENT_REFERENCE}

${CLICK_ANIMATION_GUIDE}

${CODE_BLOCK_GUIDE}

${UNOCSS_GUIDE}

${DESIGN_PRINCIPLES}

${OUTPUT_RULES}`
}

// ---------------------------------------------------------------------------
// User prompt
// ---------------------------------------------------------------------------

function buildUserPrompt(
  inputText: string,
  template: Template,
  settings: GenerationSettings,
): string {
  const parts: string[] = []

  parts.push(`# Presentation Request\n\nCreate a Slidev presentation based on the following input:\n\n---\n${inputText}\n---`)

  // Template-specific layout guidance
  parts.push(buildLayoutGuidance(template))

  // Slide count
  if (settings.slideCount !== null && settings.slideCount > 0) {
    parts.push(
      `# Slide Count\n\nGenerate exactly ${settings.slideCount} slides (including the cover and end slides).`,
    )
  }

  // Theme
  if (settings.theme) {
    parts.push(
      `# Theme\n\nUse the theme "${settings.theme}" in the global frontmatter.`,
    )
  }

  // Additional instructions
  if (settings.additionalInstructions) {
    parts.push(
      `# Additional Instructions\n\n${settings.additionalInstructions}`,
    )
  }

  return parts.join('\n\n')
}

// ---------------------------------------------------------------------------
// Layout guidance from template
// ---------------------------------------------------------------------------

function buildLayoutGuidance(template: Template): string {
  const lines: string[] = [
    `# Template: ${template.name}`,
    '',
    template.description,
    '',
    '## Recommended Layout Sequence',
    '',
    'Follow this layout sequence as a guideline (adapt as appropriate to the content):',
    '',
  ]

  template.layoutSequence.forEach((hint, index) => {
    const opt = hint.optional ? ' (optional)' : ''
    lines.push(`${index + 1}. **${hint.layout}** - ${hint.purpose}${opt}`)
  })

  if (template.components.length > 0) {
    lines.push('')
    lines.push('## Suggested Components')
    lines.push('')
    lines.push(
      `Use these components where appropriate: ${template.components.map((c) => `\`${c}\``).join(', ')}`,
    )
  }

  if (template.promptTemplate) {
    lines.push('')
    lines.push('## Template-Specific Guidance')
    lines.push('')
    lines.push(template.promptTemplate)
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Embedded knowledge constants
// ---------------------------------------------------------------------------

const SLIDEV_FORMAT_RULES = `# Slidev Markdown Format

## Global Frontmatter (first slide)

The very first block of the output MUST be a YAML frontmatter that configures the presentation:

\`\`\`yaml
---
theme: default
title: Presentation Title
mdc: true
transition: slide-left
---
\`\`\`

Key fields:
- \`theme\` - Visual theme (e.g. "default", "seriph", "apple-basic")
- \`title\` - Presentation title shown in browser tab
- \`mdc\` - Enable MDC syntax (always set to true)
- \`transition\` - Default slide transition (e.g. "slide-left", "fade")

## Slide Separators

Each slide is separated by a line containing exactly \`---\`.

- A slide can have per-slide frontmatter immediately after the separator:

\`\`\`
---
layout: center
---

# Centered Content
\`\`\`

- If no layout is specified, \`default\` is used.
- The first slide (after global frontmatter) does NOT need an extra \`---\` separator.`

const LAYOUT_REFERENCE = `# Available Layouts

| Layout | Purpose | Notes |
|--------|---------|-------|
| \`cover\` | Title / cover slide | Use for the first slide of the presentation |
| \`default\` | General content | Standard layout with title + body |
| \`center\` | Center-aligned content | Great for impactful single statements or titles |
| \`intro\` | Introduction slide | Section introductions |
| \`section\` | Section divider | Use to separate major topics |
| \`two-cols\` | Two-column layout | Use \`::left::\` and \`::right::\` slot markers |
| \`two-cols-header\` | Two-column with header | Header text above, then \`::left::\` and \`::right::\` |
| \`image-right\` | Image on right, text on left | Set \`image: /path/to/image\` in frontmatter |
| \`image-left\` | Image on left, text on right | Set \`image: /path/to/image\` in frontmatter |
| \`image\` | Full-bleed image | Set \`image: /path/to/image\` in frontmatter |
| \`fact\` | Large number or fact | Ideal for KPIs, statistics, impactful numbers |
| \`quote\` | Blockquote / testimonial | Great for quotes, customer testimonials |
| \`statement\` | Bold statement | Use for strong assertions or key takeaways |
| \`end\` | Closing slide | Use for the final "Thank you" slide |
| \`full\` | Full bleed (no padding) | For fully custom content |
| \`none\` | Blank canvas | Completely custom layout |

## Two-Column Slot Syntax

When using \`two-cols\` or \`two-cols-header\`, split content with slot markers:

\`\`\`
---
layout: two-cols
---

# Title

::left::

Left column content

::right::

Right column content
\`\`\``

const COMPONENT_REFERENCE = `# Built-in Components

| Component | Purpose | Example |
|-----------|---------|---------|
| \`<v-click>\` | Show content on click | \`<v-click>Revealed text</v-click>\` |
| \`<v-clicks>\` | Reveal child items sequentially | Wrap a bullet list |
| \`<Arrow>\` | Draw an arrow | \`<Arrow x1="10" y1="10" x2="200" y2="200" />\` |
| \`<AutoFitText>\` | Auto-shrink text to fit | Wraps long text |
| \`<Link>\` | Link to another slide | \`<Link to="5">Go to slide 5</Link>\` |
| \`<Toc>\` | Table of contents | \`<Toc />\` |
| \`<Transform>\` | CSS transform wrapper | \`<Transform :scale="1.5">Big</Transform>\` |`

const CLICK_ANIMATION_GUIDE = `# Click Animations

Use click animations to reveal content progressively during a presentation.

## \`<v-click>\` - Single element

\`\`\`html
<v-click>

This paragraph appears on click.

</v-click>
\`\`\`

## \`<v-clicks>\` - Sequential children

Wrap a list so each item appears one by one:

\`\`\`html
<v-clicks>

- First point
- Second point
- Third point

</v-clicks>
\`\`\`

## \`v-click\` directive (inline)

\`\`\`html
<div v-click>Appears on click</div>
\`\`\`

## \`v-mark\` directive (highlight)

\`\`\`html
<span v-mark.red>Important text</span>
<span v-mark.circle.orange>Circled text</span>
\`\`\`

## Best Practices

- Use \`<v-clicks>\` on bullet lists to build up points gradually.
- Use \`<v-click>\` for summary or call-to-action elements that should appear last.
- Do NOT overuse animations; 2-4 click steps per slide is ideal.
- Avoid nested click animations as they can confuse the audience.`

const CODE_BLOCK_GUIDE = `# Code Blocks

Slidev supports syntax-highlighted code blocks with line highlighting.

## Basic code block

\`\`\`\`
\`\`\`ts
const greeting = 'Hello, Slidev!'
console.log(greeting)
\`\`\`
\`\`\`\`

## Line highlighting (click-through)

Use \`{lines}\` after the language identifier to highlight specific lines. \
Separate groups with \`|\` to create click-through steps:

\`\`\`\`
\`\`\`ts {1-2|4-6|all}
import { ref } from 'vue'

// Step 1: highlighted lines 1-2
const count = ref(0)
const increment = () => count.value++
// Step 2: highlighted lines 4-6
\`\`\`
\`\`\`\`

## Monaco editor

Add \`{monaco}\` for an editable code block or \`{monaco-run}\` for a runnable one:

\`\`\`\`
\`\`\`ts {monaco}
console.log('Editable!')
\`\`\`
\`\`\`\`

## Best Practices

- Keep code blocks short (< 15 lines per slide).
- Use line highlighting to walk through code step by step.
- Pair code with a brief explanation above or beside it.`

const UNOCSS_GUIDE = `# UnoCSS / Tailwind CSS Styling

Slidev includes UnoCSS with Tailwind CSS-compatible utility classes. \
Use them freely in HTML within slides.

## Common Utility Classes

| Category | Classes | Description |
|----------|---------|-------------|
| Text size | \`text-sm\`, \`text-lg\`, \`text-xl\`, \`text-2xl\`, \`text-3xl\`, \`text-4xl\`, \`text-5xl\` | Font size |
| Text color | \`text-blue-500\`, \`text-green-600\`, \`text-gray-700\`, \`text-red-500\` | Text color |
| Font weight | \`font-bold\`, \`font-semibold\`, \`font-light\` | Weight |
| Background | \`bg-blue-100\`, \`bg-gray-50\`, \`bg-green-100\`, \`bg-orange-100\` | Background color |
| Spacing | \`p-4\`, \`m-2\`, \`mt-8\`, \`mb-4\`, \`px-6\`, \`py-2\`, \`gap-4\` | Padding / margin / gap |
| Flexbox | \`flex\`, \`justify-center\`, \`items-center\`, \`flex-col\`, \`flex-wrap\` | Flex layout |
| Grid | \`grid\`, \`grid-cols-2\`, \`grid-cols-3\`, \`gap-4\`, \`gap-8\` | Grid layout |
| Border radius | \`rounded\`, \`rounded-lg\`, \`rounded-full\` | Corners |
| Shadow | \`shadow\`, \`shadow-lg\`, \`shadow-xl\` | Box shadow |
| Opacity | \`opacity-50\`, \`opacity-75\` | Transparency |
| Positioning | \`absolute\`, \`relative\`, \`abs-br\`, \`abs-bl\` | Position |
| Text align | \`text-center\`, \`text-left\`, \`text-right\` | Alignment |

## Patterns

### KPI Grid

\`\`\`html
<div class="grid grid-cols-3 gap-8 mt-12">
  <div class="text-center">
    <div class="text-5xl font-bold text-blue-500">95%</div>
    <div class="text-gray-500 mt-2">Metric label</div>
  </div>
  <!-- more items -->
</div>
\`\`\`

### Process Flow

\`\`\`html
<div class="flex items-center justify-center gap-4 mt-12">
  <div class="bg-blue-100 p-4 rounded-lg text-center">
    <div class="text-2xl">1</div>
    <div class="text-sm mt-1">Step name</div>
  </div>
  <div class="text-2xl">\u2192</div>
  <!-- more steps -->
</div>
\`\`\`

### Metadata Footer

\`\`\`html
<div class="abs-br m-6 text-sm opacity-50">
  Author / Date
</div>
\`\`\`

## Best Practices

- Use color sparingly; stick to 2-3 accent colors for consistency.
- Prefer \`mt-\` / \`mb-\` for vertical spacing over empty lines.
- Use \`grid\` or \`flex\` for multi-item layouts rather than manual positioning.
- Keep font sizes large enough for readability: body text at least \`text-lg\`.`

const DESIGN_PRINCIPLES = `# Slide Design Principles

Follow these rules to create professional, readable slides:

1. **One message per slide** - Each slide conveys exactly one idea or point.
2. **3-second rule** - The audience should grasp the main point within 3 seconds of seeing the slide.
3. **Maximum 7 bullet points** - Keep bullet lists to 7 items or fewer; 3-5 is ideal.
4. **Layout variation** - Change the layout every 3-4 slides to maintain visual interest. Do not use \`default\` for every slide.
5. **Visual first** - Prefer diagrams, code, KPIs, and visual patterns over walls of text.
6. **Whitespace matters** - Leave breathing room. Do not cram too much content onto a single slide.
7. **Progressive disclosure** - Use \`<v-clicks>\` on lists and \`<v-click>\` on key takeaways so content appears gradually.
8. **Consistent styling** - Use the same accent colors, font sizes, and spacing throughout.
9. **Strong opening and closing** - Start with a compelling cover slide and end with a clear summary + closing slide.
10. **Readable code** - If showing code, keep it short and use line highlighting to focus attention.`

const OUTPUT_RULES = `# Output Rules

- Output ONLY valid Slidev Markdown. Do NOT include any explanation, commentary, or wrapping fences.
- The very first lines must be the global frontmatter block (\`---\` ... \`---\`).
- Separate each slide with a line containing exactly \`---\`.
- Every slide (except the first one which uses the global frontmatter) should begin with a \`---\` separator.
- If a slide uses a non-default layout, place \`layout: <name>\` in the per-slide frontmatter.
- Use real, meaningful placeholder content derived from the user's input. Never use "Lorem ipsum" or dummy text.
- Ensure the Markdown is syntactically valid and will render correctly in Slidev without errors.
- Do not wrap the output in a Markdown code fence or any other container.`
