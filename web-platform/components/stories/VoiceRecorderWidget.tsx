'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Pause, Play, Upload, Loader2, Check, X, AlertCircle } from 'lucide-react';

interface TranscriptionResult {
  text: string;
  duration: number;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

interface VoiceRecorderWidgetProps {
  onComplete?: (result: {
    audioBlob: Blob;
    audioUrl: string;
    duration: number;
    transcription: TranscriptionResult;
    storyDraft?: {
      title: string;
      content: string;
      summary: string;
    };
  }) => void;
  onTranscriptionOnly?: (transcription: TranscriptionResult) => void;
  maxDuration?: number; // in seconds, default 30 minutes
}

export default function VoiceRecorderWidget({
  onComplete,
  onTranscriptionOnly,
  maxDuration = 30 * 60
}: VoiceRecorderWidgetProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    const supported = !!(
      typeof window !== 'undefined' &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
    setIsSupported(supported);
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      setHasPermission(false);
      setError('Microphone access denied. Please allow microphone access to record.');
      return false;
    }
  }, []);

  // Get supported MIME type
  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'audio/webm';
  };

  // Start recording
  const startRecording = async () => {
    setError(null);

    if (hasPermission === null) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;

      // Update duration
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          const elapsed = (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000;
          setDuration(elapsed);

          if (elapsed >= maxDuration) {
            stopRecording();
          }
        }
      }, 100);

      setIsRecording(true);
      setIsPaused(false);
      setAudioUrl(null);
      setAudioBlob(null);
      setTranscriptionResult(null);
    } catch (err) {
      setError('Failed to start recording. Please check your microphone.');
      console.error('Recording error:', err);
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      pauseStartRef.current = Date.now();
      setIsPaused(true);
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      pausedDurationRef.current += Date.now() - pauseStartRef.current;
      setIsPaused(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    return new Promise<{ blob: Blob; url: string }>((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve({ blob: new Blob(), url: '' });
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setIsPaused(false);

        resolve({ blob, url });
      };

      mediaRecorderRef.current.stop();
    });
  };

  // Cancel recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(track => track.stop());

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioUrl(null);
    setAudioBlob(null);
    setTranscriptionResult(null);
    chunksRef.current = [];
  };

  // Process and transcribe
  const processRecording = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create form data with audio
      const formData = new FormData();

      // Determine file extension from mime type
      let extension = 'webm';
      if (audioBlob.type.includes('mp4')) extension = 'mp4';
      else if (audioBlob.type.includes('ogg')) extension = 'ogg';

      formData.append('audio', audioBlob, `recording.${extension}`);
      formData.append('generateStory', 'true');

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const result = await response.json();

      setTranscriptionResult(result.transcription);

      if (onTranscriptionOnly) {
        onTranscriptionOnly(result.transcription);
      }

      if (onComplete && audioUrl) {
        onComplete({
          audioBlob,
          audioUrl,
          duration,
          transcription: result.transcription,
          storyDraft: result.storyDraft
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process recording');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="w-5 h-5" />
          <p>Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Recording controls */}
      <div className="flex flex-col items-center">
        {!isRecording && !audioUrl && (
          <>
            <button
              onClick={startRecording}
              className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"
              aria-label="Start recording"
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="mt-4 text-gray-600 text-center">
              Tap to start recording your story
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Max duration: {formatDuration(maxDuration)}
            </p>
          </>
        )}

        {isRecording && (
          <>
            {/* Recording indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-lg font-mono">{formatDuration(duration)}</span>
              {isPaused && <span className="text-sm text-gray-500">(paused)</span>}
            </div>

            {/* Waveform placeholder */}
            <div className="w-full h-16 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <div className="flex items-center gap-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-purple-500 rounded-full transition-all ${
                      isPaused ? 'h-2' : ''
                    }`}
                    style={{
                      height: isPaused ? '8px' : `${Math.random() * 24 + 8}px`,
                      animationDelay: `${i * 50}ms`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Recording controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={cancelRecording}
                className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                aria-label="Cancel"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
                  aria-label="Resume"
                >
                  <Play className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
                  aria-label="Pause"
                >
                  <Pause className="w-6 h-6" />
                </button>
              )}

              <button
                onClick={stopRecording}
                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                aria-label="Stop"
              >
                <Square className="w-6 h-6" />
              </button>
            </div>
          </>
        )}

        {audioUrl && !isRecording && (
          <>
            {/* Playback */}
            <audio controls src={audioUrl} className="w-full mb-4" />

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-600">
                Duration: {formatDuration(duration)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={cancelRecording}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Discard
              </button>

              <button
                onClick={startRecording}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Re-record
              </button>

              <button
                onClick={processRecording}
                disabled={isProcessing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Transcribe & Create Story
                  </>
                )}
              </button>
            </div>

            {/* Transcription result */}
            {transcriptionResult && (
              <div className="mt-6 w-full">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Transcription Complete!</span>
                  </div>
                  <p className="text-sm text-green-700 line-clamp-3">
                    {transcriptionResult.text}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tips */}
      {!isRecording && !audioUrl && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Recording Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>- Find a quiet place with minimal background noise</li>
            <li>- Speak clearly and at a natural pace</li>
            <li>- Hold your device close to capture your voice well</li>
            <li>- Take your time - you can pause and resume</li>
          </ul>
        </div>
      )}
    </div>
  );
}
