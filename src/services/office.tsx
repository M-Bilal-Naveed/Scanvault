import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char] ?? char);
}

function xmlText(xml: string) {
  return xml
    .replace(/<\/w:p>|<\/a:p>/g, '\n')
    .replace(/<w:tab\b[^>]*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .trim();
}

function documentHtml(content: string, title: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { margin: 48px; }
    body { font-family: Arial, sans-serif; font-size: 12pt; color: #172033; }
    h1 { font-size: 20pt; margin: 0 0 20px; }
    p { line-height: 1.5; white-space: pre-wrap; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
    td, th { border: 1px solid #9aa3b2; padding: 5px; }
    .slide, .sheet { page-break-after: always; }
    .slide:last-child, .sheet:last-child { page-break-after: auto; }
  </style></head><body><h1>${escapeHtml(title)}</h1>${content}</body></html>`;
}

async function officeHtml(uri: string, extension: string, title: string) {
  const bytes = await new File(uri).bytes();
  if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
    const workbook = XLSX.read(bytes, { type: 'array' });
    const sheets = workbook.SheetNames.map((name) => {
      const html = XLSX.utils.sheet_to_html(workbook.Sheets[name]);
      return `<section class="sheet"><h2>${escapeHtml(name)}</h2>${html}</section>`;
    });
    return { html: documentHtml(sheets.join(''), title), pages: Math.max(sheets.length, 1) };
  }

  const archive = await JSZip.loadAsync(bytes);
  if (extension === 'docx') {
    const document = await archive.file('word/document.xml')?.async('string');
    if (!document) throw new Error('This Word document does not contain readable document text.');
    const paragraphs = document.split(/<\/w:p>/).map((part) => xmlText(part)).filter(Boolean);
    const body = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
    return { html: documentHtml(body || '<p>No text found in this document.</p>', title), pages: 1 };
  }

  const slides = Object.keys(archive.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((a, b) => Number(a.match(/slide(\d+)/)?.[1]) - Number(b.match(/slide(\d+)/)?.[1]));
  if (slides.length === 0) throw new Error('This PowerPoint file does not contain readable slides.');
  const slideContent = await Promise.all(slides.map(async (path, index) => {
    const xml = await archive.file(path)!.async('string');
    const text = xml.match(/<a:t\b[^>]*>[\s\S]*?<\/a:t>/g) ?? [];
    const lines = text.map((part) => xmlText(part)).filter(Boolean);
    const paragraphs = lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
    return `<section class="slide"><h2>Slide ${index + 1}</h2>${paragraphs}</section>`;
  }));
  return { html: documentHtml(slideContent.join(''), title), pages: slides.length };
}

export async function convertOffice(uri: string, fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (!['docx', 'pptx', 'xlsx', 'xls', 'csv'].includes(extension)) {
    throw new Error(`Unsupported file type: .${extension}`);
  }
  const title = fileName.replace(/\.[^.]+$/, '');
  const { html, pages } = await officeHtml(uri, extension, title);
  const result = await Print.printToFileAsync({ html });
  const outputName = title.replace(/[\\/:*?"<>|]/g, '-') || 'converted';
  const output = new File(Paths.document, `${outputName}-${Date.now()}.pdf`);
  output.create();
  await output.write(await new File(result.uri).bytes());
  return { name: `${title}.pdf`, uri: output.uri, size: output.size, pages: result.numberOfPages || pages };
}
