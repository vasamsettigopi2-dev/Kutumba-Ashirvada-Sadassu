const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

// Let's find the first `app.post('/api/admin/resend',` and keep lines until its closing `  });`
// Then remove the duplicate `    } catch (error) { ... }  });` that follows it.

let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('await sendConfirmation(doc.id, doc.data() as any);') && lines[i+1] && lines[i+1].includes("res.json({ success: true, message: 'Resend triggered' });")) {
     // Skip this duplicate block
     skip = true;
  }
  
  if (skip) {
     if (lines[i] === '  });') {
         skip = false;
         continue;
     }
     continue;
  }
  
  newLines.push(lines[i]);
}

fs.writeFileSync('server.ts', newLines.join('\n'), 'utf8');
