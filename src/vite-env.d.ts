/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

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
