const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AgendaView.tsx', 'utf8');

const replacement = `
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    };
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
    } catch (e) {
      console.error("Error deleting session", e);
      alert("Error deleting session");
    }
  };
`;

content = content.replace(/  const handleSave = async \(\) => \{[\s\S]*?alert\("Error deleting session"\);\n    \}\n  \};/, replacement);

fs.writeFileSync('src/components/admin/AgendaView.tsx', content, 'utf8');
