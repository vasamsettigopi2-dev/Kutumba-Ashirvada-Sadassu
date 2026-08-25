const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');

layoutCode = layoutCode.replace(
  "export default function AdminLayout({ user, children, currentTab, setCurrentTab, onLogout }: { user: any, children: React.ReactNode, currentTab: string, setCurrentTab: (t: string) => void, onLogout: () => void }) {",
  "export default function AdminLayout({ user, children, currentTab, setCurrentTab, onLogout, syncStatus }: { user: any, children: React.ReactNode, currentTab: string, setCurrentTab: (t: string) => void, onLogout: () => void, syncStatus?: 'synced' | 'syncing' | 'error' }) {"
);

layoutCode = layoutCode.replace(
  "<header className=\"h-16 bg-white/50 backdrop-blur-md border-b border-zinc-200/80 flex items-center px-4 lg:px-8 sticky top-0 z-30\">\n          <button",
  `<header className="h-16 bg-white/50 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center">
            <button`
);

layoutCode = layoutCode.replace(
  "              <Menu className=\"w-5 h-5\" />\n          </button>\n          <div className=\"flex items-center text-[13px] font-medium text-zinc-500 capitalize\">\n            {currentTab}\n          </div>\n        </header>",
  `              <Menu className="w-5 h-5" />
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
        </header>`
);

fs.writeFileSync('src/components/admin/AdminLayout.tsx', layoutCode);

let dashboardCode = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

dashboardCode = dashboardCode.replace(
  "  const [messageType, setMessageType] = useState<'confirmation' | 'reminder_3' | 'reminder_2' | 'reminder_1'>('confirmation');",
  "  const [messageType, setMessageType] = useState<'confirmation' | 'reminder_3' | 'reminder_2' | 'reminder_1'>('confirmation');\n  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('syncing');"
);

dashboardCode = dashboardCode.replace(
  "  const fetchRegistrations = async () => {\n    if (!user) return;\n    setFetching(true);\n    try {",
  "  const fetchRegistrations = async () => {\n    if (!user) return;\n    setFetching(true);\n    setSyncStatus('syncing');\n    try {"
);

dashboardCode = dashboardCode.replace(
  "      if (res.ok) {\n        const data = await res.json();\n        setRegistrations(data.registrations);\n      }",
  "      if (res.ok) {\n        const data = await res.json();\n        setRegistrations(data.registrations);\n        setSyncStatus('synced');\n      } else {\n        setSyncStatus('error');\n      }"
);

dashboardCode = dashboardCode.replace(
  "    } catch (e) {\n      console.error(\"Error fetching registrations\", e);\n    } finally {",
  "    } catch (e) {\n      console.error(\"Error fetching registrations\", e);\n      setSyncStatus('error');\n    } finally {"
);

dashboardCode = dashboardCode.replace(
  "<AdminLayout user={user} currentTab={currentTab} setCurrentTab={setCurrentTab} onLogout={handleLogout}>",
  "<AdminLayout user={user} currentTab={currentTab} setCurrentTab={setCurrentTab} onLogout={handleLogout} syncStatus={syncStatus}>"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', dashboardCode);
