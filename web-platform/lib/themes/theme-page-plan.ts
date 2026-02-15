import type { ThemeDefinition, PdfPageEntry } from './types'

/**
 * Gets the PDF page plan template for a theme.
 * These map directly to page types in the existing report_page_assignments system.
 */
export function getThemePagePlan(theme: ThemeDefinition): PdfPageEntry[] {
  return theme.pdfPageTypes
}

/**
 * Creates the edition key used in report_page_assignments for themed reports.
 */
export function getThemeEditionKey(themeSlug: string): string {
  return `theme-${themeSlug}`
}
