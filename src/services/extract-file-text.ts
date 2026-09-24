import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString()

export async function extractFileText(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase()

    switch (extension) {
        case 'pdf':
            return extractPdfText(file)
        case 'docx':
            return extractDocxText(file)
        case 'txt':
        case 'md':
        case 'csv':
            return file.text()
        default:
            throw new Error(`Unsupported file type: .${extension}`)
    }
}

async function extractPdfText(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    const pages: string[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const text = content.items
            .filter((item): item is { str: string } => 'str' in item)
            .map(item => item.str)
            .join(' ')
        pages.push(text)
    }

    return pages.join('\n\n')
}

async function extractDocxText(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return result.value
}
