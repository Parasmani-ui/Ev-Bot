
import React, { useState, useEffect } from 'react';
import { AppView, AdminSession } from './types';
import SidebarWithHistory from './components/SidebarWithHistory';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ChatBotPage from './pages/ChatBotPageNew';
import AdminPage from './pages/AdminPageNew';
import Navbar from './components/NavbarNew';
import { firestoreService } from './services/firestoreService';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [adminSession, setAdminSession] = useState<AdminSession>({ isLoggedIn: false, username: '' });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Handle Hash Navigation simulation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (Object.values(AppView).includes(hash as AppView)) {
        setCurrentView(hash as AppView);
      }
    };
    
    // Check initial hash on mount
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && Object.values(AppView).includes(initialHash as AppView)) {
      setCurrentView(initialHash as AppView);
    }
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: AppView) => {
    window.location.hash = view;
    setCurrentView(view);
  };

  const handleAdminLogin = (username: string) => {
    setAdminSession({ isLoggedIn: true, username });
    navigateTo(AppView.ADMIN);
  };

  const handleAdminLogout = () => {
    setAdminSession({ isLoggedIn: false, username: '' });
    navigateTo(AppView.LANDING);
  };

  const handleNewChat = async () => {
    try {
      const userId = authService.getUserId();
      const sessionId = await firestoreService.getOrCreateSession(userId);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleLoadSession = (sessionId: string) => {
    // This is handled by ChatBotPage
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <SidebarWithHistory 
        currentView={currentView} 
        onNavigate={navigateTo}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />
      
      <div className="flex-grow flex flex-col ml-0 lg:ml-[250px] transition-all duration-300">
        <Navbar 
          onLogin={handleAdminLogin} 
          onLogout={handleAdminLogout} 
          adminSession={adminSession}
        />
        
        <main className="flex-grow">
          {currentView === AppView.LANDING && (
            <LandingPage onTryNow={() => navigateTo(AppView.CHATBOT)} />
          )}
          {currentView === AppView.HOME && <HomePage />}
          {currentView === AppView.CHATBOT && (
            <ChatBotPage 
              currentSessionId={currentSessionId}
              onSessionChange={setCurrentSessionId}
              onNewChat={handleNewChat}
              onLoadSession={handleLoadSession}
            />
          )}
          {currentView === AppView.ADMIN && (
            <AdminPage session={adminSession} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
