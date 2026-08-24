import React, { useState } from 'react';
import { Save, User, Bell, Shield, Key } from 'lucide-react';

export default function SettingsView() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'NextGen 2026',
    contactEmail: 'admin@demo.com',
    enableNotifications: true,
    requireApproval: false,
  });

  const handleSave = () => {
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Manage portal preferences and security configurations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 bg-zinc-900 text-white rounded-md text-[13px] font-medium hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-70"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 text-[13px] font-medium px-4 py-3 rounded-md border border-green-100 flex items-center">
          Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-1">
          <h3 className="text-[15px] font-semibold text-zinc-900 flex items-center">
            <User className="w-4 h-4 mr-2 text-zinc-500" /> General Info
          </h3>
          <p className="text-[13px] text-zinc-500">
            Basic information about the event portal.
          </p>
        </div>
        
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-lg p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Event Name</label>
            <input 
              type="text" 
              value={settings.siteName}
              onChange={e => setSettings({...settings, siteName: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow max-w-md" 
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Admin Email</label>
            <input 
              type="email" 
              value={settings.contactEmail}
              onChange={e => setSettings({...settings, contactEmail: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow max-w-md" 
            />
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-zinc-100 my-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-1">
          <h3 className="text-[15px] font-semibold text-zinc-900 flex items-center">
            <Bell className="w-4 h-4 mr-2 text-zinc-500" /> Notifications
          </h3>
          <p className="text-[13px] text-zinc-500">
            Control automated messaging behavior.
          </p>
        </div>
        
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-lg p-6 shadow-sm space-y-5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={settings.enableNotifications}
                onChange={e => setSettings({...settings, enableNotifications: e.target.checked})}
                className="sr-only" 
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.enableNotifications ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.enableNotifications ? 'translate-x-4' : ''}`}></div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-zinc-900">Enable WhatsApp Notifications</div>
              <div className="text-[12px] text-zinc-500">Allow the system to send bulk messages via API.</div>
            </div>
          </label>
        </div>
      </div>

      <div className="w-full h-px bg-zinc-100 my-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-1">
          <h3 className="text-[15px] font-semibold text-zinc-900 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-zinc-500" /> Security
          </h3>
          <p className="text-[13px] text-zinc-500">
            Manage authentication and access rules.
          </p>
        </div>
        
        <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-lg p-6 shadow-sm space-y-5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={settings.requireApproval}
                onChange={e => setSettings({...settings, requireApproval: e.target.checked})}
                className="sr-only" 
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.requireApproval ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.requireApproval ? 'translate-x-4' : ''}`}></div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-zinc-900">Require Manual Approval</div>
              <div className="text-[12px] text-zinc-500">New user registrations must be approved by an admin.</div>
            </div>
          </label>
          
          <div className="pt-4 mt-4 border-t border-zinc-100">
            <button className="inline-flex items-center px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-md text-[13px] font-medium hover:bg-zinc-50 transition-colors shadow-sm">
              <Key className="w-4 h-4 mr-2 text-zinc-500" />
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
