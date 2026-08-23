import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function CheckIn() {
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState<{ status: 'success' | 'error', message: string, data?: any } | null>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate('/admin');
      else setUser(u);
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    
    let scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: {width: 250, height: 250}, rememberLastUsedCamera: true },
      /* verbose= */ false
    );

    scanner.render(async (decodedText) => {
      // Pause scanning after successful read to prevent rapid-fire requests
      scanner.pause(true);
      await handleScan(decodedText, scanner);
    }, (error) => {
      // ignore
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [user]);

  const handleScan = async (code: string, scanner: any) => {
    if (processing) return;
    setProcessing(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ unique_code: code })
      });
      const data = await res.json();
      
      if (data.success) {
        setResult({ status: 'success', message: data.message, data: data.doc });
      } else {
        setResult({ status: 'error', message: data.error || 'Check-in failed' });
      }
    } catch (e) {
      setResult({ status: 'error', message: 'Network error' });
    }
    setProcessing(false);
    
    // Resume scanner after 3 seconds
    setTimeout(() => {
      setResult(null);
      scanner.resume();
    }, 3000);
  };

  if (!user) return <div className="p-8">Authenticating...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/admin')} className="flex items-center text-zinc-400 hover:text-amber-500 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center text-zinc-50">Event Scanner</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl mb-6">
          {/* We must keep #reader styled in a way that html5-qrcode can inject video */}
          <div id="reader" className="w-full [&_video]:rounded-xl [&_#reader__scan_region]:bg-zinc-900"></div>
        </div>

        {result && (
          <div className={`p-6 rounded-2xl flex flex-col items-center text-center animate-in fade-in zoom-in border ${result.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {result.status === 'success' ? <CheckCircle className="w-12 h-12 mb-2 text-emerald-500" /> : <XCircle className="w-12 h-12 mb-2 text-red-500" />}
            <h3 className="text-xl font-bold mb-1 text-zinc-50">{result.message}</h3>
            {result.data && (
              <div className="text-sm mt-2 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 w-full">
                <p className="font-bold text-lg text-amber-500 mb-1">{result.data.name}</p>
                <p className="text-zinc-300 font-mono text-base">{result.data.unique_code}</p>
                <div className="flex justify-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-zinc-800 rounded text-xs">Size: {result.data.family_size}</span>
                  <span className="px-2 py-1 bg-zinc-800 rounded text-xs">{result.data.category}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
