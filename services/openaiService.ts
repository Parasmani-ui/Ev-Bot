import { Config } from '../config/config';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const PRIMARY_MODEL = 'gpt-4.1-nano';

export type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export const extractText = (resp: any): string => {
  if (!resp) return '';
  if (resp.output_text) return resp.output_text;
  if (resp.output?.[0]?.content?.[0]?.text) return resp.output[0].content[0].text;
  if (resp.choices?.[0]?.message?.content) return resp.choices[0].message.content;
  return '';
};

const callOpenAI = async (model: string, messages: OpenAIMessage[], maxTokens: number) => {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Config.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  return response.json();
};

export const runAI = async (
  messages: OpenAIMessage[],
  maxTokens: number = 1500
): Promise<string> => {
  if (!Config.OPENAI_API_KEY) {
    throw new Error(
      'Missing OpenAI API key. Set VITE_OPENAI_API_KEY in .env.local and restart the dev server.'
    );
  }

  const response = await callOpenAI(PRIMARY_MODEL, messages, maxTokens);
  return extractText(response);
};

