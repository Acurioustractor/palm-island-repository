/**
 * Saltwater Almanac — composable elements.
 *
 * The 12-element grammar that turns the FY24-25 annual report from a stack
 * of pages into one continuous curated exhibition. See the locked grammar
 * spec in `PICC-2024-25-CURATORIAL-GRAMMAR.md`.
 *
 * Element index:
 *   01. Cartouche      — section opener / wall plaque (full A4)
 *   02. Reliquary      — single sacred number per anchor story
 *   03. Songline       — full-spread horizontal narrative band (RARE)
 *   04. Lantern        — Elder voice quote (sacred, refuses section colour)
 *   05. Hearth         — Community voice with photo
 *   06. Horizon        — Forward-looking vision quote
 *   07. Atlas          — Services-around-island map
 *   08. Specimen       — Before/after comparative panel
 *   09. KulingField    — Constellation of small stats
 *   10. Vitrine        — Display case for one fact
 *   11. Fold           — Photo plate (consented, named)
 *   12. MarginNote     — Curator's whisper
 *
 * Plus a shared atmospheric wrapper:
 *   AmbientPage — the six layers that run UNDER everything
 */
export { Cartouche } from './Cartouche'
export { Reliquary } from './Reliquary'
export { Songline } from './Songline'
export { Lantern } from './Lantern'
export { Hearth } from './Hearth'
export { Horizon } from './Horizon'
export { Atlas } from './Atlas'
export { Specimen } from './Specimen'
export { KulingField } from './KulingField'
export { Vitrine, VitrineTriptych } from './Vitrine'
export { Fold, FoldPair } from './Fold'
export { MarginNote } from './MarginNote'
