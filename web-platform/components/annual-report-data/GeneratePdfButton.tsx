'use client';

import { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface GeneratePdfButtonProps {
  reportId: string | null;
  readinessPercent?: number;
  variant?: 'primary' | 'compact';
}

type PdfState = 'idle' | 'generating' | 'ready' | 'error';

export default function GeneratePdfButton({
  reportId,
  readinessPercent = 0,
  variant = 'primary',
}: GeneratePdfButtonProps) {
  const [state, setState] = useState<PdfState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async () => {
    if (!reportId) return;

    const showWarning = readinessPercent < 80;
    if (showWarning && !window.confirm(
      `Report readiness is only ${readinessPercent}%. The PDF may have incomplete data. Generate anyway?`
    )) {
      return;
    }

    setState('generating');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/annual-reports/${reportId}/export-pdf`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'PDF generation failed' }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PICC-Annual-Report-${new Date().getFullYear()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setState('ready');
      setTimeout(() => setState('idle'), 4000);
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setTimeout(() => setState('idle'), 6000);
    }
  };

  const disabled = !reportId || state === 'generating';
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <button
        onClick={handleGenerate}
        disabled={disabled}
        title={!reportId ? 'No report selected' : state === 'generating' ? 'Generating...' : 'Generate PDF'}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
          state === 'ready'
            ? 'bg-sage-100 text-sage-700'
            : state === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-warm-100 text-picc-ochre hover:bg-warm-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {state === 'generating' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : state === 'ready' ? (
          <CheckCircle className="w-4 h-4" />
        ) : state === 'error' ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {state === 'generating' ? 'Generating...' : state === 'ready' ? 'Downloaded' : 'PDF'}
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all ${
          state === 'ready'
            ? 'bg-sage-600 text-white'
            : state === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-gradient-to-r from-picc-ochre to-picc-ochre-600 hover:from-picc-ochre-600 hover:to-picc-ochre-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {state === 'generating' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating PDF ~30s
          </>
        ) : state === 'ready' ? (
          <>
            <CheckCircle className="w-4 h-4" />
            PDF Downloaded
          </>
        ) : state === 'error' ? (
          <>
            <AlertCircle className="w-4 h-4" />
            Failed — Retry
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Generate PDF
          </>
        )}
      </button>
      {state === 'error' && errorMsg && (
        <p className="mt-1 text-xs text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
