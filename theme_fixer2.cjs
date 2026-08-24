const fs = require('fs');

const files = [
  'src/components/admin/AdminLogin.tsx',
  'src/components/admin/AdminLayout.tsx',
  'src/components/admin/RegistrationsView.tsx',
  'src/components/admin/AgendaView.tsx',
  'src/components/AdminDashboard.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/text-zinc-700/g, 'text-slate-700');
  content = content.replace(/text-zinc-600/g, 'text-slate-600');
  content = content.replace(/divide-zinc-100/g, 'divide-slate-100');
  content = content.replace(/bg-zinc-400/g, 'bg-slate-400');
  content = content.replace(/border-zinc-100/g, 'border-slate-100');
  content = content.replace(/bg-amber-100/g, 'bg-indigo-100');
  content = content.replace(/hover:text-amber-700/g, 'hover:text-indigo-700');
  content = content.replace(/ring-amber-500\/20/g, 'ring-indigo-600/20');
  content = content.replace(/bg-zinc-100/g, 'bg-slate-100');
  content = content.replace(/border-zinc-800/g, 'border-slate-200');

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Themes fully fixed');
