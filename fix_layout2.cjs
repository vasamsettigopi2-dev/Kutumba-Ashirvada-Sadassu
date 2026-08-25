const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');

const headerRegex = /<header[\s\S]*?<\/header>/;

const newHeader = `<header className="h-16 bg-white/50 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              className="lg:hidden text-zinc-500 hover:text-zinc-900 p-2 -ml-2 mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center text-[13px] font-medium text-zinc-500 capitalize">
              {currentTab}
            </div>
          </div>
          {syncStatus && (
            <div className="flex items-center gap-2 text-[12px] font-medium px-2.5 py-1 rounded-full bg-white border border-zinc-200 shadow-sm">
              {syncStatus === 'syncing' && (
                <>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-zinc-500">Syncing...</span>
                </>
              )}
              {syncStatus === 'synced' && (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-zinc-600">Synced with Firestore</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-zinc-600">Sync Error</span>
                </>
              )}
            </div>
          )}
        </header>`;

layoutCode = layoutCode.replace(headerRegex, newHeader);

fs.writeFileSync('src/components/admin/AdminLayout.tsx', layoutCode);
