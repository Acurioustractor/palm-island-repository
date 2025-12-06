/**
 * PDF Processing for Annual Reports
 *
 * Extract text, metadata, and structure from PDF documents
 * for indexing and AI-powered analysis.
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface PDFPage {
  pageNumber: number;
  text: string;
  tables?: string[][];
  images?: { description: string; position: string }[];
}

interface PDFDocument {
  title: string;
  author?: string;
  createdDate?: string;
  pageCount: number;
  pages: PDFPage[];
  metadata: Record<string, string>;
}

interface ExtractedSection {
  title: string;
  content: string;
  pageRange: [number, number];
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'image';
}

interface ProcessedReport {
  id: string;
  title: string;
  year: string;
  summary: string;
  sections: ExtractedSection[];
  keyTopics: string[];
  entities: {
    people: string[];
    places: string[];
    organizations: string[];
    programs: string[];
  };
  statistics: {
    metric: string;
    value: string;
    context: string;
  }[];
  fullText: string;
}

/**
 * Extract text from PDF using pdf-parse
 * Falls back to base64 encoding for Claude Vision if text extraction fails
 */
export async function extractPDFText(pdfBuffer: Buffer): Promise<PDFDocument> {
  try {
    // Dynamic import for pdf-parse (server-side only)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{
      text: string;
      numpages: number;
      info: Record<string, string>;
    }>;

    const data = await pdfParse(pdfBuffer);

    // Split into pages (pdf-parse provides full text, we estimate pages)
    const textPerPage = Math.ceil(data.text.length / (data.numpages || 1));
    const pages: PDFPage[] = [];

    for (let i = 0; i < (data.numpages || 1); i++) {
      const start = i * textPerPage;
      const end = Math.min(start + textPerPage, data.text.length);
      pages.push({
        pageNumber: i + 1,
        text: data.text.slice(start, end)
      });
    }

    return {
      title: data.info?.Title || 'Untitled Document',
      author: data.info?.Author,
      createdDate: data.info?.CreationDate,
      pageCount: data.numpages || 1,
      pages,
      metadata: data.info || {}
    };
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Process PDF page image with Claude Vision for enhanced extraction
 * Use when text extraction quality is poor or for image-heavy PDFs
 * Note: Requires PDF page to be converted to an image first (PNG/JPEG)
 */
export async function processPDFWithVision(
  pageImageBase64: string,
  options: {
    extractTables?: boolean;
    describeImages?: boolean;
    identifyStructure?: boolean;
    mediaType?: 'image/png' | 'image/jpeg';
  } = {}
): Promise<string> {
  const {
    extractTables = true,
    describeImages = true,
    identifyStructure = true,
    mediaType = 'image/png'
  } = options;

  const instructions = [
    'Extract all text content from this document page image.',
    extractTables ? 'Format any tables as markdown tables.' : '',
    describeImages ? 'Describe any images or charts in [Image: description] format.' : '',
    identifyStructure ? 'Identify headings, sections, and maintain document structure.' : ''
  ].filter(Boolean).join(' ');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: pageImageBase64
            }
          },
          {
            type: 'text',
            text: instructions
          }
        ]
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');
  return textContent?.text || '';
}

/**
 * Analyze and structure annual report content
 */
export async function analyzeAnnualReport(
  document: PDFDocument,
  year?: string
): Promise<ProcessedReport> {
  const fullText = document.pages.map(p => p.text).join('\n\n');

  // Use Claude to analyze and structure the report
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are analyzing an annual report for the Palm Island Community Company (PICC).
Extract structured information about community programs, achievements, statistics, and key people.
Preserve cultural context and Indigenous perspectives. Be accurate with names, places, and numbers.`,
    messages: [
      {
        role: 'user',
        content: `Analyze this annual report and extract structured information.

Document Title: ${document.title}
Year: ${year || 'Unknown'}

Content:
${fullText.slice(0, 50000)} ${fullText.length > 50000 ? '...[truncated]' : ''}

Please provide a JSON response with:
1. summary: A 2-3 paragraph executive summary
2. sections: Array of major sections with titles and brief descriptions
3. keyTopics: Array of main topics covered
4. entities: Object with arrays of people, places, organizations, programs mentioned
5. statistics: Array of key statistics with metric, value, and context

Return ONLY valid JSON.`
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');
  let analysis;

  try {
    // Extract JSON from response
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/);
    analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    analysis = {
      summary: 'Analysis could not be completed',
      sections: [],
      keyTopics: [],
      entities: { people: [], places: [], organizations: [], programs: [] },
      statistics: []
    };
  }

  return {
    id: `report-${year || Date.now()}`,
    title: document.title,
    year: year || 'Unknown',
    summary: analysis.summary || '',
    sections: (analysis.sections || []).map((s: { title: string; description: string }, i: number) => ({
      title: s.title || `Section ${i + 1}`,
      content: s.description || '',
      pageRange: [1, document.pageCount] as [number, number],
      type: 'heading' as const
    })),
    keyTopics: analysis.keyTopics || [],
    entities: {
      people: analysis.entities?.people || [],
      places: analysis.entities?.places || [],
      organizations: analysis.entities?.organizations || [],
      programs: analysis.entities?.programs || []
    },
    statistics: analysis.statistics || [],
    fullText
  };
}

/**
 * Index processed report for search
 */
export async function indexReport(
  report: ProcessedReport,
  generateEmbeddings: (text: string) => Promise<number[]>
): Promise<{
  chunks: Array<{
    id: string;
    text: string;
    embedding: number[];
    metadata: Record<string, unknown>;
  }>;
}> {
  const chunks: Array<{
    id: string;
    text: string;
    embedding: number[];
    metadata: Record<string, unknown>;
  }> = [];

  // Create chunks from sections
  const textChunks = splitIntoChunks(report.fullText, 1000, 100);

  for (let i = 0; i < textChunks.length; i++) {
    const chunk = textChunks[i];
    const embedding = await generateEmbeddings(chunk);

    chunks.push({
      id: `${report.id}-chunk-${i}`,
      text: chunk,
      embedding,
      metadata: {
        reportId: report.id,
        reportTitle: report.title,
        year: report.year,
        chunkIndex: i,
        totalChunks: textChunks.length
      }
    });
  }

  // Also create embeddings for the summary
  const summaryEmbedding = await generateEmbeddings(report.summary);
  chunks.unshift({
    id: `${report.id}-summary`,
    text: report.summary,
    embedding: summaryEmbedding,
    metadata: {
      reportId: report.id,
      reportTitle: report.title,
      year: report.year,
      type: 'summary'
    }
  });

  return { chunks };
}

/**
 * Split text into overlapping chunks for embedding
 */
function splitIntoChunks(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 100
): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);

  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    currentChunk.push(word);
    currentLength += word.length + 1;

    if (currentLength >= chunkSize) {
      chunks.push(currentChunk.join(' '));

      // Keep overlap words for context
      const overlapWords = Math.floor(overlap / 5); // Approximate words
      currentChunk = currentChunk.slice(-overlapWords);
      currentLength = currentChunk.join(' ').length;
    }
  }

  // Add remaining text
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

/**
 * Extract specific information from annual report
 */
export async function extractReportInfo(
  text: string,
  infoType: 'financial' | 'programs' | 'staff' | 'achievements' | 'statistics'
): Promise<Record<string, unknown>> {
  const prompts: Record<string, string> = {
    financial: `Extract all financial information including:
- Total revenue and expenses
- Funding sources
- Budget allocations by program
- Year-over-year comparisons
Return as JSON with clear categories.`,

    programs: `Extract all community programs and services including:
- Program names and descriptions
- Target populations
- Outcomes and metrics
- Staff involved
Return as JSON array of programs.`,

    staff: `Extract information about staff and leadership:
- Board members and roles
- Key staff positions
- New hires or departures
- Staff achievements
Return as JSON with categories.`,

    achievements: `Extract key achievements and milestones:
- Major accomplishments
- Awards or recognition
- Successful initiatives
- Community impact stories
Return as JSON array of achievements.`,

    statistics: `Extract all statistics and metrics:
- Service delivery numbers
- Population data
- Program participation
- Comparative data
Return as JSON array with metric, value, and context.`
  };

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `${prompts[infoType]}

Document content:
${text.slice(0, 30000)}

Return ONLY valid JSON.`
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');

  try {
    const jsonMatch = textContent?.text?.match(/[\[{][\s\S]*[\]}]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return { error: 'Failed to parse extracted information' };
  }
}

/**
 * Compare two annual reports
 */
export async function compareReports(
  report1: ProcessedReport,
  report2: ProcessedReport
): Promise<{
  yearOverYear: {
    category: string;
    previousValue: string;
    currentValue: string;
    change: string;
  }[];
  newPrograms: string[];
  discontinuedPrograms: string[];
  highlights: string[];
}> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: 'Compare two annual reports and identify key changes, trends, and developments.',
    messages: [
      {
        role: 'user',
        content: `Compare these two annual reports:

Report 1 (${report1.year}):
${report1.summary}
Key Topics: ${report1.keyTopics.join(', ')}
Programs: ${report1.entities.programs.join(', ')}

Report 2 (${report2.year}):
${report2.summary}
Key Topics: ${report2.keyTopics.join(', ')}
Programs: ${report2.entities.programs.join(', ')}

Provide a JSON response with:
1. yearOverYear: Array of {category, previousValue, currentValue, change}
2. newPrograms: Programs in report2 not in report1
3. discontinuedPrograms: Programs in report1 not in report2
4. highlights: Key changes and trends

Return ONLY valid JSON.`
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');

  try {
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      yearOverYear: [],
      newPrograms: [],
      discontinuedPrograms: [],
      highlights: []
    };
  } catch {
    return {
      yearOverYear: [],
      newPrograms: [],
      discontinuedPrograms: [],
      highlights: []
    };
  }
}
