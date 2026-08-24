import React, { useState } from 'react';
import { Registration } from '../../types';
import { Search, Download, CheckSquare, Square, RefreshCw, MessageCircle, MoreVertical } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function RegistrationsView({ 
  registrations, 
  fetching, 
  onRefresh, 
  selectedIds, 
  toggleSelection, 
  toggleAll, 
  startQueue,
  messageType,
  setMessageType
}: any) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');

  const getStatus = (r: Registration) => {
    if (!r.whatsapp_status) return 'pending';
    return (r.whatsapp_status as any)[messageType]?.status || 'pending';
  };

  const filtered = registrations.filter((r: Registration) => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !r.unique_code?.toLowerCase().includes(q) && !r.phone.includes(q)) return false;
    }
    if (statusFilter !== 'all') {
      if (getStatus(r) !== statusFilter) return false;
    }
    return true;
  });

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map((r: any) => ({
      Code: r.unique_code,
      Name: r.name,
      Phone: r.phone,
      City: r.church_city,
      Category: r.category,
      Days: r.days_attending,
      Size: r.family_size,
      Diet: r.dietary_pref,
      CheckedIn: r.checked_in ? 'Yes' : 'No',
      Date: r.created_at ? new Date(r.created_at).toLocaleString() : ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, "Registrations.xlsx");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Registrations</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Manage attendees and WhatsApp notifications.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onRefresh} 
            disabled={fetching}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-md text-[13px] font-medium hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-50/50">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by name, code, or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={messageType}
              onChange={(e: any) => setMessageType(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow"
            >
              <option value="confirmation">Confirmation</option>
              <option value="reminder_3">3 Days Reminder</option>
              <option value="reminder_2">2 Days Reminder</option>
              <option value="reminder_1">1 Day Reminder</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-zinc-900 text-white px-4 py-3 flex items-center justify-between">
            <span className="text-[13px] font-medium">{selectedIds.size} selected</span>
            <button 
              onClick={startQueue}
              className="inline-flex items-center px-4 py-1.5 bg-white text-zinc-900 rounded text-[13px] font-medium hover:bg-zinc-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send {messageType.replace('_', ' ')}
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 font-medium">
              <tr>
                <th className="p-4 w-12">
                  <button onClick={toggleAll} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                    {selectedIds.size === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-zinc-900" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="p-4">Code</th>
                <th className="p-4">Attendee Info</th>
                <th className="p-4">Category</th>
                <th className="p-4">Msg Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((r: any) => {
                const status = getStatus(r);
                return (
                  <tr key={r.id} className={`hover:bg-zinc-50 transition-colors ${selectedIds.has(r.id) ? 'bg-zinc-50' : ''}`}>
                    <td className="p-4">
                      <button onClick={() => toggleSelection(r.id)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                        {selectedIds.has(r.id) ? (
                          <CheckSquare className="w-5 h-5 text-zinc-900" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-zinc-900 font-medium tracking-wide bg-zinc-100 px-2 py-1 rounded">
                        {r.unique_code}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-zinc-900">{r.name}</div>
                      <div className="text-zinc-500 mt-0.5">{r.phone} • {r.church_city}</div>
                    </td>
                    <td className="p-4 capitalize">{r.category}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[11px] font-semibold tracking-wide uppercase ${
                        status === 'sent' ? 'bg-green-100 text-green-700' :
                        status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-zinc-100 text-zinc-600'
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No registrations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
