import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAuPaAlm1gmYkE78lUtM-oWowwKYgKhcVQ",
  projectId: "ai-studio-c8aac346-e332-4d12-ac58-017b24500d7f",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-c8aac346-e332-4d12-ac58-017b24500d7f");

async function check() {
  const snapshot = await getDocs(collection(db, 'agenda'));
  console.log("Agenda count:", snapshot.size);
  snapshot.forEach(doc => console.log(doc.data()));
  process.exit(0);
}
check().catch(console.error);
