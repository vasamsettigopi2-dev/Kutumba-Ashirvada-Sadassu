const fs = require('fs');

// 1. Update AgendaView.tsx
let agendaView = fs.readFileSync('src/components/admin/AgendaView.tsx', 'utf8');

agendaView = agendaView.replace(
  "import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';",
  ""
);

const fetchAgendaCode = `  const fetchAgenda = async () => {
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
  }, []);`;

agendaView = agendaView.replace(/  useEffect\(\(\) => \{[\s\S]*?return \(\) => unsubscribe\(\);\n  \}, \[\]\);/, fetchAgendaCode);

// Add fetchAgenda() to handleSave and handleDelete after success
agendaView = agendaView.replace(
  "setIsAdding(false);\n      setFormData({});",
  "setIsAdding(false);\n      setFormData({});\n      fetchAgenda();"
);

agendaView = agendaView.replace(
  "setConfirmDelete(null);",
  "setConfirmDelete(null);\n      fetchAgenda();"
);

fs.writeFileSync('src/components/admin/AgendaView.tsx', agendaView, 'utf8');

// 2. Update InvitePage.tsx
let invitePage = fs.readFileSync('src/components/InvitePage.tsx', 'utf8');

const inviteFetchCode = `  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const res = await fetch('/api/admin/agenda');
        const data = await res.json();
        if (data.agenda) {
          const docs = data.agenda;
          docs.sort((a: any, b: any) => {
            if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
            return (a.startTime || '').localeCompare(b.startTime || '');
          });
          setAgenda(docs);
        }
      } catch (e) {
        console.error('Error fetching agenda', e);
      }
    };
    fetchAgenda();
  }, []);`;

invitePage = invitePage.replace(/  useEffect\(\(\) => \{\n    const fetchAgenda = async \(\) => \{[\s\S]*?\}\n    \};\n    fetchAgenda\(\);\n  \}, \[\]\);/, inviteFetchCode);

fs.writeFileSync('src/components/InvitePage.tsx', invitePage, 'utf8');

