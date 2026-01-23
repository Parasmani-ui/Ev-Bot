import React, { useState, useEffect } from 'react';
import { UserQueryRecord } from '../types';
import { firestoreService } from '../services/firestoreService';
import { authService } from '../services/authService';

interface AdminPageProps {
  session: { isLoggedIn: boolean; username: string };
}

interface SessionGroup {
  sessionId: string;
  queries: UserQueryRecord[];
  firstQuery: Date;
  lastQuery: Date;
}

const AdminPage: React.FC<AdminPageProps> = ({ session }) => {
  const [queries, setQueries] = useState<UserQueryRecord[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalQueries: 0,
    uniqueSessions: 0,
    avgLength: 0
  });

  useEffect(() => {
    if (session.isLoggedIn) {
      loadQueries();
    }
  }, [session.isLoggedIn]);

  const loadQueries = async () => {
    setLoading(true);
    try {
      const allQueries = await firestoreService.getAllQueries();
      setQueries(allQueries);
      
      // Calculate stats
      const uniqueSessions = new Set(allQueries.map(q => q.sessionId)).size;
      const avgLength = allQueries.length > 0 
        ? Math.round(allQueries.reduce((acc, q) => acc + q.response.length, 0) / allQueries.length)
        : 0;
      
      setStats({
        totalQueries: allQueries.length,
        uniqueSessions,
        avgLength
      });
    } catch (error) {
      console.error('Error loading queries:', error);
      alert('Failed to load queries from Firestore');
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  // Group queries by session
  const groupBySession = (queries: UserQueryRecord[]): SessionGroup[] => {
    const grouped = queries.reduce((acc, query) => {
      if (!acc[query.sessionId]) {
        acc[query.sessionId] = [];
      }
      acc[query.sessionId].push(query);
      return acc;
    }, {} as Record<string, UserQueryRecord[]>);

    return Object.entries(grouped).map(([sessionId, queries]) => {
      const timestamps = queries.map(q => new Date(q.timestamp));
      return {
        sessionId,
        queries: queries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
        firstQuery: new Date(Math.min(...timestamps.map(t => t.getTime()))),
        lastQuery: new Date(Math.max(...timestamps.map(t => t.getTime())))
      };
    }).sort((a, b) => b.lastQuery.getTime() - a.lastQuery.getTime());
  };

  if (!session.isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-slate-100 max-w-sm">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">You must be logged in as an administrator to view this page.</p>
        </div>
      </div>
    );
  }

  const filteredQueries = queries.filter(q => 
    q.query.toLowerCase().includes(filter.toLowerCase()) || 
    q.response.toLowerCase().includes(filter.toLowerCase()) ||
    q.sessionId.toLowerCase().includes(filter.toLowerCase())
  );

  const sessionGroups = groupBySession(filteredQueries);

  return (
    <div className="min-h-[calc(100vh-80px)]" style={{backgroundImage: `linear-gradient(135deg, rgba(241, 245, 250, 0.95) 0%, rgba(240, 253, 250, 0.95) 100%), url('/jh img.png')`, backgroundSize: 'cover', backgroundAttachment: 'fixed'}}>
      <div className="p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <img src="/Jharkhand_Rajakiya_Chihna.png" alt="Jharkhand Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">User Query Dashboard</h1>
                <p className="text-slate-500">Monitor all interaction data from the Policy Bot (Firestore).</p>
              </div>
            </div>
          
            <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search queries or sessions..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-700 w-full md:w-80"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-2.5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <button 
                onClick={loadQueries}
                disabled={loading}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                title="Refresh data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7l3.181 3.182m-4.722-9.941l-3.181-3.182a8.25 8.25 0 00-13.803 3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
          </header>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading queries from Firestore...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {sessionGroups.length > 0 ? sessionGroups.map((group) => {
                  const isExpanded = expandedSessions.has(group.sessionId);
                  return (
                    <div key={group.sessionId} className="bg-white/98 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                      {/* Session Header - Clickable */}
                      <button
                        onClick={() => toggleSession(group.sessionId)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              strokeWidth={2} 
                              stroke="currentColor" 
                              className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                              Session ID: {group.sessionId.substring(0, 16)}...
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                              </svg>
                              {group.queries.length} {group.queries.length === 1 ? 'Query' : 'Queries'}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                              </svg>
                              {group.lastQuery.toLocaleDateString()} {group.lastQuery.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-xs font-semibold text-emerald-600">
                          {isExpanded ? 'Click to collapse' : 'Click to expand'}
                        </div>
                      </button>

                      {/* Expanded Query Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-100">
                          {group.queries.map((query, idx) => (
                            <div key={query.id} className="border-b border-slate-100 last:border-b-0">
                              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                                    Q{idx + 1}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {new Date(query.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-sm font-semibold text-slate-900 mb-3">
                                  {query.query}
                                </div>
                              </div>
                              
                              <div className="px-6 py-4 bg-white">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded">
                                    BOT RESPONSE
                                  </span>
                                </div>
                                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {query.response}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="bg-white/98 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 px-6 py-20 text-center text-slate-400">
                    No queries found matching your criteria.
                  </div>
                )}

                <div className="bg-white/98 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 px-6 py-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Showing {sessionGroups.length} sessions with {filteredQueries.length} total queries
                  </span>
                  <span className="text-xs text-emerald-600 font-bold">🔥 Powered by Firestore</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
                  <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Total Queries</h4>
                  <div className="text-3xl font-bold text-emerald-700">{stats.totalQueries}</div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
                  <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Unique Sessions</h4>
                  <div className="text-3xl font-bold text-emerald-700">{stats.uniqueSessions}</div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
                  <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Avg. Response Length</h4>
                  <div className="text-3xl font-bold text-emerald-700">
                    {stats.avgLength} chars
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
