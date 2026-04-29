# Component Library

The single home for reusable, design-system-grade components. Every entry here:

1. Has a Pencil source in `picc-almanac-web.pen` (or `picc-annual-report.pen` for legacy).
2. Uses tokens from `lib/design-tokens/*` — no hardcoded colours / spacing.
3. Ships in **two implementations** that share types: `web.tsx` (Tailwind + React DOM) and `pdf.tsx` (React PDF + Yoga). PDF is optional for components that aren't used in printable output.
4. Exposes a `sample.tsx` so the gallery at `/picc/design-system/components` can render it live.

## File layout

```
components/library/<Name>/
  ├── web.tsx       Required. React DOM + Tailwind classes.
  ├── pdf.tsx       Optional. React PDF (@react-pdf/renderer).
  ├── sample.tsx    Required. Default-prop demo for the gallery.
  ├── types.ts      Required. Single `Props` interface, exported.
  ├── meta.ts       Required. { name, description, pencilNodeId, category, implementations }.
  └── README.md     Optional. Longer notes / usage caveats.
```

## Rules

- **Types are source of truth.** Both `web.tsx` and `pdf.tsx` import `Props` from `types.ts`.
- **Tokens, not values.** Use Tailwind classes that map to generated tokens (`bg-brand-ocean`, `text-section-health`, `p-md`). For PDF, import from `@/lib/pdf/theme` (which is itself generated from tokens).
- **Sample drives the gallery.** Whatever you put in `sample.tsx` is what shows up at `/picc/design-system/components`. Make it representative.
- **Meta is mandatory** so the gallery can index components without imports for every file.

## Adding a component

1. Design in Pencil. Mark the reusable component with `metadata.code_target = "library/<Name>"`.
2. Use the scaffolder: `npx tsx scripts/scaffold-component.ts <Name>` — emits the five files above with sensible stubs.
3. Fill in `types.ts` (props), `web.tsx` (Tailwind), `pdf.tsx` if shipping to PDF, `sample.tsx` (default props).
4. Update `meta.ts` with the Pencil node id, category, and which implementations exist.
5. Component appears at `/picc/design-system/components` automatically.
