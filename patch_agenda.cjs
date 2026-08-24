const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AgendaView.tsx', 'utf8');

// Replace the imports to remove firestore SDK
content = content.replace(/import \{ collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query \} from 'firebase\/firestore';\n/, "");

const replacementCode = `
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    };
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/agenda', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const docs = data.agenda || [];
        docs.sort((a, b) => {
          if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
          return (a.startTime || '').localeCompare(b.startTime || '');
        });
        setSessions(docs);
      }
    } catch (e) {
      console.error("Error fetching agenda", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? \`/api/admin/agenda/\${isEditing}\` : '/api/admin/agenda';
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      setIsEditing(null);
      setIsAdding(false);
      setFormData({});
      fetchSessions();
    } catch (e: any) {
      console.error("Error saving session", e);
      alert("Error saving session: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(\`/api/admin/agenda/\${id}\`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      setConfirmDelete(null);
      fetchSessions();
    } catch (e) {
      console.error("Error deleting session", e);
      alert("Error deleting session");
    }
  };
`;

// Replace fetchSessions
content = content.replace(/  const fetchSessions = async \(\) => \{[\s\S]*?  \};\n\n  const handleSave = async \(\) => \{[\s\S]*?  \};\n\n  const handleDelete = async \(id: string\) => \{[\s\S]*?  \};/, replacementCode);

fs.writeFileSync('src/components/admin/AgendaView.tsx', content, 'utf8');
