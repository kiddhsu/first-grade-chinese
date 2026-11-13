import type { Lesson } from '../../types'
import lesson01 from './lesson-01.json'
import lesson02 from './lesson-02.json'
import lesson03 from './lesson-03.json'
import lesson04 from './lesson-04.json'
import lesson05 from './lesson-05.json'
import lesson06 from './lesson-06.json'

export const lessons: Lesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
] as Lesson[]

export function getLesson(id: number): Lesson | undefined {
  return lessons.find((l) => l.lessonId === id)
}

export function allWritingChars() {
  return lessons.flatMap((l) =>
    l.writingChars.map((c) => ({ ...c, lessonId: l.lessonId })),
  )
}

export function allCharsForLesson(lesson: Lesson) {
  return [...lesson.writingChars, ...lesson.readingChars]
}
