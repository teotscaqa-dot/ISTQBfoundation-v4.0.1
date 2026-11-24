/**
 * Converts the Google Classroom export (raw/istqb_questions.json) into the app's question bank:
 *   src/data/foundation-4.0.1.json  — bundled into the app (no runtime requests)
 *   public/q-img/<id>.png            — images, loaded only when their question is shown
 *
 * Usage: npm run import [-- path/to/export.json] [--allow-removed]
 *
 * Favorites and excluded marks on users' devices are keyed by question id, so by default the
 * import refuses to drop any id that is in the current bank. Pass --allow-removed to override.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

interface ExportQuestion {
  n: number
  question: string
  type: string
  options: string[]
  correct: string[]
  correctIndex: number[]
  explanation?: string
  images?: string[]
}

interface ExportQuiz {
  chapter: number
  title: string
  questions: ExportQuestion[]
}

const ROOT = join(import.meta.dirname, '..')
const args = process.argv.slice(2)
const ALLOW_REMOVED = args.includes('--allow-removed')
const SRC = resolve(args.find((a) => !a.startsWith('--')) ?? join(ROOT, 'raw', 'istqb_questions.json'))
const OUT = join(ROOT, 'src', 'data', 'foundation-4.0.1.json')
const IMG_DIR = join(ROOT, 'public', 'q-img')

const CHAPTER_TITLES: Record<number, string> = {
  1: 'Fundamentals of Testing',
  2: 'Testing Throughout the SDLC',
  3: 'Static Testing',
  4: 'Test Analysis and Design',
  5: 'Managing the Test Activities',
  6: 'Test Tools',
}

const clean = (s: string) => s.replace(/ /g, ' ').replace(/[ \t]+\n/g, '\n').trim()

/** Drops export noise like "(1 Point) (1.4.3.523)" and "Question 5:" from the question text. */
const cleanQuestion = (s: string) =>
  clean(
    clean(s)
      .replace(/^(\(\d+\s*Points?\)\s*)?(\(\d+(\.\d+)+\)\s*)?/i, '')
      .replace(/\s*\(\d+\s*Points?\)\s*\(\d+(\.\d+)+\)$/i, '')
      .replace(/^Question\s+\d+\s*:\s*/i, ''),
  )

/** "1.4 (2) Test Activities, Testware and Test Roles - Quiz II" -> ["1.4", "Test Activities, ..."] */
function parseSection(quizTitle: string): [string, string] {
  const m = quizTitle.match(/^(\d+(?:\.\d+)+)\.?\s*(.*)$/)
  if (!m) throw new Error(`Cannot read section number from quiz title: "${quizTitle}"`)
  const title = m[2]
    .replace(/^\(\d+\)\s*/, '')
    .replace(/\s*-\s*Quiz\s+[IVX\d]+\s*$/i, '')
    .replace(/\s*Part\s*\d+\.?\s*$/i, '')
    .trim()
  return [m[1], title]
}

const compareSections = (a: string, b: string) => {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? -1) - (pb[i] ?? -1)
    if (d) return d
  }
  return 0
}

/** Stable across re-imports so favorites survive; the image is part of identity for image-only questions. */
function questionId(text: string, options: string[], image = ''): string {
  const payload = [text.toLowerCase(), ...options.map((o) => o.toLowerCase()).sort(), image].join('\u0001')
  return createHash('sha1').update(payload).digest('hex').slice(0, 10)
}

function main() {
  const data = JSON.parse(readFileSync(SRC, 'utf8')) as { quizzes: ExportQuiz[] }
  const previousIds: string[] = existsSync(OUT)
    ? (JSON.parse(readFileSync(OUT, 'utf8')) as { questions: { id: string }[] }).questions.map((q) => q.id)
    : []

  const images = new Map<string, Buffer>()
  const sectionTitles = new Map<string, { chapter: number; title: string }>()
  const questions = new Map<string, object>()
  const problems: string[] = []
  let duplicates = 0
  let imageBytes = 0
  let imageCount = 0

  for (const quiz of data.quizzes) {
    const [section, sectionTitle] = parseSection(quiz.title)
    const known = sectionTitles.get(section)
    // Prefer the shortest variant ("Testing Principles" over "Testing Principles - extra").
    if (!known || sectionTitle.length < known.title.length) {
      sectionTitles.set(section, { chapter: quiz.chapter, title: sectionTitle })
    }

    for (const q of quiz.questions) {
      const where = `${quiz.title} #${q.n}`
      const text = cleanQuestion(q.question)
      const options = q.options.map(clean)
      const correct = q.correctIndex

      if (options.length < 2) problems.push(`${where}: fewer than 2 options`)
      else if (!correct.length || correct.some((i) => i < 0 || i >= options.length)) {
        problems.push(`${where}: invalid correct index ${JSON.stringify(correct)}`)
      } else if (!text && !q.images?.length) problems.push(`${where}: empty question`)
      else {
        const id = questionId(text, options, q.images?.[0])
        if (questions.has(id)) {
          duplicates++
          continue
        }

        let image: string | undefined
        const dataUri = q.images?.[0]
        if (dataUri) {
          const m = dataUri.match(/^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/)
          if (!m) problems.push(`${where}: unsupported image format`)
          else {
            const ext = m[1] === 'jpeg' ? 'jpg' : m[1]
            const bytes = Buffer.from(m[2], 'base64')
            image = `${id}.${ext}`
            images.set(image, bytes)
            imageBytes += bytes.length
            imageCount++
          }
        }

        questions.set(id, {
          id,
          section,
          text,
          options,
          correct,
          ...(q.explanation?.trim() ? { explanation: clean(q.explanation) } : {}),
          ...(image ? { image } : {}),
        })
      }
    }
  }

  // Check before touching any file, so a bad export leaves the current bank intact.
  const removed = previousIds.filter((id) => !questions.has(id))
  if (removed.length) {
    console.error(`${removed.length} question ids from the current bank are missing in the export:`)
    removed.slice(0, 20).forEach((id) => console.error(`  ${id}`))
    if (!ALLOW_REMOVED) {
      console.error('Users would lose favorites/excluded marks on them. Nothing written.')
      console.error('Re-run with --allow-removed if this is intended.')
      process.exit(1)
    }
  }

  rmSync(IMG_DIR, { recursive: true, force: true })
  mkdirSync(IMG_DIR, { recursive: true })
  images.forEach((bytes, file) => writeFileSync(join(IMG_DIR, file), bytes))

  const sections = [...sectionTitles.entries()]
    .sort(([a], [b]) => compareSections(a, b))
    .map(([id, s]) => ({ id, chapter: s.chapter, title: s.title }))
  const chapters = [...new Set(sections.map((s) => s.chapter))]
    .sort((a, b) => a - b)
    .map((id) => ({ id, title: CHAPTER_TITLES[id] ?? `Chapter ${id}` }))

  const epic = {
    id: 'foundation-4.0.1',
    title: 'ISTQB Foundation v4.0.1',
    chapters,
    sections,
    questions: [...questions.values()],
  }
  writeFileSync(OUT, JSON.stringify(epic) + '\n')

  const perSection = new Map<string, number>()
  epic.questions.forEach((q) => {
    const s = (q as { section: string }).section
    perSection.set(s, (perSection.get(s) ?? 0) + 1)
  })

  console.log(`Wrote ${epic.questions.length} questions to ${OUT}`)
  if (previousIds.length) {
    console.log(`New since last import: ${epic.questions.length - previousIds.length + removed.length}`)
  }
  console.log(`Images: ${imageCount} files, ${(imageBytes / 1024).toFixed(0)} KB in ${IMG_DIR}`)
  if (duplicates) console.log(`Skipped duplicates: ${duplicates}`)
  for (const c of chapters) {
    console.log(`\n${c.id}. ${c.title}`)
    sections
      .filter((s) => s.chapter === c.id)
      .forEach((s) => console.log(`   ${s.id.padEnd(6)} ${s.title} — ${perSection.get(s.id) ?? 0}`))
  }
  if (problems.length) {
    console.log(`\nSkipped ${problems.length} invalid questions:`)
    problems.forEach((p) => console.log(`  ${p}`))
  }
}

main()
