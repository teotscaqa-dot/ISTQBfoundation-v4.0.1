export interface Chapter {
  id: number
  title: string
}

export interface Section {
  /** Syllabus number, e.g. "1.4" or "4.2.1". */
  id: string
  chapter: number
  title: string
}

export interface Question {
  /** Stable hash of text + options (+ image), so favorites survive a re-import. */
  id: string
  section: string
  text: string
  options: string[]
  /** Indexes into `options`; more than one means "select N". */
  correct: number[]
  explanation?: string
  /** File name in public/q-img/. */
  image?: string
}

export interface Epic {
  id: string
  title: string
  chapters: Chapter[]
  sections: Section[]
  questions: Question[]
}
