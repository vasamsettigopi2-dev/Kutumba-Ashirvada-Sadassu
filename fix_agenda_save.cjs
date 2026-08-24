const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AgendaView.tsx', 'utf8');

const topReplacement = `import React, { useState, useEffect } from 'react';
import { AgendaSession } from '../../types';
import { db } from '../../lib/firebase';
import { Plus, Edit2, Trash2, Video, FileText, Calendar, Clock, Save, X } from 'lucide-react';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function AgendaView() {
  const [sessions, setSessions] = useState<AgendaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AgendaSession>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const q = collection(db, 'agenda');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgendaSession));
      docs.sort((a: any, b: any) => {
        if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
      setSessions(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (isEditing) {
        await updateDoc(doc(db, 'agenda', isEditing), formData as any);
      } else {
        await addDoc(collection(db, 'agenda'), formData as any);
      }
      setIsEditing(null);
      setIsAdding(false);
      setFormData({});
    } catch (e: any) {
      console.error("Error saving session", e);
      alert("Error saving session: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'agenda', id));
      setConfirmDelete(null);
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
  };`;

// replace from start up to return (
content = content.replace(/^[\s\S]*?(?=\n  return \()/m, topReplacement);

// Now replace the Save Session button to use isSaving
content = content.replace(/<button \n              onClick=\{handleSave\}\n              className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 font-medium text-\[13px\] transition-colors flex items-center shadow-sm"\n            >\n              Save Session\n            <\/button>/, `<button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 font-medium text-[13px] transition-colors flex items-center shadow-sm disabled:opacity-70"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              ) : null}
              {isSaving ? 'Saving...' : 'Save Session'}
            </button>`);

fs.writeFileSync('src/components/admin/AgendaView.tsx', content, 'utf8');
