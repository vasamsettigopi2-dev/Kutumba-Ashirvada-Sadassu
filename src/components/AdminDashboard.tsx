import React, { useState, useEffect } from 'react';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import RegistrationsView from './admin/RegistrationsView';
import AgendaView from './admin/AgendaView';
import TemplatesView from './admin/TemplatesView';
import SettingsView from './admin/SettingsView';
import DeletedBinView from './admin/DeletedBinView';

interface CustomUser {
  email: string;
  getIdToken: () => Promise<string>;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('registrations');
  
  // Registrations State (lifted here so it persists across tabs)
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('syncing');

  const fetchRegistrations = async (force = false) => {
    if (!force) {
      setFetching(true);
    }
    setSyncStatus('syncing');
    try {
      const token = localStorage.getItem('adminToken');
      const url = force
        ? '/api/admin/registrations?forceFresh=true'
        : '/api/admin/registrations';
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(prev => {
          const next = data.registrations || [];
          if (prev.length === next.length) {
            const sameOrder = prev.every((p, i) => next[i] && p.id === next[i].id && JSON.stringify(p) === JSON.stringify(next[i]));
            if (sameOrder) return prev;
          }
          return next;
        });
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    } finally {
      if (!force) {
        setFetching(false);
      }
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
    if (!user) return;
    fetchRegistrations(false);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchRegistrations(true);
      }
    }, 8000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchRegistrations(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onAuth={(u) => { setUser(u); }} />;
  }

  return (
    <AdminLayout user={user} currentTab={currentTab} setCurrentTab={setCurrentTab} onLogout={handleLogout} syncStatus={syncStatus}>
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
          onGoToBin={() => setCurrentTab('trash')}
        />
      )}

      {currentTab === 'templates' && (
        <TemplatesView />
      )}

      {currentTab === 'agenda' && (
        <AgendaView />
      )}

      {currentTab === 'trash' && (
        <DeletedBinView 
          registrations={registrations}
          fetching={fetching}
          onRefresh={fetchRegistrations}
        />
      )}

      {currentTab === 'settings' && (
        <SettingsView />
      )}
    </AdminLayout>
  );
}
