import React, { useState, useEffect } from 'react';
import { AgendaSession } from '../../types';
import { db } from '../../lib/firebase';
import { Plus, Edit2, Trash2, Video, FileText, Calendar, Clock, Save, X } from 'lucide-react';


export default function AgendaView() {
  const [sessions, setSessions] = useState<AgendaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AgendaSession>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAgenda = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/agenda');
      const data = await res.json();
      if (data.agenda) {
        const docs = data.agenda;
        docs.sort((a: any, b: any) => {
          if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
          return (a.startTime || '').localeCompare(b.startTime || '');
        });
        setSessions(docs);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/admin/agenda/${isEditing}` : '/api/admin/agenda';
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status} Failed to save`);
      }
      
      setIsEditing(null);
      setIsAdding(false);
      setFormData({});
      fetchAgenda();
    } catch (e: any) {
      console.error("Error saving session", e);
      alert("Error saving session: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/agenda/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      setConfirmDelete(null);
      fetchAgenda();
    } catch (e) {
      console.error("Error deleting session", e);
      alert("Error deleting session");
    }
  };

  const startEdit = (session: AgendaSession) => {
    setIsEditing(session.id!);
    setFormData(session);
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Agenda Settings</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Manage event schedule and sessions.</p>
        </div>
        {!isAdding && !isEditing && (
          <button 
            onClick={() => { setIsAdding(true); setFormData({ day: 'Day 1', date: '2026-10-16' }); }}
            className="inline-flex items-center justify-center px-4 py-2 bg-zinc-900 text-white rounded-md text-[13px] font-medium hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </button>
        )}
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-white border border-zinc-200/80 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
            <h2 className="text-[15px] font-semibold text-zinc-900">
              {isEditing ? 'Edit Session' : 'Create New Session'}
            </h2>
            <button onClick={() => { setIsEditing(null); setIsAdding(false); }} className="text-zinc-400 hover:text-zinc-900">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Day Label</label>
              <select 
                value={formData.day || ''} 
                onChange={e => {
                  const day = e.target.value;
                  let date = formData.date;
                  if (day === 'Day 1') date = '2026-10-16';
                  if (day === 'Day 2') date = '2026-10-17';
                  if (day === 'Day 3') date = '2026-10-18';
                  if (day === 'Day 4') date = '2026-10-19';
                  if (day === 'Day 5') date = '2026-10-20';
                  setFormData({...formData, day, date});
                }}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow"
              >
                <option value="Day 1">Day 1</option>
                <option value="Day 2">Day 2</option>
                <option value="Day 3">Day 3</option>
                <option value="Day 4">Day 4</option>
                <option value="Day 5">Day 5</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Date</label>
              <select 
                value={formData.date || ''} 
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow"
              >
                <option value="2026-10-16">Oct 16, 2026 (Friday)</option>
                <option value="2026-10-17">Oct 17, 2026 (Saturday)</option>
                <option value="2026-10-18">Oct 18, 2026 (Sunday)</option>
                <option value="2026-10-19">Oct 19, 2026 (Monday)</option>
                <option value="2026-10-20">Oct 20, 2026 (Tuesday)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Start Time (24h)</label>
              <input 
                type="time" 
                value={formData.startTime || ''} 
                onChange={e => setFormData({...formData, startTime: e.target.value})} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow" 
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">End Time (24h)</label>
              <input 
                type="time" 
                value={formData.endTime || ''} 
                onChange={e => setFormData({...formData, endTime: e.target.value})} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow" 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Session Title</label>
              <input 
                type="text" 
                value={formData.title || ''} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow" 
                placeholder="Morning Worship" 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Speaker (Optional)</label>
              <input 
                type="text" 
                value={formData.speaker || ''} 
                onChange={e => setFormData({...formData, speaker: e.target.value})} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow" 
                placeholder="Pastor John" 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Live Link (Optional)</label>
              <input 
                type="url" 
                value={formData.ytLiveLink || ''} 
                onChange={e => setFormData({...formData, ytLiveLink: e.target.value})} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow" 
                placeholder="https://youtube.com/..." 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Notes Link (Optional)</label>
              <input 
                type="url" 
                value={formData.notesLink || ''} 
                onChange={e => setFormData({...formData, notesLink: e.target.value})} 
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-shadow" 
                placeholder="https://drive.google.com/..." 
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button 
              onClick={() => { setIsEditing(null); setIsAdding(false); }} 
              className="px-4 py-2 text-zinc-600 rounded-md hover:bg-zinc-100 font-medium text-[13px] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 font-medium text-[13px] transition-colors flex items-center shadow-sm disabled:opacity-70"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              ) : null}
              {isSaving ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {loading && (
          <div className="py-12 flex justify-center">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
          </div>
        )}
        
        {!loading && sessions.map(session => (
          <div key={session.id} className="group bg-white border border-zinc-200/60 rounded-lg p-5 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-zinc-300 transition-colors shadow-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
                  {session.day}
                </span>
                <span className="text-zinc-500 text-[13px] font-medium flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" /> {session.date}
                </span>
                <span className="text-zinc-500 text-[13px] font-medium flex items-center bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">
                  <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" /> {session.startTime} - {session.endTime}
                </span>
              </div>
              
              <h3 className="text-[16px] font-semibold text-zinc-900 mb-1">{session.title}</h3>
              
              {session.speaker && (
                <p className="text-[13px] text-zinc-500">
                  By <span className="text-zinc-900 font-medium">{session.speaker}</span>
                </p>
              )}
              
              {(session.ytLiveLink || session.notesLink) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {session.ytLiveLink && (
                    <a href={session.ytLiveLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-[12px] font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200 transition-colors">
                      <Video className="w-3.5 h-3.5 mr-1.5 opacity-60" /> Link
                    </a>
                  )}
                  {session.notesLink && (
                    <a href={session.notesLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-[12px] font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200 transition-colors">
                      <FileText className="w-3.5 h-3.5 mr-1.5 opacity-60" /> Notes
                    </a>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => startEdit(session)} 
                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                title="Edit Session"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              
              {confirmDelete === session.id ? (
                <button 
                  onClick={() => handleDelete(session.id!)} 
                  className="px-3 py-1.5 bg-red-600 text-white text-[12px] font-medium rounded-md hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
              ) : (
                <button 
                  onClick={() => setConfirmDelete(session.id!)} 
                  className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
