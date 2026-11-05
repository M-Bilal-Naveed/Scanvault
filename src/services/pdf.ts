import { PDFDocument } from 'pdf-lib';
import { File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export type Page = { uri: string; width: number; height: number };
const A4: [number, number] = [595.28, 841.89];

// Re-saves the image once at quality 1 (fixes EXIF rotation). Never compressed again.
export async function normalize(uri: string): Promise<Page> {
  const r = await ImageManipulator.manipulateAsync(uri, [], {
    compress: 1, format: ImageManipulator.SaveFormat.JPEG,
  });
  return { uri: r.uri, width: r.width, height: r.height };
}

async function save(pdf: PDFDocument, name: string) {
  const safeName = name.replace(/[\\/:*?"<>|]/g, '-');
  const file = new File(Paths.document, `${safeName}-${Date.now()}.pdf`);
  file.create();
  await file.write(await pdf.save());
  return { uri: file.uri, size: file.size, pages: pdf.getPageCount() };
}

export async function imagesToPdf(pages: Page[], name: string, fit: 'a4' | 'image') {
  const pdf = await PDFDocument.create();
  for (const p of pages) {
    const img = await pdf.embedJpg(await new File(p.uri).bytes());
    if (fit === 'image') {
      pdf.addPage([p.width, p.height]).drawImage(img, { x: 0, y: 0, width: p.width, height: p.height });
    } else {
      const portrait = p.height >= p.width;
      const [pw, ph] = portrait ? A4 : [A4[1], A4[0]];
      const k = Math.min((pw - 40) / p.width, (ph - 40) / p.height);
      const w = p.width * k, h = p.height * k;
      pdf.addPage([pw, ph]).drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    }
  }
  return save(pdf, name);
}

export async function mergePdfs(uris: string[], name: string) {
  if (uris.length < 2) throw new Error('Select at least two PDF files to merge.');
  const out = await PDFDocument.create();
  for (const u of uris) {
    const src = await PDFDocument.load(await new File(u).bytes());
    const copied = await out.copyPages(src, src.getPageIndices());
    copied.forEach((pg) => out.addPage(pg));
  }
  return save(out, name);
}

export const fmtSize = (b: number) =>
  b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
