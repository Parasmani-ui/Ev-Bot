import React, { useState, useEffect } from 'react';
import { AppView, ChatSession } from '../types';
import { firestoreService } from '../services/firestoreService';
import { authService } from '../services/authService';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

const Icons = {
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  Chat: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.074-.85l.384-1.973A10.05 10.05 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  Landing: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
};

const SidebarWithHistory: React.FC<SidebarProps> = ({ 
  currentView, 
  onNavigate, 
  currentSessionId, 
  onSelectSession, 
  onNewChat 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentView === AppView.CHATBOT) {
      loadSessions();
    }
  }, [currentView, currentSessionId]);

  // Reload sessions periodically when on chatbot page
  useEffect(() => {
    if (currentView === AppView.CHATBOT) {
      const interval = setInterval(() => {
        loadSessions();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentView]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const userId = authService.getUserId();
      const userSessions = await firestoreService.getUserSessions(userId);
      // Filter out empty sessions (with 0 messages)
      const nonEmptySessions = userSessions.filter(session => session.messageCount > 0);
      setSessions(nonEmptySessions as ChatSession[]);
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
    return date.toLocaleDateString();
  };

  const navItems = [
    { id: AppView.LANDING, label: 'Landing', Icon: Icons.Landing },
    { id: AppView.HOME, label: 'Home', Icon: Icons.Home },
    { id: AppView.CHATBOT, label: 'Policy Bot', Icon: Icons.Chat },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 p-2 bg-white rounded-md shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      <nav className={`
        fixed left-0 top-0 h-full w-[250px] bg-white shadow-xl transition-transform duration-300 ease-in-out z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <header className="px-6 py-10 flex items-center gap-4">
            <img src="/Jharkhand_Rajakiya_Chihna.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="font-bold text-lg text-slate-800 leading-tight">Jharkhand Govt</h1>
              <p className="text-xs text-slate-500">e-Governance Portal</p>
            </div>
          </header>

          <div className="w-8 h-0.5 bg-black mx-6 mb-4"></div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-2 px-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center gap-4 p-4 rounded-lg transition-all duration-200
                  ${currentView === item.id 
                    ? 'bg-slate-100 text-black font-semibold' 
                    : 'hover:bg-slate-50 text-slate-600'}
                `}
              >
                <item.Icon />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Chat History Section - Only show when on chatbot page */}
          {currentView === AppView.CHATBOT && (
            <div className="flex-1 overflow-hidden flex flex-col mt-2">
              <div className="flex-1 overflow-y-auto px-4 space-y-1">
                {loading ? (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    Loading...
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    No conversations yet
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        onSelectSession(session.id);
                        setIsOpen(false);
                      }}
                      className={`
                        group relative p-3 rounded-lg cursor-pointer transition-all text-left
                        ${session.id === currentSessionId 
                          ? 'bg-slate-100 border border-slate-200' 
                          : 'hover:bg-slate-50 border border-transparent'}
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400 flex-shrink-0">
                              <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                            </svg>
                            <h4 className="text-sm font-medium text-slate-800 truncate">
                              {session.title || 'New Conversation'}
                            </h4>
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatDate(session.lastActivityAt)}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all flex-shrink-0"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-red-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="mt-auto p-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">© 2026 Jharkhand Govt</p>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
        />
      )}
    </>
  );
};

export default SidebarWithHistory;
