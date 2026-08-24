const fs = require('fs');

const files = [
  'src/components/admin/AdminLogin.tsx',
  'src/components/admin/AdminLayout.tsx',
  'src/components/admin/RegistrationsView.tsx',
  'src/components/admin/AgendaView.tsx',
  'src/components/AdminDashboard.tsx'
];

const colorMap = {
  'bg-zinc-950': 'bg-white',
  'text-zinc-100': 'text-slate-800',
  'text-zinc-200': 'text-slate-700',
  'text-zinc-400': 'text-slate-500',
  'text-zinc-500': 'text-slate-500',
  'text-zinc-800': 'text-slate-800',
  'text-zinc-900': 'text-slate-900',
  'border-zinc-200': 'border-slate-200',
  'border-zinc-700': 'border-slate-200',
  'border-zinc-800': 'border-slate-200',
  'hover:text-zinc-100': 'hover:text-slate-900',
  'hover:text-zinc-200': 'hover:text-slate-700',
  'hover:bg-zinc-800': 'hover:bg-slate-50',
  'hover:bg-zinc-900': 'hover:bg-slate-50',
  'bg-zinc-800': 'bg-slate-100',
  'bg-zinc-50': 'bg-slate-50',
  'bg-zinc-100': 'bg-slate-100',
  
  'bg-amber-500': 'bg-indigo-600',
  'text-amber-500': 'text-indigo-600',
  'border-amber-500': 'border-indigo-600',
  'border-amber-500/20': 'border-indigo-600/20',
  'shadow-amber-500/10': 'shadow-indigo-600/10',
  'bg-amber-500/10': 'bg-indigo-50',
  
  'hover:border-amber-200': 'hover:border-indigo-200',
  'hover:bg-amber-50': 'hover:bg-indigo-50',
  'hover:text-amber-600': 'hover:text-indigo-600',
  'text-amber-600': 'text-indigo-700',
  'bg-amber-50': 'bg-indigo-50',
  'border-amber-200': 'border-indigo-200',
  'hover:border-amber-500/30': 'hover:border-indigo-200',
};

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Custom manual overrides for specific items:
  
  // In AdminLayout, NGM ADMIN text should be white if background is blue? No, background is now white, so text should be slate-800.
  // The active tab was bg-amber-500 text-zinc-950. 
  // Let's make active tab: bg-indigo-50 text-indigo-600
  content = content.replace(/bg-amber-500 text-zinc-950/g, 'bg-indigo-50 text-indigo-700');
  
  // For buttons that were bg-zinc-950 (like "Manage Agenda", "Add Session", "Message", "Save Session")
  // we want them to be solid indigo: bg-indigo-600 hover:bg-indigo-700 text-white
  content = content.replace(/bg-zinc-950 hover:bg-zinc-800 text-amber-500 border border-amber-500\/20/g, 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border-transparent');
  content = content.replace(/bg-zinc-950 text-amber-500 border border-amber-500\/20 hover:bg-zinc-800/g, 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm');
  
  // In AdminDashboard, the "Manage Agenda" card
  content = content.replace(/bg-zinc-950 p-6 rounded-2xl shadow-xl border border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors group relative overflow-hidden/g, 'bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:bg-indigo-50 transition-colors group relative overflow-hidden');
  content = content.replace(/from-amber-500\/10 to-transparent/g, 'from-indigo-600/5 to-transparent');
  content = content.replace(/text-zinc-400 text-sm font-medium mb-1 relative z-10/g, 'text-slate-500 text-sm font-medium mb-1 relative z-10');
  
  // In AdminLogin, the top banner was bg-zinc-950
  content = content.replace(/<div className="p-8 text-center bg-zinc-950">/g, '<div className="p-8 text-center bg-indigo-600">');
  content = content.replace(/<span className="text-amber-500 font-bold text-xl tracking-wider">NGM<\/span>/g, '<span className="text-white font-bold text-xl tracking-wider">NGM</span>');
  content = content.replace(/bg-amber-500\/10 border border-amber-500\/20 rounded-xl/g, 'bg-white/20 border-white/10 rounded-xl');
  content = content.replace(/text-zinc-400 text-sm/g, 'text-indigo-100 text-sm');
  
  // Apply standard color map
  for (const [key, value] of Object.entries(colorMap)) {
     // use regex with word boundaries where appropriate, or just global replace
     const regex = new RegExp(key.replace(/\//g, '\\/'), 'g');
     content = content.replace(regex, value);
  }
  
  // Some cleanup for AdminLayout sidebar active icon text
  content = content.replace(/text-zinc-950/g, 'text-indigo-700');
  
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Themes fixed');
