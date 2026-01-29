
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserQueryRecord } from '../types';
import { getAIResponse } from '../services/aiService';
import { dbService } from '../services/dbService';

const ChatBotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate unique client ID for rate limiting
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(clientId);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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

    const responseText = await getAIResponse(input, sessionId);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);

    // Persist query in simulated DB
    const record: UserQueryRecord = {
      id: Date.now().toString(),
      sessionId: dbService.getSessionId(),
      query: userMsg.text,
      response: modelMsg.text,
      timestamp: Date.now()
    };
    dbService.saveQuery(record);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/Jharkhand_Rajakiya_Chihna.png" alt="Bot" className="w-10 h-10 rounded-full bg-slate-100 p-1" />
          <div>
            <h2 className="font-bold text-slate-800">Jharkhand Policy Assistant</h2>
            <p className="text-xs text-green-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          Knowledge base: EV Policy 2022
        </div>
      </div> */}

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-4 lg:p-8 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 && (
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
  );
};

export default ChatBotPage;
