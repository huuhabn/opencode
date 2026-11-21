import type { SessionInfo, SessionMessageAssistant, SessionMessageInfo } from '../api'

/** Session is executing when busy is newer than idle (or idle is missing). */
export function isSessionRecordBusy(session: SessionInfo | null | undefined) {
  if (!session?.time) return false
  const busyAt = session.time.busy
  if (busyAt == null) return false
  const idleAt = session.time.idle
  return idleAt == null || busyAt > idleAt
}

export function isAssistantFinished(message: SessionMessageAssistant) {
  if (message.error) return true
  if (message.finish) return true
  if (message.time?.completed != null) return true
  return false
}

/**
 * Busy from the message timeline first (idle / finished assistant), then the session record.
 * Never prefer a stale session.time.busy over a finished assistant — that keeps Stop/Working stuck.
 */
export function deriveSessionBusy(
  session: SessionInfo | null | undefined,
  messages: SessionMessageInfo[]
) {
  if (!messages.length) return isSessionRecordBusy(session)

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (message.type === 'idle') return false
    if (message.type === 'user') return true
    if (message.type === 'assistant') {
      return !isAssistantFinished(message as SessionMessageAssistant)
    }
  }

  return isSessionRecordBusy(session)
}

/** Assistant belonging to the latest user turn (after the last idle), if any. */
export function latestTurnAssistant(messages: SessionMessageInfo[]) {
  const lastIdleIdx = messages.findLastIndex((m) => m.type === 'idle')
  const turn = lastIdleIdx >= 0 ? messages.slice(lastIdleIdx + 1) : messages
  const lastUserIdx = turn.findLastIndex((m) => m.type === 'user')
  if (lastUserIdx < 0) return undefined
  return turn.slice(lastUserIdx + 1).find((m) => m.type === 'assistant') as
    | SessionMessageAssistant
    | undefined
}

function partText(part: unknown) {
  if (!part || typeof part !== 'object') return ''
  const record = part as { type?: string; text?: string; reasoning?: string }
  if (typeof record.text === 'string' && record.text.trim()) return record.text
  if (typeof record.reasoning === 'string' && record.reasoning.trim()) return record.reasoning
  return ''
}

function isReasoningPart(part: unknown) {
  if (!part || typeof part !== 'object') return false
  const record = part as { type?: string; reasoning?: string }
  return record.type === 'reasoning' || 'reasoning' in record
}

function isToolPart(part: unknown) {
  if (!part || typeof part !== 'object') return false
  const record = part as { type?: string; tool?: string; name?: string }
  return record.type === 'tool' || 'tool' in record || 'name' in record && !('text' in record)
}

function isTextPart(part: unknown) {
  if (!part || typeof part !== 'object') return false
  if (isReasoningPart(part) || isToolPart(part)) return false
  return Boolean(partText(part))
}

/** True when the assistant turn already has UI the user can see (replaces Working, like packages/app). */
export function assistantHasVisibleContent(message: SessionMessageAssistant | undefined) {
  if (!message) return false
  if (message.error) return true
  const content = message.content
  if (!Array.isArray(content) || content.length === 0) return false
  return content.some((part) => isTextPart(part) || (isReasoningPart(part) && partText(part)) || isToolPart(part))
}

/**
 * packages/app showWorking / StatusLane:
 * - only while the session is busy
 * - hide once this turn has text, tools, or live reasoning (reasoning stands in for Working)
 * - hide when the assistant is finished or errored
 */
export function shouldShowWorkingStatus(isBusy: boolean, messages: SessionMessageInfo[]) {
  if (!isBusy) return false

  const assistant = latestTurnAssistant(messages)
  if (!assistant) return true
  if (isAssistantFinished(assistant)) return false
  if (assistantHasVisibleContent(assistant)) return false

  return true
}
