import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuNlsnUzK4Kbg8aU405qUM79FapFBb92U",
  projectId: "quadratic-mix-xt8c4",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-c8aac346-e332-4d12-ac58-017b24500d7f");

const sessions = [
  { day: 'Day 1', date: '2026-10-16', startTime: '18:00', endTime: '21:00', title: 'Opening Ceremony & Welcome Worship', speaker: 'Pastor John', ytLiveLink: '', notesLink: '' },
  { day: 'Day 2', date: '2026-10-17', startTime: '09:00', endTime: '12:00', title: 'Morning Worship & Message', speaker: 'Rev. Samuel', ytLiveLink: '', notesLink: '' },
  { day: 'Day 2', date: '2026-10-17', startTime: '14:00', endTime: '16:00', title: 'Youth Workshop: Walking in Faith', speaker: 'Brother David', ytLiveLink: '', notesLink: '' },
  { day: 'Day 3', date: '2026-10-18', startTime: '10:00', endTime: '13:00', title: 'Sunday Special Service', speaker: 'Pastor John', ytLiveLink: '', notesLink: '' },
  { day: 'Day 4', date: '2026-10-19', startTime: '10:00', endTime: '12:00', title: 'Leadership Seminar', speaker: 'Rev. Samuel', ytLiveLink: '', notesLink: '' },
  { day: 'Day 5', date: '2026-10-20', startTime: '18:00', endTime: '21:00', title: 'Closing Ceremony & Thanksgiving', speaker: 'Pastor John', ytLiveLink: '', notesLink: '' },
];

async function seed() {
  for (const session of sessions) {
    await addDoc(collection(db, 'agenda'), session);
  }
  console.log("Seeded!");
  process.exit(0);
}
seed().catch(console.error);
