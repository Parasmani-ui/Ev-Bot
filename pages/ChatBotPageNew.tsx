import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getAIResponse } from '../services/aiService';
import { firestoreService } from '../services/firestoreService';
import { authService } from '../services/authService';

interface ChatBotPageProps {
  currentSessionId: string | null;
  onSessionChange: (sessionId: string) => void;
  onNewChat: () => void;
  onLoadSession: (sessionId: string) => void;
}

const ChatBotPage: React.FC<ChatBotPageProps> = ({
  currentSessionId,
  onSessionChange,
  onNewChat: onNewChatProp,
  onLoadSession
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize user
  useEffect(() => {
    const uid = authService.getUserId();
    setUserId(uid);
  }, []);

  // Load session when it changes
  useEffect(() => {
    if (currentSessionId && onLoadSession) {
      loadSession(currentSessionId);
    }
  }, [currentSessionId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadSession = async (sessionId: string) => {
    setIsLoadingHistory(true);
    try {
      const queries = await firestoreService.getSessionQueries(sessionId);
      
      // Convert to ChatMessage format
      const loadedMessages: ChatMessage[] = [];
      queries.forEach(q => {
        loadedMessages.push({
          id: `${q.id}-user`,
          role: 'user',
          text: q.query,
          timestamp: q.timestamp
        });
        loadedMessages.push({
          id: `${q.id}-model`,
          role: 'model',
          text: q.response,
          timestamp: q.timestamp + 1
        });
      });
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Create session if it doesn't exist (first message)
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await firestoreService.getOrCreateSession(userId);
        onSessionChange(sessionId);
      }

      // Get AI response
      const responseText = await getAIResponse(input, sessionId);

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMsg]);

      // Save to Firestore
      await firestoreService.saveQuery(
        sessionId,
        userId,
        userMsg.text,
        modelMsg.text
      );
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 relative">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Loading Overlay */}
        {isLoadingHistory && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading conversation...</p>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-4 lg:p-8 space-y-6 scrollbar-hide"
        >
          {messages.length === 0 && !isLoadingHistory && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-slate-800">How can I help you today?</h3>
              <p className="text-slate-500">Ask me anything about the Jharkhand Electric Vehicle Policy 2022, including incentives, road tax exemptions, and charging infrastructure.</p>
              <div className="flex flex-wrap justify-center gap-2 pt-4">
                {['What is the road tax exemption?', 'Benefits for MSMEs?', 'Charging infrastructure goal'].map(q => (
                  <button 
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-slate-50 hover:border-black transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div className={`
                max-w-[85%] lg:max-w-[70%] p-5 rounded-2xl shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-black text-white rounded-br-none' 
                  : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'}
              `}>
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/Jharkhand_Rajakiya_Chihna.png" alt="Bot" className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">Jharkhand Policy Bot</span>
                  </div>
                )}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>
                <div className={`text-[10px] mt-2 opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-4">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question about Jharkhand policies..."
              className="flex-grow p-4 lg:p-5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all"
              disabled={isTyping}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-black text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 rotate-90">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-3">
            Assistant is trained specifically on Jharkhand Policy documents. Response may take a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;
