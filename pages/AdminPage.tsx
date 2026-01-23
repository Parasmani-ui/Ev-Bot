
import React, { useState, useEffect } from 'react';
import { AdminSession, UserQueryRecord } from '../types';
import { dbService } from '../services/dbService';

interface AdminPageProps {
  session: AdminSession;
}

const AdminPage: React.FC<AdminPageProps> = ({ session }) => {
  const [queries, setQueries] = useState<UserQueryRecord[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (session.isLoggedIn) {
      setQueries(dbService.getAllQueries().reverse()); // Newest first
    }
  }, [session.isLoggedIn]);

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
    q.sessionId.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-80px)]" style={{backgroundImage: `linear-gradient(135deg, rgba(241, 245, 250, 0.95) 0%, rgba(240, 253, 250, 0.95) 100%), url('/jh img.png')`, backgroundSize: 'cover', backgroundAttachment: 'fixed'}}>
      <div className="p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <img src="/Jharkhand_Rajakiya_Chihna.png" alt="Jharkhand Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">User Query Dashboard</h1>
                <p className="text-slate-500">Monitor all interaction data from the Policy Bot.</p>
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
              onClick={() => setQueries([...dbService.getAllQueries().reverse()])}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
              title="Refresh data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7l3.181 3.182m-4.722-9.941l-3.181-3.182a8.25 8.25 0 00-13.803 3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
        </header>

        <div className="bg-white/98 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Session ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Query</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bot Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueries.length > 0 ? filteredQueries.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(record.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">
                        {record.sessionId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-xs truncate">
                      {record.query}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                      <p className="line-clamp-2">{record.response}</p>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                      No queries found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gradient-to-r from-slate-50 to-emerald-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Showing {filteredQueries.length} of {queries.length} total interactions</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-slate-200 bg-white rounded text-xs font-bold hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50">Prev</button>
              <button className="px-3 py-1 border border-slate-200 bg-white rounded text-xs font-bold hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
            <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Total Queries</h4>
            <div className="text-3xl font-bold text-emerald-700">{queries.length}</div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
            <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Unique Sessions</h4>
            <div className="text-3xl font-bold text-emerald-700">{new Set(queries.map(q => q.sessionId)).size}</div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
            <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Avg. Response Length</h4>
            <div className="text-3xl font-bold text-emerald-700">
              {queries.length > 0 ? Math.round(queries.reduce((acc, q) => acc + q.response.length, 0) / queries.length) : 0} chars
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
