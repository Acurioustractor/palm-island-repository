'use client'

import type { UIMessage } from 'ai'
import { Sparkles } from 'lucide-react'
import { ToolResultRenderer } from './ToolResultRenderer'
import ChatMarkdown from '@/components/chat/ChatMarkdown'

interface MessageRendererProps {
  message: UIMessage
  darkMode?: boolean
}

function getToolName(part: { type: string }): string | null {
  if (part.type.startsWith('tool-')) {
    return part.type.slice(5)
  }
  return null
}

export function MessageRenderer({ message, darkMode = false }: MessageRendererProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className={`
          max-w-[85%] rounded-2xl rounded-br-md px-5 py-3 text-[15px] leading-relaxed
          ${darkMode
            ? 'bg-white/[0.08] text-white/90 border border-white/[0.06]'
            : 'bg-gray-900 text-white'
          }
        `}>
          {message.parts.map((part, i) => (
            part.type === 'text' && part.text ? <span key={i}>{part.text}</span> : null
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1
        ${darkMode ? 'bg-picc-ochre/10' : 'bg-warm-100'}
      `}>
        <Sparkles className={`w-4 h-4 ${darkMode ? 'text-picc-ochre-400' : 'text-warm-700'}`} />
      </div>

      <div className="flex flex-col gap-4 flex-1 min-w-0">
        {message.parts.map((part, i) => {
          if (part.type === 'text' && part.text) {
            return (
              <div
                key={i}
                className={`
                  text-[15px] leading-relaxed max-w-none
                  ${darkMode
                    ? 'text-white/80 [&_h1]:text-white/90 [&_h2]:text-white/90 [&_h3]:text-white/90 [&_strong]:text-white/90 [&_a]:text-picc-ochre-300'
                    : ''
                  }
                `}
              >
                <ChatMarkdown content={part.text} />
              </div>
            )
          }

          const toolName = getToolName(part)
          if (toolName) {
            const toolPart = part as { state?: string; output?: unknown; input?: unknown }

            if (toolPart.state === 'output-available' && toolPart.output !== undefined) {
              return (
                <div key={i} className="w-full animate-slide-up">
                  <ToolResultRenderer
                    toolName={toolName}
                    result={toolPart.output}
                    darkMode={darkMode}
                  />
                </div>
              )
            }

            if (toolPart.state === 'input-available' || toolPart.state === 'input-streaming') {
              return (
                <div key={i} className={`flex items-center gap-2 text-sm py-2 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 border-2 rounded-full animate-spin ${darkMode ? 'border-white/10 border-t-picc-ochre-400' : 'border-gray-300 border-t-gray-600'}`} />
                  <span>{getSearchingLabel(toolName)}</span>
                </div>
              )
            }
          }

          return null
        })}
      </div>
    </div>
  )
}

function getSearchingLabel(toolName: string): string {
  switch (toolName) {
    case 'searchStories': return 'Finding stories...'
    case 'getServiceInfo': return 'Looking up service data...'
    case 'exploreTimeline': return 'Exploring the timeline...'
    case 'findQuotes': return 'Finding community voices...'
    case 'getPhotoGallery': return 'Gathering photos...'
    case 'exploreKnowledgeGraph': return 'Mapping connections...'
    case 'submitCommunityVision': return 'Recording your vision...'
    default: return 'Searching...'
  }
}

