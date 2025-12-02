import { NextResponse } from 'next/server';

export async function GET() {
  const provider = process.env.LLM_PROVIDER || 'ollama';
  const model = provider === 'ollama'
    ? (process.env.OLLAMA_MODEL || 'llama3.1:8b')
    : 'claude-sonnet-4-5';

  return NextResponse.json({
    provider,
    model,
    baseUrl: provider === 'ollama' ? (process.env.OLLAMA_BASE_URL || 'http://localhost:11434') : undefined
  });
}
