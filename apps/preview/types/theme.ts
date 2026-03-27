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
