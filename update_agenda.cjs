const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AgendaView.tsx', 'utf8');

const regex = /<select [\s]*value=\{formData\.day \|\| ''\} [\s]*onChange=\{e => setFormData\(\{\.\.\.formData, day: e\.target\.value\}\)\}/;

const replacement = `<select 
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
                }}`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/admin/AgendaView.tsx', content, 'utf8');
