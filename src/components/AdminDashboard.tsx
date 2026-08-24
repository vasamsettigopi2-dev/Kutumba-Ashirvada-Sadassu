import React, { useState, useEffect } from 'react';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import RegistrationsView from './admin/RegistrationsView';
import AgendaView from './admin/AgendaView';
import SettingsView from './admin/SettingsView';





interface CustomUser {
  email: string;
  getIdToken: () => Promise<string>;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Registrations State (lifted here so it persists across tabs)
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [messageType, setMessageType] = useState<'confirmation' | 'reminder_3' | 'reminder_2' | 'reminder_1'>('confirmation');




  const fetchRegistrations = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/registrations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations);
      }
    } catch (e) {
      console.error("Error fetching registrations", e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');
    if (token && email) {
      setUser({ email, getIdToken: async () => token });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const handleLogout = async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    setUser(null);
  };



  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === registrations.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(registrations.map(r => r.id!)));
  };

  const startQueue = async () => {
    if (selectedIds.size === 0) return;
    if (!user) return;
    
    setFetching(true);
    let successCount = 0;
    try {
      const token = await user.getIdToken();
      
      // Process in sequence to avoid overwhelming the server
      for (const id of Array.from(selectedIds)) {
        try {
          const res = await fetch('/api/admin/resend', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, messageType })
          });
          
          if (res.ok) successCount++;
        } catch (e) {
          console.error("Failed to resend for", id, e);
        }
      }
      
      alert(`Successfully sent messages to ${successCount} attendees!`);
      // Refresh to get latest status
      
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
      alert('An error occurred while sending messages.');
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onAuth={(u) => { setUser(u);  }} />;
  }

  return (
    <AdminLayout user={user} currentTab={currentTab} setCurrentTab={setCurrentTab} onLogout={handleLogout}>
      {currentTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, Admin</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-slate-500 text-sm font-medium mb-1">Total Registrations</h3>
              <div className="text-3xl font-bold text-slate-900">{registrations.length}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-slate-500 text-sm font-medium mb-1">Checked In</h3>
              <div className="text-3xl font-bold text-indigo-600">{registrations.filter(r => r.checked_in).length}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:bg-indigo-50 transition-colors group relative overflow-hidden" onClick={() => setCurrentTab('agenda')}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-slate-500 text-sm font-medium mb-1 relative z-10">Manage Agenda</h3>
              <div className="text-sm font-medium text-indigo-600 mt-2 flex items-center relative z-10">
                Open Agenda <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {currentTab === 'registrations' && (
        <RegistrationsView 
          registrations={registrations}
          fetching={fetching}
          onRefresh={fetchRegistrations}
          selectedIds={selectedIds}
          toggleSelection={toggleSelection}
          toggleAll={toggleAll}
          startQueue={startQueue}
          messageType={messageType}
          setMessageType={setMessageType}
        />
      )}

      {currentTab === 'agenda' && (
        <AgendaView />
      )}

      {currentTab === 'settings' && (
        <SettingsView />
      )}


      {currentTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-2xl">
             <p className="text-slate-600">Settings page content goes here. (e.g. modify global configurations).</p>
           </div>
        </div>
      )}
    </AdminLayout>
  );
}
