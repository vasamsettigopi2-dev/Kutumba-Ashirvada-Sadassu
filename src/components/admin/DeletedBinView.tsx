import React, { useState } from 'react';
import { Registration } from '../../types';
import { 
  Trash2, RotateCcw, Search, AlertTriangle, Check, Phone, MapPin, Calendar, 
  User, RefreshCw, X, ShieldAlert 
} from 'lucide-react';

interface DeletedBinViewProps {
  registrations: Registration[];
  fetching: boolean;
  onRefresh: () => void;
}

export default function DeletedBinView({
  registrations,
  fetching,
  onRefresh
}: DeletedBinViewProps) {
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmPermanentId, setConfirmPermanentId] = useState<string | null>(null);
  const [confirmEmptyBin, setConfirmEmptyBin] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter only deleted records
  const deletedAttendees = registrations.filter(r => Boolean(r.deleted));

  const filtered = deletedAttendees.filter((r: Registration) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.unique_code?.toLowerCase().includes(q) ||
      r.phone?.includes(q) ||
      r.church_city?.toLowerCase().includes(q)
    );
  });

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Restore Attendee
  const handleRestore = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/registration/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        showFeedback(`Successfully restored ${name} to active registrations!`);
        onRefresh();
      }
    } catch (e) {
      console.error('Restore error:', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Permanently Delete Attendee
  const handlePermanentDelete = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/registration/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, permanent: true })
      });
      if (res.ok) {
        showFeedback(`Permanently deleted ${name}.`);
        setConfirmPermanentId(null);
        onRefresh();
      }
    } catch (e) {
      console.error('Permanent delete error:', e);
    } finally {
      setActionLoading(null);
    }
  };

  // Empty Entire Bin
  const handleEmptyBin = async () => {
    setActionLoading('empty_all');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/registration/empty_bin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showFeedback('Recycle Bin emptied successfully.');
        setConfirmEmptyBin(false);
        onRefresh();
      }
    } catch (e) {
      console.error('Empty bin error:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDays = (days: any) => {
    if (Array.isArray(days)) return days.join(', ');
    return days || 'All Days';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-600" />
              <span>Deleted Bin / Trash</span>
            </h1>
            <span className="text-xs bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full font-bold">
              {deletedAttendees.length} Deleted
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-zinc-500 mt-1">
            Deleted registrations stay here safely. You can restore them anytime or delete them permanently.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={fetching}
            className="p-2 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors shadow-xs"
            title="Refresh Bin"
          >
            <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
          </button>

          {deletedAttendees.length > 0 && (
            <button
              onClick={() => setConfirmEmptyBin(true)}
              className="inline-flex items-center px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Empty Bin ({deletedAttendees.length})
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search Bar */}
      {deletedAttendees.length > 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-xl p-3 shadow-xs">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search in deleted bin by name, pass code, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      )}

      {/* Deleted List */}
      <div className="space-y-3">
        {filtered.map((r: Registration) => (
          <div
            key={r.id || r.unique_code}
            className="bg-white border border-red-100/90 rounded-xl p-4 shadow-xs hover:border-red-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Info */}
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <span className="font-mono text-xs font-extrabold bg-zinc-800 text-white px-2.5 py-1 rounded-md tracking-wider shadow-xs shrink-0">
                {r.unique_code}
              </span>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-zinc-900 line-through opacity-80">
                    {r.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
                      r.gender === 'Female'
                        ? 'bg-pink-50 text-pink-700 border border-pink-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {r.gender || '—'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {r.category}
                  </span>
                  {r.deleted_at && (
                    <span className="text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded font-medium">
                      Deleted on {new Date(r.deleted_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="text-[13px] text-zinc-500 font-medium flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-zinc-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" /> {r.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {r.church_city}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-zinc-400 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" /> {formatDays(r.days_attending)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions (Restore & Permanent Delete) */}
            <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100 justify-end">
              {/* Restore Button */}
              <button
                onClick={() => r.id && handleRestore(r.id, r.name)}
                disabled={actionLoading === r.id}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>

              {/* Permanent Delete Trigger */}
              <button
                onClick={() => setConfirmPermanentId(r.id!)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-all shadow-xs"
                title="Delete Permanently"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        ))}

        {deletedAttendees.length === 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500">
            <Trash2 className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-base font-bold text-zinc-800">Deleted Bin is Empty</p>
            <p className="text-xs text-zinc-400 mt-1">No attendees have been deleted.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Single Permanent Delete */}
      {confirmPermanentId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-zinc-200 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-zinc-900">Delete Permanently?</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                This will completely remove this attendee from your cloud Firestore database. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmPermanentId(null)}
                className="flex-1 py-2 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = registrations.find(r => r.id === confirmPermanentId);
                  if (target?.id) handlePermanentDelete(target.id, target.name);
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-xs"
              >
                Yes, Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Empty Entire Bin */}
      {confirmEmptyBin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-zinc-200 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-zinc-900">Empty Entire Recycle Bin?</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to permanently erase all {deletedAttendees.length} records in the deleted bin?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmEmptyBin(false)}
                className="flex-1 py-2 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyBin}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-xs"
              >
                Yes, Empty All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
