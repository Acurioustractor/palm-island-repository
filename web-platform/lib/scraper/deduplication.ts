/**
 * Deduplication Service for Scraped Content
 *
 * Multi-level deduplication:
 * 1. Exact hash - SHA-256 for identical content
 * 2. MinHash - For near-duplicate detection (similar content)
 * 3. Semantic similarity - Using embeddings (optional)
 */

import { createHash } from 'crypto'

/**
 * Generate SHA-256 hash of content for exact deduplication
 */
export function contentHash(content: string): string {
  return createHash('sha256')
    .update(content.toLowerCase().trim())
    .digest('hex')
}

/**
 * Generate hash for a chunk (includes position context)
 */
export function chunkHash(
  chunkText: string,
  contentHash: string,
  chunkIndex: number
): string {
  return createHash('sha256')
    .update(`${contentHash}:${chunkIndex}:${chunkText}`)
    .digest('hex')
}

/**
 * Generate n-gram shingles from text
 */
function getShingles(text: string, n: number = 3): Set<string> {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0)

  const shingles = new Set<string>()

  for (let i = 0; i <= words.length - n; i++) {
    const shingle = words.slice(i, i + n).join(' ')
    shingles.add(shingle)
  }

  return shingles
}

/**
 * Simple hash function with seed for MinHash
 */
function hashWithSeed(str: string, seed: number): number {
  let hash = seed
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Generate MinHash signature for near-duplicate detection
 */
export function minHashSignature(content: string, numPerm: number = 128): number[] {
  const shingles = getShingles(content, 3)
  const shingleArray = Array.from(shingles)
  const signature: number[] = []

  for (let i = 0; i < numPerm; i++) {
    let minHash = Infinity

    for (let j = 0; j < shingleArray.length; j++) {
      const hash = hashWithSeed(shingleArray[j], i * 1000 + 1)
      if (hash < minHash) {
        minHash = hash
      }
    }

    signature.push(minHash === Infinity ? 0 : minHash)
  }

  return signature
}

/**
 * Calculate Jaccard similarity between two MinHash signatures
 */
export function minHashSimilarity(sig1: number[], sig2: number[]): number {
  if (sig1.length !== sig2.length) {
    throw new Error('Signatures must have the same length')
  }

  let matches = 0
  for (let i = 0; i < sig1.length; i++) {
    if (sig1[i] === sig2[i]) {
      matches++
    }
  }

  return matches / sig1.length
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }

  if (norm1 === 0 || norm2 === 0) return 0

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

/**
 * Check if content is a near-duplicate using MinHash
 */
export function isNearDuplicate(
  newSignature: number[],
  existingSignatures: number[][],
  threshold: number = 0.8
): { isDuplicate: boolean; matchIndex: number; similarity: number } {
  for (let i = 0; i < existingSignatures.length; i++) {
    const similarity = minHashSimilarity(newSignature, existingSignatures[i])
    if (similarity >= threshold) {
      return {
        isDuplicate: true,
        matchIndex: i,
        similarity
      }
    }
  }

  return {
    isDuplicate: false,
    matchIndex: -1,
    similarity: 0
  }
}

/**
 * Check if content is semantically duplicate using embeddings
 */
export function isSemanticDuplicate(
  newEmbedding: number[],
  existingEmbeddings: number[][],
  threshold: number = 0.92
): { isDuplicate: boolean; matchIndex: number; similarity: number } {
  for (let i = 0; i < existingEmbeddings.length; i++) {
    const similarity = cosineSimilarity(newEmbedding, existingEmbeddings[i])
    if (similarity >= threshold) {
      return {
        isDuplicate: true,
        matchIndex: i,
        similarity
      }
    }
  }

  return {
    isDuplicate: false,
    matchIndex: -1,
    similarity: 0
  }
}

/**
 * Normalize content for better deduplication
 */
export function normalizeContent(content: string): string {
  return content
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim()
}

/**
 * Full deduplication check combining all methods
 */
export interface DeduplicationResult {
  isExactDuplicate: boolean
  isNearDuplicate: boolean
  exactHash: string
  minHashSignature: number[]
  nearDuplicateSimilarity?: number
}

export function checkDuplication(
  content: string,
  existingHashes: Set<string>,
  existingSignatures: number[][],
  options: {
    nearDuplicateThreshold?: number
  } = {}
): DeduplicationResult {
  const { nearDuplicateThreshold = 0.8 } = options

  const hash = contentHash(content)
  const signature = minHashSignature(content)

  // Check exact duplicate
  const isExact = existingHashes.has(hash)

  // Check near duplicate
  const nearCheck = isNearDuplicate(signature, existingSignatures, nearDuplicateThreshold)

  return {
    isExactDuplicate: isExact,
    isNearDuplicate: nearCheck.isDuplicate,
    exactHash: hash,
    minHashSignature: signature,
    nearDuplicateSimilarity: nearCheck.similarity
  }
}
