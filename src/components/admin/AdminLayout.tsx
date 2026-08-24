import React, { useState } from 'react';
import { LogOut, LayoutDashboard, Users, Calendar, Settings, Menu, X } from 'lucide-react';

export default function AdminLayout({ user, children, currentTab, setCurrentTab, onLogout }: { user: any, children: React.ReactNode, currentTab: string, setCurrentTab: (t: string) => void, onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'registrations', label: 'Registrations', icon: Users },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans selection:bg-black selection:text-white text-zinc-900">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-zinc-200/80 z-50 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 text-white rounded flex items-center justify-center font-bold text-xs">
              NG
            </div>
            <span className="font-semibold text-sm tracking-wide">ADMIN</span>
          </div>
          <button className="lg:hidden text-zinc-400 hover:text-zinc-900 transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 py-6 flex-1 overflow-y-auto space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setCurrentTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                currentTab === tab.id 
                  ? 'bg-zinc-100 text-zinc-900' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${currentTab === tab.id ? 'text-zinc-900' : 'text-zinc-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-zinc-200/80">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
          <div className="mt-4 px-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
              <span className="text-zinc-600 font-medium text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-zinc-900 truncate">
                {user?.email || 'admin@demo.com'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/50 backdrop-blur-md border-b border-zinc-200/80 flex items-center px-4 lg:px-8 sticky top-0 z-30">
          <button 
            className="lg:hidden text-zinc-500 hover:text-zinc-900 p-2 -ml-2 mr-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center text-[13px] font-medium text-zinc-500 capitalize">
            {currentTab}
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
