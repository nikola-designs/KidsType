# Kids Type (V1)

Kids Type is a calm, paper-first writing and drawing web app for early childhood.

The entire experience lives on one shared page where a child can:

- draw freely
- type directly on the same paper surface
- erase
- undo / redo
- clear the page

No forms, worksheets, or quiz mechanics are used.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- DaisyUI (cupcake theme)
- HTML canvas rendering layer
- `@chenglou/pretext` for text layout/measurement

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
npm run start
```

## Project Structure

```text
app/
  layout.tsx
  page.tsx
  globals.css

components/
  CanvasWorkspace.tsx
  PaperSurface.tsx
  TextLayer.tsx
  Toolbar.tsx

lib/
  drawing-engine/
    renderer.ts
    smoothing.ts
    types.ts
  text-engine/
    pretext-layout.ts
    text-operations.ts
    types.ts
  input-manager/
    pointer.ts
  state/
    history.ts
    tool-state.ts
    workspace-state.ts

styles/
  paper.css
  theme.ts
```

## Core V1 Architecture

- `CanvasRenderer` is responsible for fast redraw of stroke data.
- `drawing-engine` stores stroke geometry and smoothing behavior.
- `text-engine` handles text block creation and updates.
- `pretext-layout` powers deterministic multiline text layout on the paper layer.
- `useHistoryState` provides generic undo/redo snapshots.
- `CanvasWorkspace` composes tool state, pointer input, and rendering.
- `PaperSurface` keeps drawing and typing in one shared paper layer.

## Interaction Notes

- Pencil and eraser use pointer events (mouse, touch, stylus-ready).
- Drawing updates are rendered directly to canvas for low-latency feel.
- Text is placed by tapping/clicking on paper in `Type` mode.
- Typed text appears on paper as editable content, not form inputs.

## V2 Extension Notes

This V1 is prepared for future additions without rewriting the core:

- letter tracing guides:
  render guide overlays before stroke pass in `CanvasRenderer`
- handwriting templates:
  add background template model in `workspace-state`
- save/load:
  serialize `WorkspaceDocument` to local storage or backend
- multiple sheets:
  wrap `WorkspaceDocument` in sheet collection state
- stickers/brushes:
  expand `Stroke` model with brush metadata and stamp objects
- parent/teacher modes:
  add top-level mode context and scoped tool permissions
- progress tracking:
  add optional event log stream from input manager

## Design Direction

- warm, low-pressure, calm
- large tap targets
- soft sage accent (`#7A9E7E`)
- paper texture + subtle shadows
- minimal controls to preserve expressive flow
