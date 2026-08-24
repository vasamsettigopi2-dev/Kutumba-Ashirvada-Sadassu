const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AgendaView.tsx', 'utf8');

const regex = /<button[\s]*onClick=\{handleSave\}[\s]*className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 font-medium text-\[13px\] transition-colors flex items-center shadow-sm"[\s]*>[\s]*Save Session[\s]*<\/button>/g;

content = content.replace(regex, `<button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 font-medium text-[13px] transition-colors flex items-center shadow-sm disabled:opacity-70"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              ) : null}
              {isSaving ? 'Saving...' : 'Save Session'}
            </button>`);

fs.writeFileSync('src/components/admin/AgendaView.tsx', content, 'utf8');
