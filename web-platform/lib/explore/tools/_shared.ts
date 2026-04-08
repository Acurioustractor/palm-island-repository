import { tool, jsonSchema, type Tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// Zod v4's toJSONSchema() produces valid JSON Schema but the AI SDK tool()
// function doesn't auto-convert Zod v4 schemas correctly for Anthropic's API.
// This helper converts to JSON Schema explicitly via jsonSchema() wrapper.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineTool<TInput, TOutput>(def: { description: string; parameters: z.ZodType<TInput>; execute: (input: TInput) => Promise<TOutput> }): Tool<TInput, TOutput> {
  const js = def.parameters.toJSONSchema()
  // Remove $schema field — Anthropic API doesn't accept it
  delete (js as Record<string, unknown>)['$schema']
  return (tool as any)({
    description: def.description,
    parameters: jsonSchema(js as any),
    inputSchema: jsonSchema(js as any),
    execute: def.execute,
  }) as Tool<TInput, TOutput>
}

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export function buildPublicUrl(bucket: string, path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

/** Resolve a media_files row to a usable URL — prefer public_url, fall back to storage path */
export function resolveMediaUrl(row: { public_url?: string | null; file_path?: string | null; bucket_name?: string | null }): string | null {
  if (row.public_url) return row.public_url
  if (row.file_path && row.bucket_name) return buildPublicUrl(row.bucket_name, row.file_path)
  if (row.file_path) return buildPublicUrl('story-media', row.file_path)
  return null
}
