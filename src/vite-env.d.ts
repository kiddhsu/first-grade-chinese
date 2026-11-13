/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'hanzi-writer' {
  export type HanziWriterOptions = {
    width?: number
    height?: number
    padding?: number
    strokeColor?: string
    radicalColor?: string
    outlineColor?: string
    drawingColor?: string
    drawingWidth?: number
    showOutline?: boolean
    showCharacter?: boolean
    strokeAnimationSpeed?: number
    delayBetweenStrokes?: number
    charDataLoader?: (
      char: string,
      onComplete: (data: unknown) => void,
    ) => void
  }

  export default class HanziWriter {
    static create(
      element: string | HTMLElement,
      character: string,
      options?: HanziWriterOptions,
    ): HanziWriter
    quiz(options?: {
      onComplete?: (result: { totalMistakes: number }) => void
      onCorrectStroke?: () => void
      onMistake?: () => void
    }): void
    animateCharacter(options?: { onComplete?: () => void }): void
    hideCharacter(): void
    showCharacter(): void
    showOutline(): void
    cancelQuiz(): void
    setCharacter(char: string): Promise<void>
  }
}
