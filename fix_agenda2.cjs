const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AgendaView.tsx', 'utf8');

content = content.replace("  useEffect(() => {\n    fetchSessions();\n  }, []);\n\n", "");

fs.writeFileSync('src/components/admin/AgendaView.tsx', content, 'utf8');
