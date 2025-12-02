/**
 * Content Chunking Service for RAG
 *
 * Chunks text content into optimal sizes for retrieval-augmented generation.
 * Uses semantic boundaries (paragraphs, headers) with overlap for context preservation.
 */

export interface Chunk {
  text: string
  index: number
  tokenCount: number
  metadata: {
    startChar: number
    endChar: number
    headers: string[]
    hasCodeBlock: boolean
    hasList: boolean
  }
}

export interface ChunkOptions {
  maxTokens?: number
  overlapTokens?: number
  preserveHeaders?: boolean
  preserveCodeBlocks?: boolean
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  maxTokens: 256,
  overlapTokens: 50,
  preserveHeaders: true,
  preserveCodeBlocks: true
}

/**
 * Estimate token count (rough approximation: ~4 chars per token for English)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Split text into semantic sections based on markdown structure
 */
function splitIntoSections(text: string): Array<{
  content: string
  type: 'header' | 'paragraph' | 'code' | 'list' | 'other'
  headerLevel?: number
  headers: string[]
}> {
  const sections: Array<{
    content: string
    type: 'header' | 'paragraph' | 'code' | 'list' | 'other'
    headerLevel?: number
    headers: string[]
  }> = []

  const currentHeaders: string[] = []

  // Split by double newlines (paragraphs)
  const blocks = text.split(/\n\n+/)

  for (const block of blocks) {
    const trimmedBlock = block.trim()
    if (!trimmedBlock) continue

    // Check for header
    const headerMatch = trimmedBlock.match(/^(#{1,6})\s+(.+)$/)
    if (headerMatch) {
      const level = headerMatch[1].length
      const headerText = headerMatch[2]

      // Update header hierarchy
      while (currentHeaders.length >= level) {
        currentHeaders.pop()
      }
      currentHeaders.push(headerText)

      sections.push({
        content: trimmedBlock,
        type: 'header',
        headerLevel: level,
        headers: [...currentHeaders]
      })
      continue
    }

    // Check for code block
    if (trimmedBlock.startsWith('```') || trimmedBlock.startsWith('~~~')) {
      sections.push({
        content: trimmedBlock,
        type: 'code',
        headers: [...currentHeaders]
      })
      continue
    }

    // Check for list
    if (/^[-*+]\s|^\d+\.\s/.test(trimmedBlock)) {
      sections.push({
        content: trimmedBlock,
        type: 'list',
        headers: [...currentHeaders]
      })
      continue
    }

    // Regular paragraph
    sections.push({
      content: trimmedBlock,
      type: 'paragraph',
      headers: [...currentHeaders]
    })
  }

  return sections
}

/**
 * Merge small sections together while respecting token limits
 */
function mergeSections(
  sections: Array<{ content: string; headers: string[]; type: string }>,
  maxTokens: number
): Array<{ content: string; headers: string[]; hasCodeBlock: boolean; hasList: boolean }> {
  const merged: Array<{
    content: string
    headers: string[]
    hasCodeBlock: boolean
    hasList: boolean
  }> = []

  let currentContent = ''
  let currentHeaders: string[] = []
  let hasCodeBlock = false
  let hasList = false

  for (const section of sections) {
    const sectionTokens = estimateTokens(section.content)
    const currentTokens = estimateTokens(currentContent)

    // If this section alone exceeds max, split it
    if (sectionTokens > maxTokens && section.type !== 'code') {
      // Push current accumulated content first
      if (currentContent) {
        merged.push({
          content: currentContent,
          headers: currentHeaders,
          hasCodeBlock,
          hasList
        })
        currentContent = ''
        hasCodeBlock = false
        hasList = false
      }

      // Split large section into sentences
      const sentences = section.content.match(/[^.!?]+[.!?]+/g) || [section.content]
      let tempContent = ''

      for (const sentence of sentences) {
        const tempTokens = estimateTokens(tempContent + sentence)
        if (tempTokens > maxTokens && tempContent) {
          merged.push({
            content: tempContent.trim(),
            headers: section.headers,
            hasCodeBlock: false,
            hasList: section.type === 'list'
          })
          tempContent = sentence
        } else {
          tempContent += sentence
        }
      }

      if (tempContent) {
        currentContent = tempContent
        currentHeaders = section.headers
        hasList = section.type === 'list'
      }
      continue
    }

    // If adding this section exceeds max, push current and start new
    if (currentTokens + sectionTokens > maxTokens && currentContent) {
      merged.push({
        content: currentContent,
        headers: currentHeaders,
        hasCodeBlock,
        hasList
      })
      currentContent = section.content
      currentHeaders = section.headers
      hasCodeBlock = section.type === 'code'
      hasList = section.type === 'list'
      continue
    }

    // Add to current
    if (currentContent) {
      currentContent += '\n\n' + section.content
    } else {
      currentContent = section.content
      currentHeaders = section.headers
    }

    if (section.type === 'code') hasCodeBlock = true
    if (section.type === 'list') hasList = true
  }

  // Don't forget the last chunk
  if (currentContent) {
    merged.push({
      content: currentContent,
      headers: currentHeaders,
      hasCodeBlock,
      hasList
    })
  }

  return merged
}

/**
 * Add overlap between chunks for context preservation
 */
function addOverlap(chunks: Chunk[], overlapTokens: number): Chunk[] {
  if (chunks.length <= 1 || overlapTokens === 0) return chunks

  const result: Chunk[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    // Add overlap from previous chunk
    if (i > 0) {
      const prevChunk = chunks[i - 1]
      const prevText = prevChunk.text
      const overlapChars = overlapTokens * 4 // Approximate chars for overlap

      // Get last N characters from previous chunk
      const overlap = prevText.slice(-overlapChars)
      const overlapStart = overlap.indexOf(' ')
      const cleanOverlap = overlapStart > 0 ? overlap.slice(overlapStart + 1) : overlap

      const newText = cleanOverlap + '\n\n' + chunk.text
      result.push({
        ...chunk,
        text: newText,
        tokenCount: estimateTokens(newText)
      })
    } else {
      result.push(chunk)
    }
  }

  return result
}

/**
 * Main chunking function
 */
export function chunkContent(content: string, options: ChunkOptions = {}): Chunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Clean the content
  const cleanedContent = content
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')  // Normalize multiple newlines
    .trim()

  if (!cleanedContent) return []

  // Split into semantic sections
  const sections = splitIntoSections(cleanedContent)

  // Merge small sections
  const mergedSections = mergeSections(sections, opts.maxTokens)

  // Create chunks with metadata
  let charOffset = 0
  const chunks: Chunk[] = mergedSections.map((section, index) => {
    const startChar = charOffset
    charOffset += section.content.length + 2 // +2 for the \n\n between sections

    return {
      text: section.content,
      index,
      tokenCount: estimateTokens(section.content),
      metadata: {
        startChar,
        endChar: charOffset - 2,
        headers: section.headers,
        hasCodeBlock: section.hasCodeBlock,
        hasList: section.hasList
      }
    }
  })

  // Add overlap if requested
  if (opts.overlapTokens > 0) {
    return addOverlap(chunks, opts.overlapTokens)
  }

  return chunks
}

/**
 * Chunk multiple pieces of content and return flat array
 */
export function chunkMultiple(
  contents: Array<{ content: string; sourceId: string }>,
  options: ChunkOptions = {}
): Array<Chunk & { sourceId: string }> {
  const allChunks: Array<Chunk & { sourceId: string }> = []

  for (const item of contents) {
    const chunks = chunkContent(item.content, options)
    for (const chunk of chunks) {
      allChunks.push({
        ...chunk,
        sourceId: item.sourceId
      })
    }
  }

  return allChunks
}
