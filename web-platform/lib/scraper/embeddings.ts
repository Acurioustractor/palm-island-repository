/**
 * Embedding Service for RAG
 *
 * Generates vector embeddings for content chunks.
 * Primary: Voyage AI (best performance for retrieval)
 * Fallback: OpenAI text-embedding-3-small
 */

export interface EmbeddingResult {
  embeddings: number[][]
  model: string
  totalTokens: number
  success: boolean
  error?: string
}

/**
 * Generate embeddings using Voyage AI
 * Model: voyage-3-lite ($0.02/1M tokens, 1024 dimensions)
 */
export async function voyageEmbeddings(
  texts: string[],
  inputType: 'document' | 'query' = 'document'
): Promise<EmbeddingResult> {
  const apiKey = process.env.VOYAGE_API_KEY

  if (!apiKey) {
    return {
      embeddings: [],
      model: 'voyage-3-lite',
      totalTokens: 0,
      success: false,
      error: 'VOYAGE_API_KEY is not set'
    }
  }

  try {
    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'voyage-3-lite',
        input: texts,
        input_type: inputType
      })
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        embeddings: [],
        model: 'voyage-3-lite',
        totalTokens: 0,
        success: false,
        error: `Voyage API error: ${response.status} - ${error}`
      }
    }

    const data = await response.json()

    return {
      embeddings: data.data.map((d: any) => d.embedding),
      model: 'voyage-3-lite',
      totalTokens: data.usage?.total_tokens || 0,
      success: true
    }
  } catch (error: any) {
    return {
      embeddings: [],
      model: 'voyage-3-lite',
      totalTokens: 0,
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate embeddings using OpenAI (fallback)
 * Model: text-embedding-3-small (1536 dimensions)
 */
export async function openaiEmbeddings(texts: string[]): Promise<EmbeddingResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return {
      embeddings: [],
      model: 'text-embedding-3-small',
      totalTokens: 0,
      success: false,
      error: 'OPENAI_API_KEY is not set'
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts
      })
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        embeddings: [],
        model: 'text-embedding-3-small',
        totalTokens: 0,
        success: false,
        error: `OpenAI API error: ${response.status} - ${error}`
      }
    }

    const data = await response.json()

    return {
      embeddings: data.data.map((d: any) => d.embedding),
      model: 'text-embedding-3-small',
      totalTokens: data.usage?.total_tokens || 0,
      success: true
    }
  } catch (error: any) {
    return {
      embeddings: [],
      model: 'text-embedding-3-small',
      totalTokens: 0,
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate embeddings with automatic fallback
 * Tries Voyage AI first, falls back to OpenAI
 */
export async function generateEmbeddings(
  texts: string[],
  options: {
    inputType?: 'document' | 'query'
    preferredProvider?: 'voyage' | 'openai'
  } = {}
): Promise<EmbeddingResult> {
  const { inputType = 'document', preferredProvider = 'voyage' } = options

  // Try preferred provider first
  if (preferredProvider === 'voyage') {
    const result = await voyageEmbeddings(texts, inputType)
    if (result.success) return result

    // Fallback to OpenAI
    console.warn('Voyage AI failed, falling back to OpenAI:', result.error)
    return openaiEmbeddings(texts)
  } else {
    const result = await openaiEmbeddings(texts)
    if (result.success) return result

    // Fallback to Voyage
    console.warn('OpenAI failed, falling back to Voyage AI:', result.error)
    return voyageEmbeddings(texts, inputType)
  }
}

/**
 * Batch embedding generation for large sets of texts
 * Processes in batches to avoid API limits
 */
export async function batchEmbeddings(
  texts: string[],
  options: {
    batchSize?: number
    inputType?: 'document' | 'query'
    preferredProvider?: 'voyage' | 'openai'
    onProgress?: (completed: number, total: number) => void
  } = {}
): Promise<EmbeddingResult> {
  const {
    batchSize = 100,
    inputType = 'document',
    preferredProvider = 'voyage',
    onProgress
  } = options

  const allEmbeddings: number[][] = []
  let totalTokens = 0
  let model = ''

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const result = await generateEmbeddings(batch, { inputType, preferredProvider })

    if (!result.success) {
      return {
        embeddings: allEmbeddings,
        model: model || result.model,
        totalTokens,
        success: false,
        error: `Batch ${Math.floor(i / batchSize) + 1} failed: ${result.error}`
      }
    }

    allEmbeddings.push(...result.embeddings)
    totalTokens += result.totalTokens
    model = result.model

    if (onProgress) {
      onProgress(Math.min(i + batchSize, texts.length), texts.length)
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return {
    embeddings: allEmbeddings,
    model,
    totalTokens,
    success: true
  }
}
