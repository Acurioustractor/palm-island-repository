import { checkCompleteness } from '@/lib/content-readiness/check-completeness'
import { generateQuestions } from '@/lib/data-enrichment/generate-questions'
import DataEnrichmentClient from './DataEnrichmentClient'

export const dynamic = 'force-dynamic'

export default async function DataEnrichmentPage() {
  const completeness = await checkCompleteness()
  const gaps = generateQuestions(completeness)

  return <DataEnrichmentClient gaps={gaps} generatedAt={completeness.generatedAt} />
}
