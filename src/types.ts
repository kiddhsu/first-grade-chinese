export type CharEntry = {
  char: string
  zhuyin: string
  radical: string
  words: string[]
}

export type SentencePattern = {
  id: string
  prompt: string
  tokens: string[]
  answer: string[]
}

export type PunctItem = {
  id: string
  before: string
  after: string
  options: string[]
  answer: string
}

export type Lesson = {
  lessonId: number
  title: string
  writingChars: CharEntry[]
  readingChars: CharEntry[]
  sentencePatterns: SentencePattern[]
  punctuationItems: PunctItem[]
}

export type GameMode =
  | 'stroke'
  | 'recognize'
  | 'radical'
  | 'punct'
  | 'sentence'

export type ProgressState = {
  stars: Record<string, number>
  wrongChars: string[]
  sessionStartedAt: number | null
  restPromptDismissedUntil: number | null
}
