import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Configure PDF.js worker.
// Do NOT import pdf.worker.min.mjs directly.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const KNOWN_EXTS = ['pdf', 'docx', 'txt', 'md', 'csv'] as const

type KnownExt = (typeof KNOWN_EXTS)[number]

const MIME_TO_EXT: Partial<Record<string, KnownExt>> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'text/csv': 'csv',
}

function detectFileType(file: File): KnownExt | undefined {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (
    ext &&
    (KNOWN_EXTS as readonly string[]).includes(ext)
  ) {
    return ext as KnownExt
  }

  return MIME_TO_EXT[file.type]
}

export async function extractFileText(file: File): Promise<string> {
  const type = detectFileType(file)

  switch (type) {
    case 'pdf':
      return extractPdfText(file)

    case 'docx':
      return extractDocxText(file)

    case 'txt':
    case 'md':
    case 'csv':
      return file.text()

    default:
      throw new Error(`Unsupported file type: ${file.name}`)
  }
}

async function extractPdfText(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer())

  const pdf = await pdfjsLib.getDocument({
    data,
    disableStream: true,
    disableAutoFetch: true,
  }).promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)

    try {
      const content = await page.getTextContent()

      const text = content.items
        .filter(
          (item): item is typeof item & { str: string } =>
            'str' in item,
        )
        .map(item => item.str)
        .join(' ')

      pages.push(text)
    } finally {
      page.cleanup()
    }
  }

  return pages.join('\n\n')
}

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()

  const result = await mammoth.extractRawText({
    arrayBuffer,
  })

  return result.value
}
