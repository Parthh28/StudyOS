'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send,
  Loader2,
  Sparkles,
  Trash2,
  Bot,
  User,
  Zap,
  ArrowRight,
  MessageSquare,
  BookOpen,
  Target,
  Brain,
  Clock,
} from 'lucide-react'
import { getChatHistory, clearChatHistory, type ChatMessage } from '@/lib/actions/chat'
import { getSubscriptionStatus } from '@/lib/actions/pro'
import { toast } from 'sonner'
import Link from 'next/link'

type UIMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

const SUGGESTED_PROMPTS = [
  {
    icon: Target,
    title: 'Study Plan',
    prompt: 'Create a 7-day study plan based on my weakest subjects and upcoming exams',
  },
  {
    icon: Brain,
    title: 'What to Study Next',
    prompt: 'Based on my progress and exams, which topic should I study next and why?',
  },
  {
    icon: BookOpen,
    title: 'Weekly Review',
    prompt: 'How am I doing this week? Am I on track with my weekly study goal?',
  },
  {
    icon: Clock,
    title: 'Exam Strategy',
    prompt: 'Help me create an efficient revision strategy for my upcoming exams',
  },
]

export default function AIChatPage() {
  const [tier, setTier] = useState<'free' | 'pro'>('free')
  const [isLoadingTier, setIsLoadingTier] = useState(true)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load subscription status and chat history
  useEffect(() => {
    async function init() {
      const [statusRes, historyRes] = await Promise.all([
        getSubscriptionStatus(),
        getChatHistory(),
      ])

      if (statusRes.success) setTier(statusRes.tier)
      setIsLoadingTier(false)

      if (historyRes.success && historyRes.messages.length > 0) {
        setMessages(
          historyRes.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          }))
        )
      }
      setIsLoadingHistory(false)
    }
    init()
  }, [])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Send message
  const handleSend = async (overrideMessage?: string) => {
    const text = overrideMessage || input.trim()
    if (!text || isStreaming) return

    setInput('')

    // Add user message
    const userMsg: UIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    }
    const assistantMsg: UIMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    try {
      // Build history from existing messages (excluding the streaming placeholder)
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send message')
      }

      // Stream the response
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response stream')

      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: fullText, isStreaming: true }
              : m
          )
        )
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, isStreaming: false }
            : m
        )
      )
    } catch (err: any) {
      console.error('Chat error:', err)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: `Note: ${err.message || 'Something went wrong. Please try again.'}`,
                isStreaming: false,
              }
            : m
        )
      )
      toast.error(err.message || 'Failed to send message')
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }

  // Clear chat
  const handleClear = async () => {
    const res = await clearChatHistory()
    if (res.success) {
      setMessages([])
      toast.success('Chat history cleared')
    } else {
      toast.error('Failed to clear history')
    }
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 150) + 'px'
  }

  // Loading state
  if (isLoadingTier) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  // Pro gate
  if (tier !== 'pro') {
    return (
      <div className="flex-1 p-5 md:p-10 max-w-[700px] w-full mx-auto flex items-center justify-center">
        <div className="text-center space-y-6 p-10 rounded-3xl bg-card border border-border shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto glow-primary">
              <MessageSquare className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-extrabold text-foreground">
              AI Study Assistant
            </h2>
            <p className="text-text-muted max-w-md mx-auto leading-relaxed">
              Chat with your personal AI tutor that knows your subjects, tracks your progress, and creates study plans tailored specifically for you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-text-muted pt-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full">
                <Brain className="w-3.5 h-3.5 text-primary" /> Context-Aware
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full">
                <Target className="w-3.5 h-3.5 text-success" /> Study Plans
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full">
                <BookOpen className="w-3.5 h-3.5 text-warning" /> Concept Help
              </span>
            </div>
            <Link href="/settings">
              <button className="mt-4 px-8 py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm hover:opacity-95 transition-all glow-primary inline-flex items-center gap-2">
                <Zap className="w-5 h-5" /> Upgrade to StudyOS Pro
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] max-w-[900px] w-full mx-auto">
      {/* Header */}
      <div className="shrink-0 px-5 md:px-8 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground shadow-md glow-primary">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              StudyOS AI
              <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </h1>
            <p className="text-xs text-text-muted">
              Your personal study coach · Knows your subjects & progress
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="p-2.5 rounded-xl bg-surface hover:bg-danger/10 text-text-muted hover:text-danger transition-all border border-border hover:border-danger/20"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-6 custom-scrollbar">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          /* Empty state with suggested prompts */
          <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                How can I help you study today?
              </h2>
              <p className="text-sm text-text-muted max-w-md">
                I know your subjects, progress, and upcoming exams. Ask me anything about your studies!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((sp) => {
                const Icon = sp.icon
                return (
                  <button
                    key={sp.title}
                    onClick={() => handleSend(sp.prompt)}
                    className="group text-left p-4 rounded-2xl bg-card hover:bg-surface-2 border border-border hover:border-border/80 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {sp.title}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {sp.prompt}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Message list */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {msg.role === 'assistant' && (
                <div className="shrink-0 w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground shadow-md mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'gradient-primary text-primary-foreground rounded-br-md glow-primary font-medium'
                    : 'bg-card text-foreground border border-border rounded-bl-md shadow-lg'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <MarkdownContent content={msg.content} />
                    {msg.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-primary rounded-sm animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="shrink-0 w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-muted mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 px-5 md:px-8 py-4 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-end gap-3 max-w-[900px] mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your studies..."
              rows={1}
              disabled={isStreaming}
              className="w-full bg-card border border-border focus:border-primary rounded-2xl px-5 py-3.5 pr-4 text-sm text-foreground placeholder-text-muted focus:outline-none transition-all resize-none custom-scrollbar disabled:opacity-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
              style={{ maxHeight: '150px' }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 w-12 h-12 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center transition-all glow-primary disabled:opacity-30 disabled:shadow-none"
          >
            {isStreaming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-text-muted/50 mt-2">
          Press Enter to send · Shift+Enter for new line · AI responses may not always be accurate
        </p>
      </div>
    </div>
  )
}

/**
 * Simple markdown renderer for assistant messages.
 * Handles: bold, italic, headers, code blocks, inline code, lists, and links.
 */
function MarkdownContent({ content }: { content: string }) {
  if (!content) return null

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeBuffer: string[] = []
  let codeLanguage = ''

  lines.forEach((line, i) => {
    // Code block start/end
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-surface border border-border rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono shadow-inner"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        )
        codeBuffer = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
        codeLanguage = line.slice(3).trim()
      }
      return
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      return
    }

    // Headers (1 to 6 # symbols, with or without spaces)
    const headerMatch = line.match(/^(#{1,6})\s*(.*)/)
    if (headerMatch) {
      const headerText = headerMatch[2].trim() || line.replace(/^#{1,6}/, '').trim()
      const level = headerMatch[1].length
      if (level <= 2) {
        elements.push(
          <h2 key={i} className="text-base md:text-lg font-bold text-foreground mt-4 mb-2">
            {formatInline(headerText)}
          </h2>
        )
      } else {
        elements.push(
          <h3 key={i} className="text-sm md:text-base font-bold text-foreground mt-3 mb-1.5">
            {formatInline(headerText)}
          </h3>
        )
      }
      return
    }

    // Bullet points
    if (line.match(/^[\-\*]\s/)) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 my-0.5">
          <span className="text-primary mt-1.5 shrink-0">•</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      )
      return
    }

    // Numbered lists
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\./)?.[1]
      const text = line.replace(/^\d+\.\s/, '')
      elements.push(
        <div key={i} className="flex gap-2 ml-1 my-0.5">
          <span className="text-primary font-semibold shrink-0">{num}.</span>
          <span>{formatInline(text)}</span>
        </div>
      )
      return
    }

    // Empty line → spacing
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />)
      return
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="my-1">
        {formatInline(line)}
      </p>
    )
  })

  return <>{elements}</>
}

/**
 * Formats inline markdown: bold, italic, inline code, links.
 */
function formatInline(text: string): React.ReactNode {
  // Strip any stray inline # symbols if they appear
  let remaining = text.replace(/(^|\s)#{1,6}\s+/g, '$1').replace(/(^|\s)#{1,6}(?=[a-zA-Z0-9])/g, '$1')

  // If streaming left an unclosed ** at the very end, temporarily close it so it renders as bold letters
  if ((remaining.match(/\*\*/g) || []).length % 2 === 1) {
    remaining = remaining.replace(/\*\*([^*]*)$/, '**$1**')
  }
  // If streaming left an unclosed single * at the end, close it
  if ((remaining.match(/\*/g) || []).length % 2 === 1 && !remaining.includes('**')) {
    remaining = remaining.replace(/\*([^*]*)$/, '*$1*')
  }

  // Process bold, italic, inline code, and links
  const parts: React.ReactNode[] = []
  let key = 0

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/`([^`]+)`/)
    // Bold
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
    // Italic
    const italicMatch = remaining.match(/\*([^*]+)\*/)

    // Find earliest match
    const matches = [
      codeMatch && { type: 'code', match: codeMatch },
      boldMatch && { type: 'bold', match: boldMatch },
      italicMatch && { type: 'italic', match: italicMatch },
    ]
      .filter(Boolean)
      .sort((a, b) => (a!.match.index || 0) - (b!.match.index || 0))

    if (matches.length === 0) {
      parts.push(remaining)
      break
    }

    const first = matches[0]!
    const idx = first.match.index || 0

    // Text before match
    if (idx > 0) {
      parts.push(remaining.slice(0, idx))
    }

    if (first.type === 'code') {
      parts.push(
        <code
          key={key++}
          className="bg-primary/15 text-primary border border-primary/25 px-1.5 py-0.5 rounded text-xs font-mono"
        >
          {first.match[1]}
        </code>
      )
    } else if (first.type === 'bold') {
      parts.push(
        <strong key={key++} className="font-bold text-foreground">
          {first.match[1]}
        </strong>
      )
    } else if (first.type === 'italic') {
      parts.push(
        <em key={key++} className="italic">
          {first.match[1]}
        </em>
      )
    }

    remaining = remaining.slice(idx + first.match[0].length)
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>
}
