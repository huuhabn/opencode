import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple yet versatile markdown block parser
  const renderFormattedText = (text: string) => {
    // Process inline formatting: code, bold, italic
    const parts = []
    let lastIdx = 0
    // Regex for `inline code` and **bold**
    const inlineRegex = /(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g
    let match

    while ((match = inlineRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index))
      }
      if (match[2]) {
        // `code`
        parts.push(
          <code
            key={match.index}
            className='rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] text-primary'
          >
            {match[2]}
          </code>
        )
      } else if (match[4]) {
        // **bold**
        parts.push(
          <strong key={match.index} className='font-semibold text-foreground'>
            {match[4]}
          </strong>
        )
      } else if (match[6]) {
        // *italic*
        parts.push(
          <em key={match.index} className='italic'>
            {match[6]}
          </em>
        )
      }
      lastIdx = inlineRegex.lastIndex
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx))
    }

    return parts
  }

  // Split content by code fences ```
  const blocks = []
  const fenceRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g
  let lastIndex = 0
  let fenceMatch

  while ((fenceMatch = fenceRegex.exec(content)) !== null) {
    if (fenceMatch.index > lastIndex) {
      blocks.push({
        type: 'text' as const,
        value: content.substring(lastIndex, fenceMatch.index),
      })
    }
    blocks.push({
      type: 'code' as const,
      lang: fenceMatch[1] || 'plaintext',
      value: fenceMatch[2],
    })
    lastIndex = fenceRegex.lastIndex
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: 'text' as const,
      value: content.substring(lastIndex),
    })
  }

  return (
    <div className='space-y-2 text-sm leading-relaxed break-words'>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <CodeBlock key={idx} lang={block.lang} code={block.value.trimEnd()} />
          )
        }

        // Render text lines, headings, lists
        const lines = block.value.split('\n')
        return (
          <div key={idx} className='space-y-1.5'>
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim()
              if (!trimmed) return <div key={lineIdx} className='h-2' />

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lineIdx} className='text-sm font-bold tracking-tight mt-3 text-foreground'>
                    {renderFormattedText(trimmed.replace('### ', ''))}
                  </h4>
                )
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lineIdx} className='text-base font-bold tracking-tight mt-3 text-foreground'>
                    {renderFormattedText(trimmed.replace('## ', ''))}
                  </h3>
                )
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lineIdx} className='text-lg font-bold tracking-tight mt-4 text-foreground'>
                    {renderFormattedText(trimmed.replace('# ', ''))}
                  </h2>
                )
              }

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lineIdx} className='flex items-start gap-2 pl-2'>
                    <span className='text-primary font-bold text-xs mt-1'>•</span>
                    <span className='flex-1'>{renderFormattedText(trimmed.substring(2))}</span>
                  </div>
                )
              }

              // Numbered list
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
              if (numMatch) {
                return (
                  <div key={lineIdx} className='flex items-start gap-2 pl-2'>
                    <span className='text-muted-foreground font-mono text-xs mt-0.5'>
                      {numMatch[1]}.
                    </span>
                    <span className='flex-1'>{renderFormattedText(numMatch[2])}</span>
                  </div>
                )
              }

              // Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <div
                    key={lineIdx}
                    className='border-l-2 border-primary/60 pl-3 py-1 my-1 text-muted-foreground italic bg-muted/20 rounded-r'
                  >
                    {renderFormattedText(trimmed.substring(2))}
                  </div>
                )
              }

              return <p key={lineIdx}>{renderFormattedText(line)}</p>
            })}
          </div>
        )
      })}
    </div>
  )
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='my-3 rounded-md border border-border/70 bg-zinc-950 text-zinc-100 overflow-hidden text-xs'>
      <div className='flex items-center justify-between border-b border-border/40 px-3 py-1.5 bg-zinc-900/90 text-zinc-400 font-mono text-[11px]'>
        <span>{lang}</span>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleCopy}
          className='h-6 px-1.5 text-[11px] gap-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
        >
          {copied ? (
            <>
              <Check className='h-3 w-3 text-emerald-400' />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className='h-3 w-3' />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      <pre className='p-3.5 overflow-x-auto font-mono text-xs leading-relaxed'>
        <code>{code}</code>
      </pre>
    </div>
  )
}
