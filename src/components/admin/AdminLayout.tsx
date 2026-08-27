import React, { useState } from 'react';
import { 
  LogOut, LayoutDashboard, Users, Calendar, MessageSquare, Settings, 
  Menu, X, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Trash2
} from 'lucide-react';

export default function AdminLayout({ 
  user, 
  children, 
  currentTab, 
  setCurrentTab, 
  onLogout, 
  syncStatus 
}: { 
  user: any, 
  children: React.ReactNode, 
  currentTab: string, 
  setCurrentTab: (t: string) => void, 
  onLogout: () => void, 
  syncStatus?: 'synced' | 'syncing' | 'error' 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'registrations', label: 'Registrations', icon: Users },
    { id: 'templates', label: 'WhatsApp Templates', icon: MessageSquare },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'trash', label: 'Deleted Bin', icon: Trash2 },
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
      
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 ${
          collapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } w-64 bg-white border-r border-zinc-200/80 z-50 transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-4'} border-b border-zinc-200/80 transition-all`}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="w-9 h-9 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-sm hover:bg-zinc-800 hover:scale-105 transition-all group relative"
              title="Click to expand sidebar"
            >
              <span>NG</span>
              <ChevronRight className="w-3 h-3 absolute -right-1.5 -bottom-1 bg-white text-zinc-900 rounded-full border border-zinc-300 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  NG
                </div>
                <div className="flex flex-col min-w-0 transition-opacity duration-200">
                  <span className="font-bold text-sm tracking-wide text-zinc-900">ADMIN</span>
                  <span className="text-[10px] text-zinc-400 truncate">Kutumba Ashirvada</span>
                </div>
              </div>

              <div className="flex items-center">
                {/* Desktop Collapse Button */}
                <button
                  onClick={() => setCollapsed(true)}
                  className="hidden lg:flex p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {/* Mobile Close Button */}
                <button className="lg:hidden text-zinc-400 hover:text-zinc-900 transition-colors p-1" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Navigation Tabs */}
        <div className="p-3 py-5 flex-1 overflow-y-auto space-y-1.5">
          {tabs.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setCurrentTab(tab.id); setSidebarOpen(false); }}
                title={collapsed ? tab.label : undefined}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive 
                    ? 'bg-zinc-900 text-white shadow-sm' 
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                {!collapsed && <span className="truncate">{tab.label}</span>}
              </button>
            );
          })}
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-200/80 space-y-2">
          <button
            onClick={onLogout}
            title={collapsed ? "Sign out" : undefined}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-lg text-[13px] font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>

          {collapsed ? (
            <div className="flex justify-center pt-2 border-t border-zinc-100">
              <div 
                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0"
                title={user?.email || 'Admin'}
              >
                <span className="text-zinc-600 font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="px-2 pt-2 border-t border-zinc-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0">
                <span className="text-zinc-600 font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-zinc-700 truncate">
                  {user?.email || 'admin@demo.com'}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden text-zinc-500 hover:text-zinc-900 p-1.5 -ml-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Collapse Icon in Header */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 px-2 py-1 rounded transition-colors"
              title="Toggle Sidebar Width"
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              <span className="font-medium">{collapsed ? 'Expand View' : 'Collapse Sidebar'}</span>
            </button>

            <div className="h-4 w-px bg-zinc-200 hidden lg:block" />

            <div className="flex items-center text-[13px] font-semibold text-zinc-700 capitalize">
              {tabs.find(t => t.id === currentTab)?.label || currentTab}
            </div>
          </div>

          {syncStatus && (
            <div className="flex items-center gap-2 text-[12px] font-medium px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-xs">
              {syncStatus === 'syncing' && (
                <>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-zinc-500">Syncing...</span>
                </>
              )}
              {syncStatus === 'synced' && (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-zinc-600">Synced Cloud</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-zinc-600">Sync Error</span>
                </>
              )}
            </div>
          )}
        </header>
        
        <div className="flex-1 overflow-auto p-3 sm:p-5 lg:p-6">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
