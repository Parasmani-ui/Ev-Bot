import React, { useState, useEffect } from 'react';
import { ChatSession } from '../types';
import { firestoreService } from '../services/firestoreService';
import { authService } from '../services/authService';

interface ChatHistoryProps {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  currentSessionId, 
  onSelectSession, 
  onNewChat 
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [currentSessionId]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const userId = authService.getUserId();
      const userSessions = await firestoreService.getUserSessions(userId);
      setSessions(userSessions as ChatSession[]);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Delete this conversation?')) return;
    
    try {
      await firestoreService.deleteSession(sessionId);
      await loadSessions();
      
      // If deleted current session, create new chat
      if (sessionId === currentSessionId) {
        onNewChat();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete conversation');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-24 left-4 z-50 p-3 bg-white rounded-lg shadow-lg border border-slate-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-[80px] lg:left-[250px] h-[calc(100vh-80px)] w-[280px] 
        bg-slate-50 border-r border-slate-200 transition-transform duration-300 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-slate-800 transition-all font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Chat
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Loading history...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No chat history yet
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`
                    group relative p-3 rounded-lg cursor-pointer transition-all
                    ${session.id === currentSessionId 
                      ? 'bg-white shadow-sm border border-slate-200' 
                      : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-800 truncate mb-1">
                        {session.title || 'New Conversation'}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatDate(session.lastActivityAt)}</span>
                        {session.messageCount > 0 && (
                          <>
                            <span>•</span>
                            <span>{session.messageCount} messages</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                      title="Delete conversation"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="text-xs text-slate-400 text-center">
              {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 z-30 top-[80px]"
        />
      )}
    </>
  );
};

export default ChatHistory;
