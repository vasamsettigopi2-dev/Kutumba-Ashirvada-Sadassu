import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function AdminLogin({ onAuth }: { onAuth: (user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Server returned error (${res.status})`);
      }
      
      if (res.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', data.email);
        onAuth({ email: data.email, getIdToken: async () => data.token });
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 font-sans selection:bg-black selection:text-white">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-8 text-center border-b border-zinc-100">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="font-bold text-lg tracking-wider">NG</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-1">
            Admin Portal
          </h2>
          <p className="text-zinc-500 text-[13px]">
            Sign in to manage your platform
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-zinc-50/50">
          {error && (
            <div className="bg-red-50 text-red-600 text-[13px] font-medium p-3 rounded-md border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-700">Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all text-zinc-900"
                placeholder="admin1"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all text-zinc-900"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 rounded-md text-[13px] transition-colors flex items-center justify-center disabled:opacity-70 mt-2 shadow-sm"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
