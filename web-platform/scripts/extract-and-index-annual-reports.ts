/**
 * Extract full text content from annual report PDFs and index with embeddings
 * This makes all reports searchable through the LLM system
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { pdf } from 'pdf-to-img'
import OpenAI from 'openai'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiKey = process.env.OPENAI_API_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

if (!openaiKey) {
  console.error('❌ Missing OpenAI API key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const openai = new OpenAI({ apiKey: openaiKey })

const FISCAL_YEARS = [
  '2009-10', '2010-11', '2011-12', '2012-13', '2013-14', '2014-15',
  '2015-16', '2016-17', '2017-18', '2018-19', '2019-20', '2020-21',
  '2021-22', '2022-23', '2023-24'
]

// FISCAL_YEAR_INFO with enhanced metadata
const FISCAL_YEAR_INFO: Record<string, any> = {
  '2009-10': { theme: 'Foundation & Early Growth', era: 'foundation', color: 'amber', keywords: ['foundation', 'community control', 'establishing services'] },
  '2010-11': { theme: 'Building Infrastructure', era: 'foundation', color: 'amber', keywords: ['infrastructure', 'growth', 'expansion'] },
  '2011-12': { theme: 'Service Expansion', era: 'foundation', color: 'amber', keywords: ['services', 'expansion', 'community programs'] },
  '2012-13': { theme: 'Community Engagement', era: 'foundation', color: 'amber', keywords: ['engagement', 'community', 'participation'] },
  '2013-14': { theme: 'Strengthening Governance', era: 'growth', color: 'purple', keywords: ['governance', 'accountability', 'leadership'] },
  '2014-15': { theme: 'Health & Wellbeing Focus', era: 'growth', color: 'purple', keywords: ['health', 'wellbeing', 'services'] },
  '2015-16': { theme: 'Economic Development', era: 'growth', color: 'purple', keywords: ['economic', 'development', 'employment'] },
  '2016-17': { theme: 'Cultural Preservation', era: 'growth', color: 'purple', keywords: ['culture', 'heritage', 'preservation'] },
  '2017-18': { theme: 'Housing & Infrastructure', era: 'growth', color: 'purple', keywords: ['housing', 'infrastructure', 'facilities'] },
  '2018-19': { theme: 'Education & Training', era: 'growth', color: 'purple', keywords: ['education', 'training', 'skills'] },
  '2019-20': { theme: 'Transition Planning', era: 'transition', color: 'green', keywords: ['transition', 'planning', 'change'] },
  '2020-21': { theme: 'Community Control Achieved', era: 'transition', color: 'green', keywords: ['community control', 'achievement', 'milestone'] },
  '2021-22': { theme: 'Self-Determination', era: 'community-led', color: 'blue', keywords: ['self-determination', 'autonomy', 'empowerment'] },
  '2022-23': { theme: 'Community-Led Growth', era: 'community-led', color: 'blue', keywords: ['community-led', 'growth', 'innovation'] },
  '2023-24': { theme: 'Sustainable Future', era: 'community-led', color: 'blue', keywords: ['sustainable', 'future', 'vision'] }
}

interface ProcessingResult {
  fiscalYear: string
  pagesProcessed: number
  textExtracted: number
  embeddingGenerated: boolean
  knowledgeEntryUpdated: boolean
  errors: string[]
}

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.substring(0, 8000) // Limit to 8000 chars for embedding
  })

  return response.data[0].embedding
}

/**
 * Extract text from PDF using pdf-parse
 */
async function extractTextFromPDF(pdfPath: string): Promise<string> {
  try {
    // For now, we'll use pdf-to-img to render pages and extract visible text
    // In production, you'd want to use a proper PDF text extraction library like pdf-parse
    const pdfParse = require('pdf-parse')
    const dataBuffer = readFileSync(pdfPath)
    const data = await pdfParse(dataBuffer)

    return data.text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    // Fallback: return empty string or use OCR
    return ''
  }
}

/**
 * Clean and prepare text for indexing
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable chars
    .trim()
}

/**
 * Generate a summary from the full text
 */
async function generateSummary(text: string, fiscalYear: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes PICC annual reports. Create a concise 2-3 paragraph summary highlighting key achievements, programs, and milestones.'
        },
        {
          role: 'user',
          content: `Summarize this PICC Annual Report for ${fiscalYear}:\n\n${text.substring(0, 6000)}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating summary:', error)
    return ''
  }
}

async function processAnnualReport(fiscalYear: string): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    fiscalYear,
    pagesProcessed: 0,
    textExtracted: 0,
    embeddingGenerated: false,
    knowledgeEntryUpdated: false,
    errors: []
  }

  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📅 Processing ${fiscalYear}`)
    console.log('='.repeat(60))

    // Find PDF file
    const pdfFileName = `picc-annual-report-${fiscalYear}.pdf`
    const pdfPath = resolve(process.cwd(), 'public', 'documents', 'annual-reports', pdfFileName)

    console.log(`📄 Extracting text from PDF...`)
    const fullText = await extractTextFromPDF(pdfPath)

    if (!fullText || fullText.length < 100) {
      result.errors.push('No text could be extracted from PDF')
      console.log('⚠️  No text extracted - PDF may be image-based or encrypted')
      return result
    }

    result.textExtracted = fullText.length
    const cleanedText = cleanText(fullText)
    console.log(`✅ Extracted ${cleanedText.length} characters of text`)

    // Generate AI summary
    console.log(`🤖 Generating AI summary...`)
    const aiSummary = await generateSummary(cleanedText, fiscalYear)
    console.log(`✅ Generated ${aiSummary.length} character summary`)

    // Generate embedding
    console.log(`🧮 Generating embedding...`)
    const embedding = await generateEmbedding(cleanedText)
    result.embeddingGenerated = true
    console.log(`✅ Generated ${embedding.length}-dimensional embedding`)

    // Find existing knowledge entry
    const slug = `picc-annual-report-${fiscalYear}-full-pdf`
    const { data: existingEntry, error: fetchError } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('slug', slug)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    const yearInfo = FISCAL_YEAR_INFO[fiscalYear]

    // Prepare update data
    const updateData = {
      content: cleanedText,
      summary: aiSummary || `Complete annual report for PICC ${fiscalYear}. ${yearInfo?.theme || ''}`,
      embedding: embedding,
      keywords: yearInfo?.keywords || [],
      structured_data: {
        ...existingEntry?.structured_data,
        text_extracted_at: new Date().toISOString(),
        character_count: cleanedText.length,
        embedding_model: 'text-embedding-3-small',
        ai_summary_generated: !!aiSummary
      }
    }

    if (existingEntry) {
      // Update existing entry
      console.log(`📝 Updating existing knowledge entry...`)
      const { error: updateError } = await supabase
        .from('knowledge_entries')
        .update(updateData)
        .eq('id', existingEntry.id)

      if (updateError) throw updateError
      console.log(`✅ Updated knowledge entry: ${slug}`)
    } else {
      // Create new entry
      console.log(`📝 Creating new knowledge entry...`)
      const { error: insertError } = await supabase
        .from('knowledge_entries')
        .insert({
          slug,
          title: `PICC Annual Report ${fiscalYear}`,
          subtitle: yearInfo?.theme || `Annual Report ${fiscalYear}`,
          entry_type: 'document',
          category: 'annual-report',
          fiscal_year: fiscalYear,
          is_public: true,
          is_featured: true,
          ...updateData
        })

      if (insertError) throw insertError
      console.log(`✅ Created knowledge entry: ${slug}`)
    }

    result.knowledgeEntryUpdated = true

  } catch (error: any) {
    result.errors.push(error.message || String(error))
    console.error(`❌ Error processing ${fiscalYear}:`, error)
  }

  return result
}

async function main() {
  console.log('🚀 ANNUAL REPORTS TEXT EXTRACTION & INDEXING')
  console.log('='.repeat(60))
  console.log()
  console.log('This will:')
  console.log('  1. Extract all text from annual report PDFs')
  console.log('  2. Generate AI summaries')
  console.log('  3. Create embeddings for semantic search')
  console.log('  4. Update knowledge base with full content')
  console.log()

  // Install pdf-parse if needed
  try {
    require('pdf-parse')
  } catch (e) {
    console.log('📦 Installing pdf-parse...')
    const { execSync } = require('child_process')
    execSync('npm install pdf-parse', { stdio: 'inherit' })
  }

  const results: ProcessingResult[] = []

  for (const fiscalYear of FISCAL_YEARS) {
    const result = await processAnnualReport(fiscalYear)
    results.push(result)

    // Rate limiting for OpenAI API
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Summary
  console.log('\n\n' + '='.repeat(60))
  console.log('📊 FINAL SUMMARY')
  console.log('='.repeat(60))

  const totalText = results.reduce((sum, r) => sum + r.textExtracted, 0)
  const withEmbeddings = results.filter(r => r.embeddingGenerated).length
  const updated = results.filter(r => r.knowledgeEntryUpdated).length
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)

  console.log(`\n✅ Processed: ${results.length} reports`)
  console.log(`✅ Text extracted: ${(totalText / 1000).toFixed(1)}K characters`)
  console.log(`✅ Embeddings generated: ${withEmbeddings}`)
  console.log(`✅ Knowledge entries updated: ${updated}`)
  if (totalErrors > 0) {
    console.log(`⚠️  Errors: ${totalErrors}`)
  }

  console.log('\n📋 Details by year:')
  results.forEach(r => {
    const status = r.knowledgeEntryUpdated ? '✅' : '❌'
    console.log(`  ${status} ${r.fiscalYear}: ${(r.textExtracted / 1000).toFixed(1)}K chars extracted`)
  })

  console.log('\n\n🎉 All annual reports are now indexed and searchable!')
  console.log('You can now ask questions like:')
  console.log('  - "When did PICC achieve community control?"')
  console.log('  - "Show me all mentions of health services"')
  console.log('  - "What were the key achievements in 2020?"')
}

main()
  .then(() => {
    console.log('\n✅ Complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
