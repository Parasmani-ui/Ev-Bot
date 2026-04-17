import { Config } from '../config/config';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export const extractText = (resp: any): string => {
  if (!resp) return '';
  return resp?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const callGemini = async (messages: OpenAIMessage[], maxTokens: number) => {
  // Gemini separates system instructions from conversation contents
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const body: any = {
    contents: conversationMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: maxTokens
    }
  };

  if (systemMessage) {
    body.systemInstruction = {
      parts: [{ text: systemMessage.content }]
    };
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${Config.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  return response.json();
};

export const runAI = async (
  messages: OpenAIMessage[],
  maxTokens: number = 1500
): Promise<string> => {
  if (!Config.GEMINI_API_KEY) {
    throw new Error(
      'Missing Gemini API key. Set GEMINI_API_KEY in .env.local and restart the dev server.'
    );
  }

  const response = await callGemini(messages, maxTokens);
  return extractText(response);
};
