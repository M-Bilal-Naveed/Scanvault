# ScanVault

ScanVault is an Expo and React Native app for creating and managing PDFs on-device.

## Features

- Scan pages with the camera or import images, then combine them into a PDF.
- Convert DOCX, PPTX, XLSX, XLS, and CSV files to PDFs using CloudConvert. The selected document is uploaded only after confirmation; CloudConvert's free tier has daily limits.
- Preview PDFs, share them with installed apps, and save copies to a device folder. On iOS, use **Save to Files** in the share sheet.
- Extract text from images with on-device OCR. If native recognition is unavailable, the app can use OCR.space after confirmation.
- Choose System, Light, or Dark appearance in Settings.

Files and preferences are stored locally on the device. Provider API keys are encrypted on-device; documents/images sent for online processing are uploaded to the selected provider. Read each provider's terms and privacy policy before use.

## Development

Install dependencies and start the Expo development server:

```bash
npm install
npx expo start
```

Native OCR, network status, and encrypted API-key storage use native modules and require a development or production build. Rebuild after changing native dependencies or app configuration:

```bash
npx expo run:android
npx expo run:ios
```

Expo Go does not include ScanVault's native OCR module. If you see `Cannot find native module 'ExpoTextExtractor'`, install a development build with the commands above instead of opening the project in Expo Go; rebuild after adding or changing native dependencies.

To enable online OCR, register for a free OCR.space API key. To enable Office conversion, create a CloudConvert API key with `task.read` and `task.write` scopes using the link in **Settings**. Save the keys in **Settings**; both services impose free-tier limits. Native OCR remains on-device and works offline.

Run the project checks with:

```bash
npm run lint
npx tsc --noEmit
```
