/**
 * Voice Recording Service
 *
 * Browser-based audio recording for oral histories
 * with auto-transcription using Whisper.
 */

import { transcribeAudio, TranscriptionResult } from './transcription'

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioUrl?: string
  audioBlob?: Blob
}

export interface RecordingOptions {
  maxDuration?: number // seconds, default 30 minutes
  onProgress?: (duration: number) => void
  onError?: (error: Error) => void
}

export interface VoiceStoryResult {
  audioBlob: Blob
  audioUrl: string
  duration: number
  transcription: TranscriptionResult
  storyDraft?: {
    title: string
    content: string
    summary: string
  }
}

/**
 * Browser audio recorder class
 * Note: This is designed to run on the client side
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private startTime: number = 0
  private pausedDuration: number = 0
  private pauseStartTime: number = 0
  private intervalId: NodeJS.Timeout | null = null
  private options: RecordingOptions

  public state: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0
  }

  constructor(options: RecordingOptions = {}) {
    this.options = {
      maxDuration: 30 * 60, // 30 minutes default
      ...options
    }
  }

  /**
   * Check if browser supports recording
   */
  static isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    )
  }

  /**
   * Request microphone permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch {
      return false
    }
  }

  /**
   * Start recording
   */
  async start(): Promise<void> {
    if (this.state.isRecording) {
      throw new Error('Already recording')
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Determine best supported format
      const mimeType = this.getSupportedMimeType()
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000
      })

      this.audioChunks = []
      this.startTime = Date.now()
      this.pausedDuration = 0

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start(1000) // Collect data every second

      // Update duration
      this.intervalId = setInterval(() => {
        if (!this.state.isPaused) {
          const elapsed = (Date.now() - this.startTime - this.pausedDuration) / 1000
          this.state.duration = elapsed

          if (this.options.onProgress) {
            this.options.onProgress(elapsed)
          }

          // Check max duration
          if (this.options.maxDuration && elapsed >= this.options.maxDuration) {
            this.stop()
          }
        }
      }, 100)

      this.state.isRecording = true
      this.state.isPaused = false
    } catch (error: any) {
      if (this.options.onError) {
        this.options.onError(error)
      }
      throw error
    }
  }

  /**
   * Pause recording
   */
  pause(): void {
    if (!this.state.isRecording || this.state.isPaused) return

    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause()
    }

    this.pauseStartTime = Date.now()
    this.state.isPaused = true
  }

  /**
   * Resume recording
   */
  resume(): void {
    if (!this.state.isRecording || !this.state.isPaused) return

    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume()
    }

    this.pausedDuration += Date.now() - this.pauseStartTime
    this.state.isPaused = false
  }

  /**
   * Stop recording and return audio blob
   */
  async stop(): Promise<{ audioBlob: Blob; audioUrl: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.state.isRecording) {
        reject(new Error('Not recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        // Stop all tracks
        this.stream?.getTracks().forEach(track => track.stop())

        // Clear interval
        if (this.intervalId) {
          clearInterval(this.intervalId)
          this.intervalId = null
        }

        // Create blob
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm'
        const audioBlob = new Blob(this.audioChunks, { type: mimeType })
        const audioUrl = URL.createObjectURL(audioBlob)

        this.state = {
          isRecording: false,
          isPaused: false,
          duration: this.state.duration,
          audioUrl,
          audioBlob
        }

        resolve({
          audioBlob,
          audioUrl,
          duration: this.state.duration
        })
      }

      this.mediaRecorder.stop()
    })
  }

  /**
   * Cancel recording
   */
  cancel(): void {
    if (this.mediaRecorder && this.state.isRecording) {
      this.mediaRecorder.stop()
    }

    this.stream?.getTracks().forEach(track => track.stop())

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.state.audioUrl) {
      URL.revokeObjectURL(this.state.audioUrl)
    }

    this.state = {
      isRecording: false,
      isPaused: false,
      duration: 0
    }
  }

  /**
   * Get supported MIME type
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'audio/webm'
  }

  /**
   * Get current state
   */
  getState(): RecordingState {
    return { ...this.state }
  }
}

/**
 * Convert audio blob to format suitable for Whisper
 */
export async function convertToWhisperFormat(
  audioBlob: Blob
): Promise<{ buffer: Buffer; filename: string }> {
  // Whisper accepts webm, mp3, mp4, wav, etc.
  // We'll keep the original format if it's supported
  const arrayBuffer = await audioBlob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Determine filename based on mime type
  const mimeType = audioBlob.type
  let extension = 'webm'
  if (mimeType.includes('mp4')) extension = 'mp4'
  else if (mimeType.includes('ogg')) extension = 'ogg'
  else if (mimeType.includes('mp3')) extension = 'mp3'
  else if (mimeType.includes('wav')) extension = 'wav'

  return {
    buffer,
    filename: `recording.${extension}`
  }
}

/**
 * Process voice recording into a story
 */
export async function processVoiceStory(
  audioBlob: Blob,
  options: {
    generateTitle?: boolean
    generateSummary?: boolean
    storyType?: string
  } = {}
): Promise<VoiceStoryResult> {
  const { generateTitle = true, generateSummary = true } = options

  // Convert audio
  const { buffer, filename } = await convertToWhisperFormat(audioBlob)

  // Transcribe
  const transcription = await transcribeAudio(buffer, filename, {
    prompt: 'This is an oral history recording from Palm Island community. The speaker may discuss cultural knowledge, personal experiences, or community stories.',
    includeTimestamps: true
  })

  // Generate story draft if requested
  let storyDraft
  if (generateTitle || generateSummary) {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 600,
      system: `You are helping process an oral history recording from Palm Island community.
Create a respectful, accurate story draft from the transcription.
Preserve the speaker's voice and message.`,
      messages: [{
        role: 'user',
        content: `Transcription of oral story:
"${transcription.text}"

Create a story draft with:
1. A compelling title that captures the essence
2. The content (cleaned up for readability but preserving voice)
3. A brief 2-sentence summary

Respond with JSON:
{
  "title": "...",
  "content": "...",
  "summary": "..."
}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      storyDraft = JSON.parse(jsonMatch[0])
    }
  }

  return {
    audioBlob,
    audioUrl: URL.createObjectURL(audioBlob),
    duration: transcription.duration,
    transcription,
    storyDraft
  }
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
