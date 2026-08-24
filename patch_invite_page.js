const fs = require('fs');

let content = fs.readFileSync('src/components/InvitePage.tsx', 'utf8');

// 1. Add imports for Firebase
const importStatement = `
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Video, FileText } from 'lucide-react';
`;

// Insert after the last import
content = content.replace(/(import .*;\n)(?=\s*export default function)/s, `$1${importStatement}\n`);

// 2. Add agenda state inside InvitePage
const stateStatement = `
  const [agenda, setAgenda] = useState<any[]>([]);

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const q = query(collection(db, 'agenda'), orderBy('date'), orderBy('startTime'));
        const snapshot = await getDocs(q);
        setAgenda(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error("Error fetching agenda", e);
      }
    };
    fetchAgenda();
  }, []);
`;

content = content.replace(/(const \[expandedDay, setExpandedDay\] = useState<number \| null>\(null\);)/, `$1\n${stateStatement}`);

// 3. Replace the Expanded Timetable section with dynamic rendering
const expandedTimetableRegex = /\{\/\* Expanded Timetable \*\/\}.*?<\/AnimatePresence>/s;
const newExpandedTimetable = `{/* Expanded Timetable */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-2 border-t border-zinc-800/50 flex flex-col gap-3">
                          {(() => {
                            const daySessions = agenda.filter(s => s.date === \`2026-10-\${item.date}\`);
                            if (daySessions.length === 0) {
                              return (
                                <div className="text-zinc-500 text-xs text-center py-4">
                                  {lang === 'te' ? 'ఈ రోజుకి ఇంకా తరగతులు నిర్ణయించబడలేదు' : 'No sessions scheduled yet for this day.'}
                                </div>
                              );
                            }
                            return daySessions.map((session, idx) => (
                              <div key={session.id || idx} className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 flex flex-col gap-2 relative group/session hover:border-amber-500/30 transition-colors">
                                <div className="flex items-start justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-zinc-200 font-medium text-sm">{session.title}</span>
                                    {session.speaker && <span className="text-zinc-500 text-xs mt-0.5">{session.speaker}</span>}
                                  </div>
                                  <div className="text-amber-500/80 font-mono text-xs whitespace-nowrap ml-2">
                                    {session.startTime} - {session.endTime}
                                  </div>
                                </div>
                                {(session.ytLiveLink || session.notesLink) && (
                                  <div className="flex flex-wrap gap-2 mt-1.5 pt-2 border-t border-zinc-800/50">
                                    {session.ytLiveLink && (
                                      <a href={session.ytLiveLink} target="_blank" rel="noreferrer" className="flex items-center text-[10px] font-medium text-red-400 bg-red-400/10 px-2.5 py-1.5 rounded-md hover:bg-red-400/20 transition-colors">
                                        <Video className="w-3.5 h-3.5 mr-1.5" /> {lang === 'te' ? 'లైవ్ చూడండి' : 'Watch Live'}
                                      </a>
                                    )}
                                    {session.notesLink && (
                                      <a href={session.notesLink} target="_blank" rel="noreferrer" className="flex items-center text-[10px] font-medium text-blue-400 bg-blue-400/10 px-2.5 py-1.5 rounded-md hover:bg-blue-400/20 transition-colors">
                                        <FileText className="w-3.5 h-3.5 mr-1.5" /> {lang === 'te' ? 'నోట్స్' : 'Class Notes'}
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            ));
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>`;

content = content.replace(expandedTimetableRegex, newExpandedTimetable);

fs.writeFileSync('src/components/InvitePage.tsx', content, 'utf8');
console.log('InvitePage patched successfully!');
