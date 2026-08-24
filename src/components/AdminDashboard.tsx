import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Search, LogOut, Download, RefreshCw, QrCode, MessageCircle, MapPin, Users, Utensils, Bell, Play, CheckCircle2, XCircle, AlertCircle, ChevronRight, X, PauseCircle, CheckSquare, Square, SkipForward } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Registration, MessageStatus } from '../types';

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

  // Queue State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [queueMode, setQueueMode] = useState(false);
  const [queueItems, setQueueItems] = useState<Registration[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [messageType, setMessageType] = useState<'confirmation' | 'reminder_3' | 'reminder_2' | 'reminder_1'>('confirmation');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [actionSuccess, setActionSuccess] = useState<boolean>(false);

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
    if (email === 'admin@demo.com' && password === 'admin123') {
      const demoUser = { uid: 'demo-user', email: 'admin@demo.com', getIdToken: async () => 'demo-token' } as any;
      setUser(demoUser);
      setLoading(false);
      fetchRegistrations(demoUser);
      return;
    }
    try {
      if (isRegistering) {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        await createUserWithEmailAndPassword(auth, email, password);
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
      setRegistrations([
        { id: '1', unique_code: 'NGM2026-0001', name: 'John Doe', phone: '9876543210', email: 'john@example.com', church_city: 'Hyderabad', category: 'Adult', days_attending: ['16', '17'], family_size: 4, dietary_pref: 'Non-Veg', checked_in: false, created_at: new Date().toISOString(), whatsapp_status: { confirmation: { status: 'sent', admin_email: 'admin@demo.com' } } },
        { id: '2', unique_code: 'NGM2026-0002', name: 'Jane Smith', phone: '9876543211', email: 'jane@example.com', church_city: 'Secunderabad', category: 'Adult', days_attending: ['18', '19', '20'], family_size: 1, dietary_pref: 'Veg', checked_in: true, created_at: new Date().toISOString() },
        { id: '3', unique_code: 'NGM2026-0003', name: 'Ravi Kumar', phone: '9876543212', email: 'ravi@example.com', church_city: 'Warangal', category: 'Youth', days_attending: ['16', '17', '18'], family_size: 2, dietary_pref: 'Veg', checked_in: false, created_at: new Date().toISOString(), whatsapp_status: { confirmation: { status: 'failed', admin_email: 'admin@demo.com' } } },
      ]);
      setFetching(false);
      return;
    }
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/registrations', { headers: { 'Authorization': `Bearer ${token}` } });
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
      ConfirmationStatus: r.whatsapp_status?.confirmation?.status || 'pending',
      ConfirmationDate: r.whatsapp_status?.confirmation?.timestamp || '',
      ConfirmationBy: r.whatsapp_status?.confirmation?.admin_email || '',
      Reminder3Status: r.whatsapp_status?.reminder_3?.status || 'pending',
      Reminder2Status: r.whatsapp_status?.reminder_2?.status || 'pending',
      Reminder1Status: r.whatsapp_status?.reminder_1?.status || 'pending',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, "KAS2026_Registrations.xlsx");
  };

  const getStatus = (r: Registration) => r.whatsapp_status?.[messageType]?.status || 'pending';

  const filtered = registrations.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                          r.unique_code?.toLowerCase().includes(search.toLowerCase()) ||
                          r.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || getStatus(r) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id!)));
    }
  };

  const startQueue = () => {
    const items = registrations.filter(r => selectedIds.has(r.id!));
    setQueueItems(items);
    setQueueIndex(0);
    setQueueMode(true);
  };

  const updateStatus = async (id: string, status: 'sent' | 'failed') => {
    if (user?.uid !== 'demo-user') {
      try {
        const token = await user?.getIdToken();
        await fetch('/api/admin/update_whatsapp_status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id, messageType, status })
        });
      } catch(e) {
        console.error(e);
      }
    }
    
    setRegistrations(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          whatsapp_status: {
            ...r.whatsapp_status,
            [messageType]: { status, timestamp: new Date().toISOString(), admin_email: user?.email || 'admin' }
          }
        };
      }
      return r;
    }));
  };

  const handleQueueAction = async (status: 'sent' | 'failed' | 'skip') => {
    if (status !== 'skip') {
      const currentId = queueItems[queueIndex].id!;
      await updateStatus(currentId, status);
      setActionSuccess(true);
      setTimeout(() => {
        setActionSuccess(false);
        advanceQueue();
      }, 1000);
    } else {
      advanceQueue();
    }
  };

  const advanceQueue = () => {
    if (queueIndex < queueItems.length - 1) {
      setQueueIndex(q => q + 1);
    } else {
      setQueueMode(false);
      setSelectedIds(new Set());
    }
  };

  const getWhatsAppMessage = (reg: Registration) => {
    if (messageType === 'confirmation') {
      return `Shalom ${reg.name} garu, 🙏\n\nYour registration for *Kutumba Ashirvada Sadassu 2026* is confirmed!\n\n*Your Code:* ${reg.unique_code}\n*Category:* ${reg.category}\n*Family Size:* ${reg.family_size}\n\nPlease save this code. You will need to show this at the entrance.\n\nGod Bless You!`;
    }
    return `Shalom ${reg.name} garu, 🙏\n\nGentle reminder! *Kutumba Ashirvada Sadassu 2026* is approaching.\n\n*Your Code:* ${reg.unique_code}\n\nWe look forward to seeing you there!`;
  };

  const openWhatsApp = (reg: Registration) => {
    let phone = reg.phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    const message = getWhatsAppMessage(reg);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'sent') return <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Sent</span>;
    if (status === 'failed') return <span className="inline-flex items-center text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 text-xs"><XCircle className="w-3 h-3 mr-1" /> Failed</span>;
    return <span className="inline-flex items-center text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50 text-xs"><AlertCircle className="w-3 h-3 mr-1" /> Pending</span>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-200">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <form onSubmit={handleAuth} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-amber-500/10" />
          <h2 className="text-2xl font-bold mb-6 text-center text-zinc-50 relative z-10">{isRegistering ? 'Admin Registration' : 'Admin Login'}</h2>
          {authError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 mb-4 rounded-xl text-sm relative z-10">{authError}</div>}
          <div className="space-y-4 relative z-10">
            <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin Email (Demo: admin@demo.com)" className="w-full p-3 border border-zinc-800 rounded-xl text-zinc-200 bg-zinc-950 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors" />
            <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (Demo: admin123)" className="w-full p-3 border border-zinc-800 rounded-xl text-zinc-200 bg-zinc-950 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors" />
            <button type="submit" className="w-full bg-amber-500 text-zinc-950 font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">{isRegistering ? 'Register' : 'Login'}</button>
            <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="w-full text-zinc-400 text-sm hover:text-amber-500 transition-colors mt-2 text-center">{isRegistering ? 'Back to Login' : 'Create Admin Account (Dev Testing)'}</button>
          </div>
        </form>
      </div>
    );
  }

  // Queue Mode Full Screen UI
  if (queueMode) {
    const current = queueItems[queueIndex];
    return (
      <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col md:p-8 overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
          
          {actionSuccess && (
            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-200">
              <CheckCircle2 className="w-24 h-24 text-emerald-500 mb-4" />
              <h2 className="text-2xl font-bold text-white">Sent!</h2>
            </div>
          )}

          <div className="bg-zinc-950 p-6 border-b border-zinc-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 flex items-center">
                <Play className="w-5 h-5 mr-2 text-amber-500" /> WhatsApp Queue
              </h2>
              <p className="text-zinc-500 text-sm mt-1">{messageType.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-500">{queueIndex + 1} <span className="text-zinc-500 text-sm">of {queueItems.length}</span></div>
            </div>
          </div>

          <div className="p-8 flex-1">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-zinc-50 mb-2">{current.name}</h1>
                <p className="text-xl text-zinc-400 font-mono">{current.phone}</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-500 font-mono font-bold text-xl">
                {current.unique_code}
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">Message Preview</h3>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{getWhatsAppMessage(current)}</p>
            </div>

            <button 
              onClick={() => openWhatsApp(current)}
              className="w-full bg-[#25D366] text-white py-6 rounded-2xl text-xl font-bold hover:bg-[#1ebe57] transition-all flex justify-center items-center shadow-lg shadow-[#25D366]/20 mb-6"
            >
              <MessageCircle className="w-6 h-6 mr-3" /> Open in WhatsApp
            </button>

            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => handleQueueAction('failed')} className="bg-zinc-950 border border-red-500/30 text-red-400 hover:bg-red-500/10 py-4 rounded-xl font-bold flex flex-col items-center justify-center transition-all">
                <XCircle className="w-6 h-6 mb-2" /> Mark Failed
              </button>
              <button onClick={() => handleQueueAction('skip')} className="bg-zinc-950 border border-zinc-700 text-zinc-400 hover:bg-zinc-800 py-4 rounded-xl font-bold flex flex-col items-center justify-center transition-all">
                <SkipForward className="w-6 h-6 mb-2" /> Skip for Now
              </button>
              <button onClick={() => handleQueueAction('sent')} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 py-4 rounded-xl font-bold flex flex-col items-center justify-center transition-all">
                <CheckCircle2 className="w-6 h-6 mb-2" /> Mark Sent & Next
              </button>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex justify-center">
            <button onClick={() => { setQueueMode(false); setSelectedIds(new Set()); }} className="text-zinc-500 hover:text-zinc-300 flex items-center font-medium">
              <PauseCircle className="w-5 h-5 mr-2" /> Pause / Exit Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const counts = {
    pending: registrations.filter(r => getStatus(r) === 'pending').length,
    sent: registrations.filter(r => getStatus(r) === 'sent').length,
    failed: registrations.filter(r => getStatus(r) === 'failed').length,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-4 md:p-8 pb-32">
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

        {/* WhatsApp Management Banner */}
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex flex-wrap gap-4 items-center justify-between">
             <div className="flex items-center gap-4">
                <span className="font-semibold text-zinc-300">Target Message:</span>
                <select 
                  value={messageType} 
                  onChange={(e) => setMessageType(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 text-amber-500 rounded-lg px-3 py-1.5 outline-none font-medium"
                >
                  <option value="confirmation">Welcome / Confirmation</option>
                  <option value="reminder_3">Reminder - 3 Days</option>
                  <option value="reminder_2">Reminder - 2 Days</option>
                  <option value="reminder_1">Reminder - 1 Day</option>
                </select>
             </div>
             
             <div className="flex items-center gap-4 text-sm font-medium">
                <span className="text-zinc-400">Live Status:</span>
                <span className="text-emerald-400">{counts.sent} Sent</span>
                <span className="text-red-400">{counts.failed} Failed</span>
                <span className="text-zinc-300">{counts.pending} Pending</span>
             </div>
          </div>
          <div className="p-4 flex flex-wrap gap-3 bg-zinc-900/50">
             <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${statusFilter === 'all' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>All Attendees</button>
             <button onClick={() => setStatusFilter('pending')} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${statusFilter === 'pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>Show only Pending</button>
             <button onClick={() => setStatusFilter('failed')} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${statusFilter === 'failed' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>Show only Failed</button>
             <button onClick={() => setStatusFilter('sent')} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${statusFilter === 'sent' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>Show only Sent</button>
          </div>
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
                  <th className="p-4 w-12">
                    <button onClick={toggleAll} className="text-zinc-400 hover:text-amber-500 transition-colors">
                      {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                  </th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Code</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Name</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Contact</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Details</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-[11px] w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map(r => (
                  <tr key={r.id} className={`hover:bg-zinc-800/30 transition-colors group ${selectedIds.has(r.id!) ? 'bg-amber-500/5' : ''}`}>
                    <td className="p-4">
                      <button onClick={() => toggleSelection(r.id!)} className={`transition-colors ${selectedIds.has(r.id!) ? 'text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
                        {selectedIds.has(r.id!) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
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
                      <StatusBadge status={getStatus(r)} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-zinc-500">No registrations found matching your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Floating Action Bar */}
      {selectedIds.size > 0 && !queueMode && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent flex justify-center z-40 pointer-events-none">
          <div className="bg-amber-500 text-zinc-950 rounded-full pl-6 pr-2 py-2 flex items-center space-x-6 shadow-[0_0_40px_rgba(245,158,11,0.3)] pointer-events-auto">
            <span className="font-bold whitespace-nowrap">{selectedIds.size} selected</span>
            <button onClick={startQueue} className="bg-zinc-950 text-amber-500 hover:bg-zinc-800 px-6 py-3 rounded-full font-bold flex items-center transition-colors">
              <Play className="w-5 h-5 mr-2" /> Start Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
