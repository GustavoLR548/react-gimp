# react-gimp 🎨

> Author fixed-size visual artboards in React — YouTube thumbnails, OpenGraph cards, Instagram carousels, and decks — preview them at any zoom, and export pixel-perfect PNG, JPG, PDF, or ZIP.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-Headless_Export-45ba4b?logo=playwright)](https://playwright.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-green?logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Overview

**react-gimp** brings the developer experience of modern component-driven web design to graphic production:
- **Design in React**: Use standard JSX, Tailwind CSS, SVG graphics, and custom components.
- **Dynamic Inspector**: Define editable content using [Zod](https://zod.dev) schemas. Form inputs (color pickers, file uploaders, text areas, and inputs) are automatically generated in a live inspector sidebar.
- **Automatic State Persistence**: Field customizations persist across sessions in `localStorage` per project.
- **Zoom & Pan Canvas**: Freely inspect designs at any zoom level or fit them to your screen without altering export dimensions.
- **Multi-Format Export**: Export single artboards as PNG/JPG, batch multi-page artboards into a single PDF, or download them all in a structured ZIP.
- **Headless CLI / CI Export**: Generate exports programmatically via Playwright with pixel accuracy in automated pipelines.

---

## 📑 Table of Contents

- [Quick Start](#-quick-start)
- [Project Architecture](#-project-architecture)
- [Authoring a Project](#-authoring-a-project)
  - [Defining Frames & Schemas](#defining-frames--schemas)
  - [Inspector UI Metadata](#inspector-ui-metadata)
  - [Styling & Tailwind](#styling--tailwind)
  - [Canvas Clipping](#canvas-clipping)
- [Included Presets & Templates](#-included-presets--templates)
- [Exporting](#-exporting)
  - [In-Browser Export (`useExport`)](#in-browser-export-useexport)
  - [Headless / CI Export (Playwright)](#headless--ci-export-playwright)
- [Assets, Fonts & CORS](#-assets-fonts--cors)
- [Testing & Quality](#-testing--quality)
- [Known Limitations](#-known-limitations)
- [License](#-license)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm (or pnpm / yarn)

### Installation

```bash
git clone git@github.com:GustavoLR548/react-gimp.git
cd react-gimp
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to launch the workspace:
1. Select a project from the top dropdown (e.g. Godot Android Thumbnail, YouTube Thumbnail, OG Card, or Instagram Carousel).
2. Click any frame on the canvas to select it.
3. Edit fields in the inspector sidebar on the right — changes update live and persist in `localStorage`.
4. Use the bottom export bar to download PNG, JPG, PDF, or ZIP.

---

## 🏗️ Project Architecture

```text
react-gimp/
├── projects/                # Private @react-gimp/projects package
│   ├── carousel/            # Multi-slide carousel templates
│   ├── godot-android-thumbnail/ # High-impact Godot 4 YouTube thumbnail design
│   ├── thumbnail/           # Sample video thumbnail design
│   ├── package.json         # Local package linked into node_modules by npm
│   └── projects.tsx         # Active project registry and package entrypoint
├── packages/
│   └── sdk/                 # Project authoring API exposed as @react-gimp/sdk
├── scripts/
│   └── export-headless.ts   # CLI script for Playwright-driven exports
├── src/
│   ├── app/                 # Workspace shell, sidebar inspector, toolbar, storage
│   ├── core/                # Dimension presets, unit conversions, aspect ratio fitting
│   ├── export/              # Export utilities (assets preloading, CORS helpers, ZIP/PDF)
│   └── react/               # Core framework primitives (<Gimp>, <Canvas>, <Page>, <Img>)
├── index.html
├── vite.config.ts
└── vitest.config.ts
```

---

## 🎨 Authoring a Project

A **frame** represents one design: an `id`, an aspect-ratio `preset`, a Zod `schema` for editable fields, initial `defaults`, and a `render` function returning JSX content. A **project** is a named collection of frames.

### Defining Frames & Schemas

Create or edit projects in `projects/projects.tsx`. `npm install` links that
private package at `node_modules/@react-gimp/projects`, which is how the app
imports the registry. Project packages use the host-owned `@react-gimp/sdk`
authoring API:

```tsx
import { z } from 'zod'
import { defineFrame, defineProject, ui } from '@react-gimp/sdk'

const heroFrame = defineFrame({
  id: 'hero',
  name: 'Hero Frame',
  preset: 'youtube', // 1280x720
  schema: z.object({
    title: z.string().min(1).register(ui, { label: 'Title', order: 0 }),
    background: z.string().register(ui, {
      label: 'Background',
      control: { kind: 'color' },
      order: 1,
    }),
  }),
  defaults: {
    title: 'Ship it faster',
    background: '#1d4ed8',
  },
  render: ({ title }) => (
    <div className="flex h-full items-end p-10">
      <h1 className="text-6xl font-black text-white">{title}</h1>
    </div>
  ),
})

export const projects = [
  defineProject({
    id: 'hero-project',
    name: 'Hero Project',
    frames: [heroFrame],
  }),
]
```

### Using a Separate Git Repository

A replacement project repository is an npm package with the name
`@react-gimp/projects`, a `projects.tsx` entrypoint that exports `projects`,
and `@react-gimp/sdk` as a peer dependency. Its project source imports
`defineFrame`, `defineProject`, `ui`, and `Img` from `@react-gimp/sdk`; it
must not reach into react-gimp with relative paths.

Its root `package.json` should follow this shape:

```json
{
  "name": "@react-gimp/projects",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "exports": "./projects.tsx",
  "peerDependencies": {
    "@react-gimp/sdk": "^0.1.0",
    "react": "^18.3.1",
    "zod": "^4.5.4"
  }
}
```

Point react-gimp at that repository by replacing the local dependency in
`package.json`:

```json
{
  "dependencies": {
    "@react-gimp/projects": "git+ssh://git@github.com/you/react-gimp-projects.git#main"
  }
}
```

Then run `npm install`. The app loads the replacement through the same
`@react-gimp/projects` import, and Tailwind scans that installed package for
design classes.

### Inspector UI Metadata

- **`schema.register(ui, { ... })`**: Provides hints for how the field renders in the inspector (`label`, `control`, `order`, `help`). It is compile-time checked against your schema keys.
- Supported controls:
  - Text input (default for `z.string()`)
  - Textarea (`control: { kind: 'textarea', rows: 3 }`)
  - Color picker (`control: { kind: 'color' }`)
  - Image/File uploader (`control: { kind: 'file' }`)
  - Checkbox (`control: { kind: 'checkbox' }` for `z.boolean()`)
- **`background`**: Every frame should specify a `background` field in its schema, which is applied directly to the enclosing `<Page>` container.

### Styling & Tailwind

Tailwind CSS v4 is configured and works inside any `<Page>` child component. The outer canvas math remains decoupled from Tailwind classes, ensuring consistent geometric rendering and export fidelity.

### Canvas Clipping

`<Page>` uses `contain: layout paint`, clipping any overflow exactly at the artboard's border. Because exports are generated with strict pixel dimensions, overflow bleed is prevented by design. If you need more bleed or padding, increase the declared canvas preset dimensions.

---

## 📐 Included Presets & Templates

The repository comes configured with real-world presets and ready-to-use projects:

| Preset | Dimensions | Target Output |
| :--- | :--- | :--- |
| `youtube` | 1280 × 720 px | YouTube Video Thumbnails |
| `og` | 1200 × 630 px | OpenGraph / Twitter Social Cards |
| `square` | 1080 × 1080 px | Instagram Posts & Carousels |
| `story` | 1080 × 1920 px | Reels / Stories / TikTok |

### Featured Templates in `projects/`
1. **Godot Android Export Thumbnail**: High-impact, multi-layered YouTube thumbnail & social card with blueprint grid, tech badges, and Godot 4 asset branding.
2. **Standard YouTube Thumbnail**: Minimalist, clean card featuring title, author, and background image slot.
3. **OpenGraph Card**: Reusable card layout tailored for social sharing previews.
4. **Instagram Carousel**: Multi-frame project configured with `layout: 'row'`, featuring sequential slides.

---

## 💾 Exporting

### In-Browser Export (`useExport`)

Export functions are available programmatically via the `useExport` hook:

```tsx
import { useExport } from './react/useExport'

function ExportControls() {
  const { exportPage, exportPdf, exportZip, state } = useExport()

  return (
    <div className="flex gap-2">
      <button disabled={state.isExporting} onClick={() => exportPage('hero', { pixelRatio: 2 })}>
        Download PNG
      </button>
      <button disabled={state.isExporting} onClick={() => exportPdf()}>
        Download PDF
      </button>
      <button disabled={state.isExporting} onClick={() => exportZip()}>
        Download ZIP
      </button>
    </div>
  )
}
```

- **`exportPage(id, opts?)`**: Exports a single page as PNG or JPG.
- **`exportPdf(opts?)`**: Generates a unified multi-page PDF where each frame maintains its declared aspect ratio.
- **`exportZip(opts?)`**: Zips all rendered frames with zero-padded filenames.
- **`renderPage(id, opts?)`**: Rasterizes a page to a `Blob` for in-browser preview without downloading.

> **Zoom Independence Guarantee**: Changing the canvas zoom (e.g. 25%, 50%, Fit) does not affect output dimensions. Exports are rendered strictly against their preset width, height, and target `pixelRatio`.

### Headless / CI Export (Playwright)

Run automated batch exports without opening a browser:

```bash
# Ensure Chromium is installed
npx playwright install chromium

# Export all projects into export-headless-out/
npm run export:headless -- --pdf --zip

# Export a specific project
npm run export:headless -- --project=godot-android-export --pixel-ratio=2
```

Available flags:
- `--project=<id>`: Limit export to a single project ID.
- `--pixel-ratio=<n>`: Resolution scale factor (default: `2`).
- `--format=<png|jpg>`: Output raster image format.
- `--out-dir=<path>`: Custom output folder.
- `--pdf`: Output a multi-page PDF alongside images.
- `--zip`: Package outputs into a ZIP archive.

---

## 🖼️ Assets, Fonts & CORS

1. **Images & CORS**:
   - Use the `<Img>` component instead of raw `<img>` tags — it handles preloading and cross-origin attributes safely.
   - For remote images, ensure the host sends appropriate CORS headers (`Access-Control-Allow-Origin: *`).
   - For guaranteed stability, store static assets locally in `public/`.
2. **Fonts**:
   - Web fonts should be self-hosted with `@font-face`. This guarantees exact visual parity when running both in the browser and across headless Chromium in CI environments.

---

## 🧪 Testing & Quality

Run the Vitest test suite covering presets, rasterization, storage, and export contracts:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# TypeScript type check and production build
npm run build
```

---

## ⚠️ Known Limitations

In-browser exports use SVG `<foreignObject>` rasterization (`modern-screenshot`):
- `backdrop-filter` and advanced CSS blend modes may not render in the browser export path.
- CSS `position: fixed` within frames may behave differently than native browser viewports.
- *Solution*: If your design relies on advanced CSS filters or backdrop effects, use the Playwright headless export (`npm run export:headless`), which takes native browser engine screenshots without `<foreignObject>` constraints.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
