const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AgendaView.tsx', 'utf8');

// Replace imports
content = content.replace("import { Plus, Edit2, Trash2, Video, FileText, Calendar, Clock, Save, X } from 'lucide-react';", "import { Plus, Edit2, Trash2, Video, FileText, Calendar, Clock, Save, X } from 'lucide-react';\nimport { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';");

// Replace fetchSessions and useEffect
const hookReplacement = `
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
    }
  };

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'agenda', id));
      setConfirmDelete(null);
    } catch (e) {
      console.error("Error deleting session", e);
      alert("Error deleting session");
    }
  };
`;

// Regex replace fetchSessions, getAuthHeaders, handleSave, handleDelete
content = content.replace(/  const getAuthHeaders = \(\) => \{[\s\S]*?fetchSessions\(\);\n    \} catch \(e\) \{\n      console.error\("Error deleting session", e\);\n      alert\("Error deleting session"\);\n    \}\n  \};/, hookReplacement);

fs.writeFileSync('src/components/admin/AgendaView.tsx', content, 'utf8');
