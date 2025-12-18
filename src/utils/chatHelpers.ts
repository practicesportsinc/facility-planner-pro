/**
 * Chat streaming utilities for AI facility chat
 */

export interface QuickReplyButton {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  quickReplies?: QuickReplyButton[];
  showInlineLeadForm?: boolean;  // Show inline contact form in chat
  reportContent?: string;         // Store report text for emailing
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface FacilityParameters {
  sports: string[];
  facilitySize: 'small' | 'medium' | 'large' | 'giant' | 'arena';
  location: 'low' | 'average' | 'high' | 'premium';
  buildMode?: 'build' | 'buy' | 'lease';
  budget?: number;
}

/**
 * Stream chat messages from the facility-chat edge function
 */
export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMessage[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}) {
  try {
    const CHAT_URL = `https://apdxtdarwacdcuhvtaag.supabase.co/functions/v1/facility-chat`;

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZHh0ZGFyd2FjZGN1aHZ0YWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDI1NjksImV4cCI6MjA3MDc3ODU2OX0.flGfUtz-B-RXJdPX4fnbUil8I23khgtyK29h3AnF0n0`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${resp.status}`);
    }

    if (!resp.body) {
      throw new Error('No response body');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta;

          // Handle text content
          if (delta?.content) {
            onDelta(delta.content);
          }

        } catch (e) {
          // Incomplete JSON, re-buffer
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    onDone();

  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown streaming error'));
  }
}

/**
 * Save chat history to localStorage
 */
export function saveChatHistory(messages: ChatMessage[]) {
  try {
    localStorage.setItem('facility_chat_history', JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
}

/**
 * Load chat history from localStorage
 */
export function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem('facility_chat_history');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load chat history:', e);
  }
  return [];
}

/**
 * Clear chat history
 */
export function clearChatHistory() {
  try {
    localStorage.removeItem('facility_chat_history');
  } catch (e) {
    console.error('Failed to clear chat history:', e);
  }
}
