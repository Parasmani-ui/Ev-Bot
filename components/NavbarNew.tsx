import React, { useState } from 'react';
import { AdminSession } from '../types';
import { authService } from '../services/authService';

interface NavbarProps {
  onLogin: (username: string) => void;
  onLogout: () => void;
  adminSession: AdminSession;
}

const Navbar: React.FC<NavbarProps> = ({ onLogin, onLogout, adminSession }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.loginAdmin(email, password);
      onLogin(user.email || 'Admin');
      setShowLoginModal(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setError(error.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logoutAdmin();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-end sticky top-0 z-20">
      {adminSession.isLoggedIn ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span className="text-xs font-bold uppercase tracking-wider">Session Active: {adminSession.username}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="px-5 py-2 text-sm font-semibold border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all"
          >
            Log out
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setShowLoginModal(true)}
          className="px-6 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-slate-800 transition-all text-sm shadow-lg shadow-black/10"
        >
          Admin Portal
        </button>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 relative border border-slate-100">
            <button 
              onClick={() => {
                setShowLoginModal(false);
                setError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all p-2 rounded-lg"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Login</h2>
              <p className="text-slate-500 text-sm">Jharkhand Department of Industries</p>
              <p className="text-xs text-emerald-600 mt-2 font-semibold">🔥 Firebase Authentication</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="admin@jharkhand.gov.in"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="text-red-600 text-xs font-semibold flex items-center gap-1.5 bg-red-50 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              <p>Use your Firebase Admin account credentials</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
