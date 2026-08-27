import React, { useState, useEffect } from 'react';
import { Registration, MessageTemplates } from '../../types';
import { 
  Search, Download, CheckSquare, Square, RefreshCw, MessageCircle, 
  CheckCircle2, Clock, ExternalLink, Send, ChevronDown, Eye, X, Filter, 
  LayoutList, LayoutGrid, Phone, MapPin, Calendar, UserCheck, Check, Sparkles,
  Edit3, Trash2, AlertTriangle, Save
} from 'lucide-react';

interface RegistrationsViewProps {
  registrations: Registration[];
  fetching: boolean;
  onRefresh: () => void;
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  toggleAll: () => void;
  onGoToBin?: () => void;
}

const REMINDER_OPTIONS = [
  { key: 'reminder_7', label: '7 Days Left', days: 7, icon: '🔔' },
  { key: 'reminder_6', label: '6 Days Left', days: 6, icon: '🔔' },
  { key: 'reminder_5', label: '5 Days Left', days: 5, icon: '🔔' },
  { key: 'reminder_4', label: '4 Days Left', days: 4, icon: '🔔' },
  { key: 'reminder_3', label: '3 Days Left', days: 3, icon: '🔔' },
  { key: 'reminder_2', label: '2 Days Left', days: 2, icon: '🔔' },
  { key: 'reminder_1', label: '1 Day Left (Tomorrow)', days: 1, icon: '🔥' },
  { key: 'reminder_0', label: 'Event Day (Today)', days: 0, icon: '🎉' },
];

const AVAILABLE_DAYS = ['Oct 16', 'Oct 17', 'Oct 18', 'Oct 19', 'Oct 20'];

export default function RegistrationsView({
  registrations,
  fetching,
  onRefresh,
  selectedIds,
  toggleSelection,
  toggleAll,
  onGoToBin,
}: RegistrationsViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [confStatusFilter, setConfStatusFilter] = useState<'all' | 'sent' | 'pending'>('all');
  const [remStatusFilter, setRemStatusFilter] = useState<'all' | 'sent' | 'pending'>('all');
  const [activeReminderKey, setActiveReminderKey] = useState<string>('reminder_7');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Templates state
  const [templates, setTemplates] = useState<MessageTemplates | null>(null);
  
  // Preview Modal state
  const [previewAttendee, setPreviewAttendee] = useState<Registration | null>(null);
  const [previewMsgType, setPreviewMsgType] = useState<string>('confirmation');
  const [previewCustomText, setPreviewCustomText] = useState<string>('');

  // Edit Attendee Modal state
  const [editAttendee, setEditAttendee] = useState<Registration | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editSaving, setEditSaving] = useState(false);

  // Delete Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bulk Dispatch Modal state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkIndex, setBulkIndex] = useState(0);

  // Local status tracking for instant UI responsiveness
  const [localStatuses, setLocalStatuses] = useState<Record<string, Record<string, any>>>({});

  // Toast feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Fetch templates from server
  useEffect(() => {
    const fetchTemplates = async (quiet = false) => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/settings/templates', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.templates) {
            setTemplates(prev => {
              if (!prev) return data.templates;
              const same = JSON.stringify(prev) === JSON.stringify(data.templates);
              return same ? prev : data.templates;
            });
            if (!quiet && data.templates?.event_start_date) {
              const eventDate = new Date(data.templates.event_start_date).getTime();
              const now = new Date().getTime();
              const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
              if (diffDays >= 0 && diffDays <= 7) {
                setActiveReminderKey(`reminder_${diffDays}`);
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to load templates:', e);
      }
    };
    fetchTemplates(false);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchTemplates(true);
      }
    }, 15000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchTemplates(true);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const formatDaysAttending = (days: any) => {
    if (Array.isArray(days)) {
      return days.join(', ');
    }
    return days || 'All Days';
  };

  const generateMessage = (attendee: Registration, msgType: string) => {
    if (!templates) return '';
    const templateKey = msgType === 'confirmation' ? 'confirmation_text' : `${msgType}_text`;
    const rawTemplate = templates[templateKey] || templates['confirmation_text'] || '';
    
    const datesStr = formatDaysAttending(attendee.days_attending);
    const daysLeft = msgType.startsWith('reminder_') ? msgType.replace('reminder_', '') : '7';

    return rawTemplate
      .replace(/{{name}}/g, attendee.name || 'Attendee')
      .replace(/{{code}}/g, attendee.unique_code || 'NGM2026')
      .replace(/{{dates}}/g, datesStr)
      .replace(/{{city}}/g, attendee.church_city || 'Siddipet')
      .replace(/{{gender}}/g, attendee.gender || '')
      .replace(/{{venue}}/g, templates.venue_name || 'Dr. Dayanand Vaddepalli Function Halls, Siddipet')
      .replace(/{{days_left}}/g, daysLeft);
  };

  const getMessageStatus = (attendee: Registration, msgType: string) => {
    if (attendee.id && localStatuses[attendee.id]?.[msgType]) {
      return localStatuses[attendee.id][msgType];
    }
    return attendee.whatsapp_status?.[msgType] || { status: 'pending' };
  };

  const updateStatusOnServer = async (attendeeId: string, msgType: string, status: 'sent' | 'pending') => {
    setLocalStatuses(prev => ({
      ...prev,
      [attendeeId]: {
        ...(prev[attendeeId] || {}),
        [msgType]: { status, timestamp: new Date().toISOString() }
      }
    }));

    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/admin/update_whatsapp_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: attendeeId, messageType: msgType, status })
      });
    } catch (e) {
      console.error('Failed to update status on server:', e);
    }
  };

  const handleSendWhatsApp = (attendee: Registration, msgType: string) => {
    let text = generateMessage(attendee, msgType);
    if (!text) {
      text = `Praise the Lord ${attendee.name} Garu, your registration for Kutumba Ashirvada Sadassu 2026 is confirmed. Pass Code: ${attendee.unique_code}. Pray and Participate! - NGM`;
    }

    const cleanPhone = attendee.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');

    if (attendee.id) {
      updateStatusOnServer(attendee.id, msgType, 'sent');
    }
  };

  const openPreview = (attendee: Registration, msgType: string) => {
    setPreviewAttendee(attendee);
    setPreviewMsgType(msgType);
    setPreviewCustomText(generateMessage(attendee, msgType));
  };

  const sendFromPreview = () => {
    if (!previewAttendee) return;
    const cleanPhone = previewAttendee.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(previewCustomText)}`;

    window.open(url, '_blank');

    if (previewAttendee.id) {
      updateStatusOnServer(previewAttendee.id, previewMsgType, 'sent');
    }
    setPreviewAttendee(null);
  };

  // Open Edit Modal
  const openEditModal = (attendee: Registration) => {
    setEditAttendee(attendee);
    setEditForm({
      name: attendee.name || '',
      phone: attendee.phone || '',
      church_city: attendee.church_city || '',
      gender: attendee.gender || 'Male',
      category: attendee.category || 'Adult',
      days_attending: Array.isArray(attendee.days_attending) ? attendee.days_attending : ['Oct 16', 'Oct 17', 'Oct 18', 'Oct 19', 'Oct 20'],
      email: attendee.email || ''
    });
  };

  // Save Edit to Server
  const handleSaveEdit = async () => {
    if (!editAttendee?.id) return;
    setEditSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/registration/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editAttendee.id,
          ...editForm
        })
      });
      if (res.ok) {
        showFeedback(`Successfully updated ${editForm.name}!`);
        setEditAttendee(null);
        onRefresh();
      }
    } catch (e) {
      console.error('Update attendee error:', e);
    } finally {
      setEditSaving(false);
    }
  };

  // Move to Deleted Bin (Soft Delete)
  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/registration/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: deleteTarget.id, permanent: false })
      });
      if (res.ok) {
        showFeedback(`Moved ${deleteTarget.name} to Deleted Bin.`);
        setDeleteTarget(null);
        onRefresh();
      }
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Only show ACTIVE registrations (not deleted)
  const activeRegistrations = registrations.filter(r => !r.deleted);
  const deletedCount = registrations.filter(r => Boolean(r.deleted)).length;

  const filtered = activeRegistrations.filter((r: Registration) => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = r.name?.toLowerCase().includes(q);
      const matchCode = r.unique_code?.toLowerCase().includes(q);
      const matchPhone = r.phone?.includes(q);
      const matchCity = r.church_city?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchPhone && !matchCity) return false;
    }
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    
    if (confStatusFilter !== 'all') {
      const isSent = getMessageStatus(r, 'confirmation').status === 'sent';
      if (confStatusFilter === 'sent' && !isSent) return false;
      if (confStatusFilter === 'pending' && isSent) return false;
    }

    if (remStatusFilter !== 'all') {
      const isSent = getMessageStatus(r, activeReminderKey).status === 'sent';
      if (remStatusFilter === 'sent' && !isSent) return false;
      if (remStatusFilter === 'pending' && isSent) return false;
    }

    return true;
  });

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(filtered.map((r: any) => {
      const confStatus = getMessageStatus(r, 'confirmation').status;
      const remStatus = getMessageStatus(r, activeReminderKey).status;
      return {
        'Pass Code': r.unique_code,
        'Name': r.name,
        'Gender': r.gender || '—',
        'Phone': r.phone,
        'City': r.church_city,
        'Category': r.category,
        'Dates': formatDaysAttending(r.days_attending),
        'Confirmation WhatsApp': confStatus === 'sent' ? 'Sent' : 'Pending',
        'Reminder WhatsApp': remStatus === 'sent' ? 'Sent' : 'Pending',
        'Checked In': r.checked_in ? 'Yes' : 'No',
        'Registered Date': r.created_at ? new Date(r.created_at).toLocaleString() : ''
      };
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, "Registrations_2026.xlsx");
  };

  const selectedAttendees = activeRegistrations.filter(r => r.id && selectedIds.has(r.id));
  const activeReminderObj = REMINDER_OPTIONS.find(r => r.key === activeReminderKey) || REMINDER_OPTIONS[0];

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-16">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Registrations & WhatsApp Manager
            </h1>
            <span className="text-xs bg-zinc-900 text-white px-2.5 py-0.5 rounded-full font-bold shadow-xs">
              {filtered.length} Active
            </span>
            {deletedCount > 0 && onGoToBin && (
              <button
                onClick={onGoToBin}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold transition-colors flex items-center gap-1"
                title="View Deleted Bin"
              >
                <Trash2 className="w-3 h-3" />
                <span>{deletedCount} in Deleted Bin</span>
              </button>
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-zinc-500 mt-1">
            Send WhatsApp confirmations & reminders with manual check indicators, edit, and delete options.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Select All Button */}
          <button
            onClick={toggleAll}
            className="inline-flex items-center px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-colors border border-zinc-300"
          >
            {selectedIds.size === filtered.length && filtered.length > 0 ? (
              <CheckSquare className="w-4 h-4 mr-1.5 text-zinc-900" />
            ) : (
              <Square className="w-4 h-4 mr-1.5 text-zinc-500" />
            )}
            <span>Select All</span>
          </button>

          {/* View Mode Switcher */}
          <div className="bg-zinc-100 p-1 rounded-lg flex items-center border border-zinc-200">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              <span>Full List</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid Cards</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={fetching}
            className="p-2 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Excel
          </button>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, pass code, phone, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Active Reminder Stage Selector */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider shrink-0">Reminder:</span>
              <select
                value={activeReminderKey}
                onChange={(e) => setActiveReminderKey(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-900"
              >
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Confirmation Filter */}
          <div className="lg:col-span-3">
            <select
              value={confStatusFilter}
              onChange={(e: any) => setConfStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-900"
            >
              <option value="all">Confirmation: All</option>
              <option value="sent">Confirmation: Sent (✓)</option>
              <option value="pending">Confirmation: Pending (☐)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-900"
            >
              <option value="all">All Categories</option>
              <option value="Adult">Adult</option>
              <option value="Youth">Youth</option>
              <option value="Children">Children</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Selected Attendees */}
      {selectedIds.size > 0 && (
        <div className="bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <span className="bg-amber-400 text-zinc-950 font-extrabold px-3 py-1 rounded-md text-xs">
              {selectedIds.size} Selected
            </span>
            <span className="text-xs text-zinc-200 hidden sm:inline font-medium">
              Ready to send bulk WhatsApp messages ({activeReminderObj.label})
            </span>
          </div>

          <button
            onClick={() => { setBulkIndex(0); setBulkModalOpen(true); }}
            className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-extrabold transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5 mr-2 text-zinc-950" />
            Launch WhatsApp Dispatcher
          </button>
        </div>
      )}

      {/* VIEW MODE 1: MODERN CLEAR & SPACIOUS LIST VIEW (100% Fit, Zero Horizontal Scroll) */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filtered.map((r: Registration) => {
            const confStatus = getMessageStatus(r, 'confirmation');
            const isConfSent = confStatus.status === 'sent';

            const remStatus = getMessageStatus(r, activeReminderKey);
            const isRemSent = remStatus.status === 'sent';

            const isSelected = selectedIds.has(r.id!);

            return (
              <div
                key={r.id || r.unique_code}
                className={`bg-white border rounded-xl p-4 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected ? 'border-amber-400 bg-amber-50/20' : 'border-zinc-200/90 hover:border-zinc-300'
                }`}
              >
                {/* Left Section: Checkbox, Code & Attendee Identity */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Select Checkbox */}
                  <button
                    onClick={() => r.id && toggleSelection(r.id)}
                    className="mt-0.5 sm:mt-0 text-zinc-400 hover:text-zinc-900 transition-colors shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-zinc-900" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-300 hover:text-zinc-600" />
                    )}
                  </button>

                  {/* Pass Code Badge */}
                  <div className="shrink-0">
                    <span className="font-mono text-xs font-extrabold bg-zinc-900 text-white px-2.5 py-1 rounded-md tracking-wider shadow-xs inline-block">
                      {r.unique_code}
                    </span>
                  </div>

                  {/* Name & Badges */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-zinc-900 leading-none">
                        {r.name}
                      </span>
                      
                      {/* Gender Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                          r.gender === 'Female'
                            ? 'bg-pink-100 text-pink-800 border border-pink-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {r.gender || '—'}
                      </span>

                      {/* Category Badge */}
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {r.category}
                      </span>

                      {/* Check-in Badge */}
                      {r.checked_in && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Checked In
                        </span>
                      )}
                    </div>

                    {/* Phone, City & Dates */}
                    <div className="text-[13px] text-zinc-600 font-medium flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-zinc-800 font-bold flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" /> {r.phone}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {r.church_city}
                      </span>
                      <span>•</span>
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" /> {formatDaysAttending(r.days_attending)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section: WhatsApp Actions, Edit & Delete */}
                <div className="flex items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                  {/* 1. Confirmation Message Box */}
                  <div className="flex items-center gap-2 p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => r.id && updateStatusOnServer(r.id, 'confirmation', isConfSent ? 'pending' : 'sent')}
                      className="p-1 text-zinc-400 hover:text-emerald-600 transition-colors"
                      title={isConfSent ? "Mark Pending (Uncheck)" : "Manually Put Green Tick (Sent)"}
                    >
                      {isConfSent ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-300 hover:text-zinc-600" />
                      )}
                    </button>

                    {isConfSent ? (
                      <span
                        onClick={() => r.id && updateStatusOnServer(r.id, 'confirmation', 'pending')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
                        title="Click to toggle status"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Sent</span>
                      </span>
                    ) : (
                      <span
                        onClick={() => r.id && updateStatusOnServer(r.id, 'confirmation', 'sent')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-200/80 text-zinc-600 cursor-pointer"
                        title="Click to mark sent manually"
                      >
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Pending</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleSendWhatsApp(r, 'confirmation')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                      title="Open in WhatsApp and send registration pass"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Pass</span>
                    </button>
                  </div>

                  {/* 2. Reminder Message Box */}
                  <div className="flex items-center gap-2 p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => r.id && updateStatusOnServer(r.id, activeReminderKey, isRemSent ? 'pending' : 'sent')}
                      className="p-1 text-zinc-400 hover:text-emerald-600 transition-colors"
                      title={isRemSent ? "Mark Pending (Uncheck)" : `Manually Put Green Tick (${activeReminderObj.days}D)`}
                    >
                      {isRemSent ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-300 hover:text-zinc-600" />
                      )}
                    </button>

                    {isRemSent ? (
                      <span
                        onClick={() => r.id && updateStatusOnServer(r.id, activeReminderKey, 'pending')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
                        title="Click to toggle status"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{activeReminderObj.days}D</span>
                      </span>
                    ) : (
                      <span
                        onClick={() => r.id && updateStatusOnServer(r.id, activeReminderKey, 'sent')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-200/80 text-zinc-600 cursor-pointer"
                        title="Click to mark sent manually"
                      >
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Pending</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleSendWhatsApp(r, activeReminderKey)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                      title={`Open in WhatsApp and send ${activeReminderObj.label}`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{activeReminderObj.days}D Remind</span>
                    </button>
                  </div>

                  {/* 3. Actions Group: Preview, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    {/* Preview Button */}
                    <button
                      onClick={() => openPreview(r, 'confirmation')}
                      className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                      title="Preview Message"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Attendee Button */}
                    <button
                      onClick={() => openEditModal(r)}
                      className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Attendee Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete (Soft delete to bin) */}
                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Move to Deleted Bin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500">
              <p className="text-base font-semibold text-zinc-700">No active attendees found</p>
              <p className="text-xs text-zinc-400 mt-1">Try clearing your search query or check the Deleted Bin.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: CARD GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r: Registration) => {
            const confStatus = getMessageStatus(r, 'confirmation');
            const isConfSent = confStatus.status === 'sent';

            const remStatus = getMessageStatus(r, activeReminderKey);
            const isRemSent = remStatus.status === 'sent';

            const isSelected = selectedIds.has(r.id!);

            return (
              <div
                key={r.id || r.unique_code}
                className={`bg-white border rounded-xl p-4 shadow-xs space-y-3.5 transition-all ${
                  isSelected ? 'border-amber-400 bg-amber-50/20' : 'border-zinc-200/90 hover:border-zinc-300'
                }`}
              >
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => r.id && toggleSelection(r.id)}
                      className="text-zinc-400 hover:text-zinc-900"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-zinc-900" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-300 hover:text-zinc-600" />
                      )}
                    </button>
                    <span className="font-mono font-extrabold text-xs bg-zinc-900 text-white px-2.5 py-0.5 rounded-md shadow-xs">
                      {r.unique_code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                        r.gender === 'Female'
                          ? 'bg-pink-100 text-pink-800 border border-pink-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {r.gender || '—'}
                    </span>
                    <button
                      onClick={() => openEditModal(r)}
                      className="p-1 text-zinc-400 hover:text-blue-600 rounded"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="p-1 text-zinc-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Attendee Info */}
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">{r.name}</h3>
                  <div className="text-[13px] text-zinc-600 mt-1.5 space-y-1 font-medium">
                    <div className="flex items-center gap-2 font-mono text-zinc-800 font-bold">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" /> {r.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {r.church_city} ({r.category})
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" /> {formatDaysAttending(r.days_attending)}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-zinc-100 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => r.id && updateStatusOnServer(r.id, 'confirmation', isConfSent ? 'pending' : 'sent')}
                        className="text-zinc-400 hover:text-emerald-600"
                        title="Toggle Checkbox"
                      >
                        {isConfSent ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-300" />
                        )}
                      </button>
                      <span className="text-xs font-bold text-zinc-800">Pass Confirmation</span>
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(r, 'confirmation')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition-colors shadow-xs"
                      title="Send Confirmation"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => r.id && updateStatusOnServer(r.id, activeReminderKey, isRemSent ? 'pending' : 'sent')}
                        className="text-zinc-400 hover:text-emerald-600"
                        title="Toggle Checkbox"
                      >
                        {isRemSent ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-300" />
                        )}
                      </button>
                      <span className="text-xs font-bold text-zinc-800">{activeReminderObj.days}D Reminder</span>
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(r, activeReminderKey)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-500 transition-colors shadow-xs"
                      title={`Send ${activeReminderObj.label}`}
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Attendee Modal (Crisp Light Theme) */}
      {editAttendee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200">
            {/* Light Header */}
            <div className="p-5 bg-white border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 leading-tight">
                    Edit Attendee Registration
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
                    <span>Pass Code:</span>
                    <span className="font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-300 px-2 py-0.5 rounded text-[11px]">
                      {editAttendee.unique_code}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditAttendee(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar bg-white">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 font-medium focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                  placeholder="e.g. Bro. David Raju"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm font-mono text-zinc-900 font-medium focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                  placeholder="e.g. 9876543210"
                />
              </div>

              {/* Church / City */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Church / City
                </label>
                <input
                  type="text"
                  value={editForm.church_city || ''}
                  onChange={(e) => setEditForm({ ...editForm, church_city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 font-medium focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                  placeholder="e.g. Siddipet"
                />
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Male', 'Female'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, gender: g })}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        editForm.gender === g
                          ? g === 'Female'
                            ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                            : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={editForm.category || 'Adult'}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm font-semibold text-zinc-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 shadow-2xs"
                >
                  <option value="Adult">Adult</option>
                  <option value="Youth">Youth</option>
                  <option value="Children">Children</option>
                </select>
              </div>

              {/* Attending Dates */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Attending Dates
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_DAYS.map((day) => {
                    const isSelected = editForm.days_attending?.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const currentDays = editForm.days_attending || [];
                          const nextDays = isSelected
                            ? currentDays.filter((d: string) => d !== day)
                            : [...currentDays, day];
                          setEditForm({ ...editForm, days_attending: nextDays });
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <button
                onClick={() => setEditAttendee(null)}
                className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {editSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Move to Deleted Bin) */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-zinc-200 animate-in zoom-in-95">
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-zinc-900">Move to Deleted Bin?</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-zinc-800">{deleteTarget.name}</strong> ({deleteTarget.unique_code})?
                This record will be safely stored in the <strong>Deleted Bin</strong> and can be restored anytime.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Move to Bin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Attendee Message Preview Modal (Crisp Light Theme) */}
      {previewAttendee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200">
            {/* Light Header */}
            <div className="p-5 bg-white border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 leading-tight">
                    WhatsApp Message Preview
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    To <strong className="text-zinc-800">{previewAttendee.name}</strong> • {previewAttendee.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewAttendee(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-zinc-200 bg-zinc-50/70 flex gap-2 overflow-x-auto">
              <button
                onClick={() => {
                  setPreviewMsgType('confirmation');
                  setPreviewCustomText(generateMessage(previewAttendee, 'confirmation'));
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  previewMsgType === 'confirmation' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                🎫 Registration Pass
              </button>
              <button
                onClick={() => {
                  setPreviewMsgType(activeReminderKey);
                  setPreviewCustomText(generateMessage(previewAttendee, activeReminderKey));
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  previewMsgType === activeReminderKey ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                🔔 {activeReminderObj.label}
              </button>
            </div>

            <div className="p-5 space-y-2 bg-white">
              <label className="block text-xs font-bold text-zinc-700">
                Message Body (Editable before sending):
              </label>
              <textarea
                rows={11}
                value={previewCustomText}
                onChange={(e) => setPreviewCustomText(e.target.value)}
                className="w-full p-4 bg-zinc-50/80 border border-zinc-300 rounded-xl text-[13px] font-mono text-zinc-900 focus:outline-none focus:border-emerald-600 focus:bg-white leading-relaxed shadow-2xs"
              />
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <button
                onClick={() => setPreviewAttendee(null)}
                className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendFromPreview}
                className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in WhatsApp & Mark Sent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Dispatch Step-Through Modal (Crisp Light Theme) */}
      {bulkModalOpen && selectedAttendees.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200">
            {/* Light Header */}
            <div className="p-5 bg-white border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 leading-tight">
                    Bulk WhatsApp Sender
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Sending: <strong className="text-emerald-700">{activeReminderObj.label}</strong> ({bulkIndex + 1} of {selectedAttendees.length})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 bg-white">
              <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2.5 transition-all duration-300"
                  style={{ width: `${((bulkIndex + 1) / selectedAttendees.length) * 100}%` }}
                />
              </div>

              {selectedAttendees[bulkIndex] && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 text-base">
                      {selectedAttendees[bulkIndex].name}
                    </span>
                    <span className="font-mono text-xs bg-zinc-900 text-white px-2.5 py-0.5 rounded font-bold">
                      {selectedAttendees[bulkIndex].unique_code}
                    </span>
                  </div>
                  <div className="text-[13px] text-zinc-700 font-medium">
                    Phone: <span className="font-mono font-bold text-zinc-900">{selectedAttendees[bulkIndex].phone}</span>
                  </div>
                  <div className="text-xs text-zinc-500 font-medium">
                    City: {selectedAttendees[bulkIndex].church_city}
                  </div>
                </div>
              )}

              <p className="text-xs text-zinc-500 leading-relaxed text-center font-medium">
                Clicking <strong>"Open WhatsApp & Next"</strong> opens the WhatsApp chat in a new tab with the pre-filled message and advances to the next contact.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <button
                onClick={() => {
                  if (bulkIndex > 0) setBulkIndex(bulkIndex - 1);
                }}
                disabled={bulkIndex === 0}
                className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-lg disabled:opacity-30 transition-colors"
              >
                ← Previous
              </button>

              <button
                onClick={() => {
                  const current = selectedAttendees[bulkIndex];
                  if (current) {
                    handleSendWhatsApp(current, activeReminderKey);
                  }
                  if (bulkIndex < selectedAttendees.length - 1) {
                    setBulkIndex(bulkIndex + 1);
                  } else {
                    setBulkModalOpen(false);
                  }
                }}
                className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {bulkIndex === selectedAttendees.length - 1 ? 'Send Last Contact & Finish' : 'Open WhatsApp & Next →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
