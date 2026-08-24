import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Search, LogOut, Download, RefreshCw, QrCode, MessageCircle, MapPin, Users, Utensils, Bell } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Registration } from '../types';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) fetchRegistrations(u);
    });
    return unsub;
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    // Demo Mode Bypass
    if (email === 'admin@demo.com' && password === 'admin123') {
      const demoUser = { uid: 'demo-user', email: 'admin@demo.com', getIdToken: async () => 'demo-token' } as any;
      setUser(demoUser);
      setLoading(false);
      fetchRegistrations(demoUser);
      return;
    }

    try {
      if (isRegistering) {
        import('firebase/auth').then(({ createUserWithEmailAndPassword }) => {
          return createUserWithEmailAndPassword(auth, email, password);
        }).catch(err => {
          setAuthError(err.message || 'Registration failed');
          setLoading(false);
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const fetchRegistrations = async (currentUser = user) => {
    if (!currentUser) return;
    setFetching(true);

    if (currentUser.uid === 'demo-user') {
      // Provide dummy data for demo mode
      setRegistrations([
        { id: '1', unique_code: 'NGM2026-0001', name: 'John Doe', phone: '9876543210', email: 'john@example.com', church_city: 'Hyderabad', category: 'Family', days_attending: ['16', '17'], family_size: 4, dietary_pref: 'Non-Veg', checked_in: false, whatsapp_sent: true, created_at: new Date().toISOString() },
        { id: '2', unique_code: 'NGM2026-0002', name: 'Jane Smith', phone: '9876543211', email: 'jane@example.com', church_city: 'Secunderabad', category: 'Single', days_attending: ['18', '19', '20'], family_size: 1, dietary_pref: 'Veg', checked_in: true, whatsapp_sent: true, created_at: new Date().toISOString() },
      ]);
      setFetching(false);
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/registrations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.registrations) setRegistrations(data.registrations);
    } catch (e) {
      console.error(e);
    }
    setFetching(false);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(registrations.map(r => ({
      Code: r.unique_code,
      Name: r.name,
      Phone: r.phone,
      Email: r.email,
      Church_City: r.church_city,
      Category: r.category,
      Days: r.days_attending.join(', '),
      FamilySize: r.family_size,
      Food: r.dietary_pref,
      CheckedIn: r.checked_in ? 'Yes' : 'No',
      WhatsAppSent: r.whatsapp_sent ? 'Yes' : 'No'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, "KAS2026_Registrations.xlsx");
  };

  const sendWhatsAppManual = (reg: Registration, type: 'welcome' | 'reminder') => {
    let phone = reg.phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    let message = '';
    if (type === 'welcome') {
      message = `Shalom ${reg.name} garu, 🙏\n\nYour registration for *Kutumba Ashirvada Sadassu 2026* is confirmed!\n\n*Your Code:* ${reg.unique_code}\n*Category:* ${reg.category}\n*Family Size:* ${reg.family_size}\n\nPlease save this code. You will need to show this at the entrance.\n\nGod Bless You!`;
    } else {
      message = `Shalom ${reg.name} garu, 🙏\n\nGentle reminder! *Kutumba Ashirvada Sadassu 2026* is approaching.\n\n*Your Code:* ${reg.unique_code}\n\nWe look forward to seeing you there!`;
    }
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-200">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <form onSubmit={handleAuth} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-amber-500/10" />
          
          <h2 className="text-2xl font-bold mb-6 text-center text-zinc-50 relative z-10">
            {isRegistering ? 'Admin Registration' : 'Admin Login'}
          </h2>
          
          {authError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 mb-4 rounded-xl text-sm relative z-10">{authError}</div>}
          
          <div className="space-y-4 relative z-10">
            <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin Email (Demo: admin@demo.com)" className="w-full p-3 border border-zinc-800 rounded-xl text-zinc-200 bg-zinc-950 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors" />
            <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (Demo: admin123)" className="w-full p-3 border border-zinc-800 rounded-xl text-zinc-200 bg-zinc-950 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors" />
            <button type="submit" className="w-full bg-amber-500 text-zinc-950 font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
              {isRegistering ? 'Register' : 'Login'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)} 
              className="w-full text-zinc-400 text-sm hover:text-amber-500 transition-colors mt-2 text-center"
            >
              {isRegistering ? 'Back to Login' : 'Create Admin Account (Dev Testing)'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const filtered = registrations.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.unique_code?.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-50 mb-1">Dashboard</h1>
            <p className="text-zinc-400 text-sm">Total Registrations: <span className="text-amber-500 font-semibold">{registrations.length}</span></p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button onClick={() => navigate('/admin/checkin')} className="flex-1 md:flex-none flex justify-center items-center px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl hover:bg-amber-500 hover:text-zinc-950 transition-all">
              <QrCode className="w-4 h-4 mr-2" /> Scanner
            </button>
            <button onClick={exportExcel} className="flex-1 md:flex-none flex justify-center items-center px-4 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-all">
              <Download className="w-4 h-4 mr-2" /> Export
            </button>
            <button onClick={() => { if (user?.uid === 'demo-user') { setUser(null); } else { signOut(auth); } }} className="flex-1 md:flex-none flex justify-center items-center px-4 py-2 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
          <div className="mt-0.5">
            <span className="flex w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          </div>
          <p className="text-sm text-amber-500/90 leading-relaxed">
            <strong className="text-amber-500">Important:</strong> Each registered attendee is assigned a unique <code className="bg-amber-500/10 px-1 rounded">NGM2026-XXXX</code> code. This code must be presented at the venue for <strong>entry validation and food token allocation</strong>. Use the QR Scanner to quickly verify these codes at the gate.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
            <div className="relative w-full max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search name, code, or phone..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-800 rounded-xl bg-zinc-900 text-zinc-200 focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all"
              />
            </div>
            <button onClick={() => fetchRegistrations()} className="ml-4 p-2 text-zinc-500 hover:text-amber-500 transition-colors">
              <RefreshCw className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Code</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Name</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Contact</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Details</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                  <th className="p-4 font-semibold text-right uppercase tracking-wider text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-4 font-mono font-bold text-amber-500">{r.unique_code}</td>
                    <td className="p-4">
                      <div className="font-semibold text-zinc-200">{r.name}</div>
                      <div className="text-zinc-500 text-xs flex items-center mt-1"><MapPin className="w-3 h-3 mr-1" /> {r.church_city}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-300">{r.phone}</div>
                      <div className="text-zinc-500 text-xs">{r.email || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 mb-1">
                        <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded text-xs">{r.category}</span>
                        <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded text-xs flex items-center"><Utensils className="w-3 h-3 mr-1" />{r.dietary_pref}</span>
                      </div>
                      <div className="text-zinc-500 text-xs flex items-center mt-1"><Users className="w-3 h-3 mr-1" /> Size: {r.family_size}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${r.checked_in ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`}></span>
                        <span className={r.checked_in ? 'text-emerald-400' : 'text-zinc-500'}>{r.checked_in ? 'Checked In' : 'Pending'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button onClick={() => sendWhatsAppManual(r, 'welcome')} className="text-zinc-500 hover:text-emerald-500 p-2 rounded-lg hover:bg-emerald-500/10 transition-colors" title="Send Welcome Msg">
                           <MessageCircle className="w-5 h-5" />
                         </button>
                         <button onClick={() => sendWhatsAppManual(r, 'reminder')} className="text-zinc-500 hover:text-amber-500 p-2 rounded-lg hover:bg-amber-500/10 transition-colors" title="Send Reminder Msg">
                           <Bell className="w-5 h-5" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-zinc-500">No registrations found matching your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-zinc-800">
            {filtered.map(r => (
              <div key={r.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono font-bold text-amber-500 text-lg mb-1">{r.unique_code}</div>
                    <div className="font-semibold text-zinc-200 text-lg">{r.name}</div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-800">
                    <span className={`w-1.5 h-1.5 rounded-full ${r.checked_in ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`}></span>
                    <span className={`text-xs ${r.checked_in ? 'text-emerald-400' : 'text-zinc-500'}`}>{r.checked_in ? 'Checked In' : 'Pending'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-zinc-400">{r.phone}</div>
                  <div className="text-zinc-400 flex items-center justify-end"><MapPin className="w-3 h-3 mr-1" /> {r.church_city}</div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/50">
                  <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded text-xs">{r.category}</span>
                  <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded text-xs flex items-center"><Users className="w-3 h-3 mr-1" /> {r.family_size}</span>
                  <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded text-xs flex items-center"><Utensils className="w-3 h-3 mr-1" /> {r.dietary_pref}</span>
                  
                  <div className="ml-auto flex items-center gap-2">
                    <button onClick={() => sendWhatsAppManual(r, 'welcome')} className="text-emerald-500 hover:text-emerald-400 p-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/10 transition-colors flex items-center gap-1.5 text-xs font-medium">
                      <MessageCircle className="w-3.5 h-3.5" /> Welcome
                    </button>
                    <button onClick={() => sendWhatsAppManual(r, 'reminder')} className="text-amber-500 hover:text-amber-400 p-1.5 rounded-lg border border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 transition-colors flex items-center gap-1.5 text-xs font-medium">
                      <Bell className="w-3.5 h-3.5" /> Reminder
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-12 text-center text-zinc-500">No registrations found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

