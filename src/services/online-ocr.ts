import { File, UploadType } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { getProviderKey } from './provider-keys';

const MAX_FREE_UPLOAD_SIZE = 1024 * 1024;
const OCR_ENDPOINT = 'https://api.ocr.space/parse/image';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(errorText).filter(Boolean).join('\n');
  if (isRecord(value)) {
    const message = value.ErrorMessage ?? value.message;
    if (message !== undefined) return errorText(message);
  }
  return '';
}

async function prepareImage(uri: string) {
  const original = new File(uri);
  if (!original.exists || original.size <= 0) {
    throw new Error('The selected image is missing or empty.');
  }

  const variants = original.size <= MAX_FREE_UPLOAD_SIZE
    ? [[undefined, 0.8] as const]
    : [[1600, 0.65], [1200, 0.5], [900, 0.4]] as const;
  for (const [width, compress] of variants) {
    const context = ImageManipulator.ImageManipulator.manipulate(uri);
    try {
      if (width) context.resize({ width });
      const image = await context.renderAsync();
      try {
        const result = await image.saveAsync({
          format: ImageManipulator.SaveFormat.JPEG,
          compress,
        });
        const file = new File(result.uri);
        if (file.size > 0 && file.size <= MAX_FREE_UPLOAD_SIZE) {
          return { file, temporary: true };
        }
        if (file.exists) await file.delete();
      } finally {
        image.release();
      }
    } finally {
      context.release();
    }
  }

  throw new Error('OCR.space free requests support images up to 1 MB. Choose a smaller image and try again.');
}

export async function recognizeImageTextOnline(uri: string) {
  const apiKey = (await getProviderKey('ocr'))?.trim();
  if (!apiKey) {
    throw new Error('Add your free OCR.space API key in Settings before using online OCR.');
  }

  const prepared = await prepareImage(uri);
  try {
    const response = await prepared.file.upload(OCR_ENDPOINT, {
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: 'image/jpeg',
      headers: { apikey: apiKey },
      parameters: { language: 'eng', isOverlayRequired: 'false' },
      sessionType: 'foreground',
    });
    let payload: unknown;
    try {
      payload = JSON.parse(response.body);
    } catch {
      throw new Error(`OCR.space returned an invalid response (HTTP ${response.status}).`);
    }
    if (response.status < 200 || response.status >= 300) {
      const detail = errorText(payload);
      throw new Error(detail || `OCR.space request failed (HTTP ${response.status}).`);
    }
    if (!isRecord(payload)) throw new Error('OCR.space returned an invalid response.');
    if (payload.IsErroredOnProcessing === true) {
      throw new Error(errorText(payload.ErrorMessage) || 'OCR.space could not recognize this image.');
    }
    if (!Array.isArray(payload.ParsedResults)) {
      throw new Error('OCR.space did not return recognized text.');
    }
    const lines = payload.ParsedResults.flatMap((result) =>
      isRecord(result) && typeof result.ParsedText === 'string' ? [result.ParsedText] : [],
    );
    return lines.join('\n').trim();
  } finally {
    if (prepared.temporary && prepared.file.exists) await prepared.file.delete();
  }
}
