const fs = require('fs');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the query with a simple collection fetch
  content = content.replace(/const q = query\(collection\(db, 'agenda'\), orderBy\('date'\), orderBy\('startTime'\)\);/g, "const q = collection(db, 'agenda');");
  
  // Update the mapping to also sort client-side
  content = content.replace(/setSessions\(snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as AgendaSession\)\)\);/g, 
    "const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgendaSession));\n" +
    "      docs.sort((a, b) => {\n" +
    "        if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');\n" +
    "        return (a.startTime || '').localeCompare(b.startTime || '');\n" +
    "      });\n" +
    "      setSessions(docs);");
      
  content = content.replace(/setAgenda\(snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\)\);/g, 
    "const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));\n" +
    "        docs.sort((a, b) => {\n" +
    "          if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');\n" +
    "          return (a.startTime || '').localeCompare(b.startTime || '');\n" +
    "        });\n" +
    "        setAgenda(docs);");
        
  fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('src/components/admin/AgendaView.tsx');
fixFile('src/components/InvitePage.tsx');

console.log('Fixed composite index issue by sorting client-side');
