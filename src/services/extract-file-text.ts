import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&inline'

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker()

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
            .filter(item => 'str' in item)
            .map(item => (item as { str: string }).str)
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
