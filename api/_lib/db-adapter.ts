import { getDb } from './firebase-admin';
import fs from 'fs';
import path from 'path';

// In-memory / file persistent fallback store for local development
interface InMemoryStore {
  registrations: any[];
  counters: { registrations: number };
  templates: any;
  agenda: any[];
}

const LOCAL_DB_PATH = path.resolve(process.cwd(), 'data', 'local_db.json');

const defaultStore: InMemoryStore = {
  registrations: [],
  counters: { registrations: 0 },
  templates: {
    event_start_date: '2026-10-16',
    venue_name: 'డా. దయానంద్ వడ్డేపల్లి ఫంక్షన్ హాల్స్ (Dr. Dayanand Vaddepalli Function Halls), Near Old Bus Stand, Siddipet',
    confirmation_text: `🙏 *ప్రైజ్ ది లార్డ్ / Praise the Lord* 🙏\n*Dear {{name}} Garu,*\n\n✨ *3వ వార్షిక కుటుంబ ఆశీర్వాద సదస్సు 2026* కొరకు మీ రిజిస్ట్రేషన్ విజయవంతంగా పూర్తయింది.\n✨ Your registration for *3rd Annual Kutumba Ashirvada Sadassu 2026* is confirmed!\n\n━━━━━━━━━━━━━━━━━━━━\n🎫 *REGISTRATION PASS / ప్రవేశ వివరాలు:*\n👤 *Name:* {{name}}\n🆔 *Unique Code:* *{{code}}*\n📅 *Selected Dates:* {{dates}}\n📍 *Venue:* డా. దయానంద్ వడ్డేపల్లి ఫంక్షన్ హాల్స్, సిద్దిపేట\n⏰ *Timings:*\n  • Classes: 10:00 AM - 04:00 PM\n  • Revival Meetings: 06:00 PM - 09:00 PM\n━━━━━━━━━━━━━━━━━━━━\n\n⚠️ *ముఖ్య గమనిక:* దయచేసి ప్రవేశం మరియు భోజన వసతి కోసం మీ రిజిస్ట్రేషన్ కోడ్ *{{code}}* ను భద్రపరచుకోండి.\n\n🕊️ *ప్రార్థించండి మరియు పాల్గొనండి! (Pray and Participate!)*\nమీ కుటుంబ సమేతంగా విచ్చేసి దైవాశీర్వాదాలు పొందండి.\n\n— *Next Generation Ministries (NGM)*\n📞 Help Desk: +91 9989871148 / +91 9010077995`,
    reminder_7_text: `🔔 *రిమైండర్ / 7 DAYS TO GO* 🔔\n*Dear {{name}} Garu,*\n\n⏳ *కుటుంబ ఆశీర్వాద సదస్సు 2026 ప్రారంభానికి ఇంకా 7 రోజులు మాత్రమే మిగిలి ఉన్నాయి! (Just 7 Days Left!)*\n\n━━━━━━━━━━━━━━━━━━━━\n🎫 *Pass Code:* *{{code}}*\n👤 *Attendee:* {{name}}\n📅 *Your Dates:* {{dates}}\n📍 *Venue:* డా. దయానంద్ వడ్డేపల్లి ఫంక్షన్ హాల్స్, సిద్దిపేట\n━━━━━━━━━━━━━━━━━━━━\n\n🕊️ *ప్రార్థించండి మరియు పాల్గొనండి! (Pray and Participate!)*\nదేవుని గొప్ప కార్యాలను అనుభవించడానికి సిద్ధపడండి.\n\n— *Next Generation Ministries*`,
    reminder_6_text: `🔔 *రిమైండర్ / 6 DAYS TO GO* 🔔\n*Dear {{name}} Garu,*\n\n⏳ *కుటుంబ ఆశీర్వాద సదస్సు ప్రారంభానికి ఇంకా 6 రోజులు మాత్రమే! (6 Days to go!)*\n\n━━━━━━━━━━━━━━━━━━━━\n🎫 *Pass Code:* *{{code}}*\n👤 *Attendee:* {{name}}\n📅 *Dates:* {{dates}}\n📍 *Venue:* Dr. Dayanand Vaddepalli Function Halls, Siddipet\n━━━━━━━━━━━━━━━━━━━━\n\n🕊️ *ప్రార్థించండి మరియు పాల్గొనండి! (Pray and Participate!)*\n— *Next Generation Ministries*`,
    reminder_5_text: `🔔 *రిమైండర్ / 5 DAYS TO GO* 🔔\n*Dear {{name}} Garu,*\n\n⏳ *కుటుంబ ఆశీర్వాద సదస్సు ప్రారంభానికి ఇంకా 5 రోజులు మాత్రమే! (5 Days to go!)*\n\n━━━━━━━━━━━━━━━━━━━━\n🎫 *Pass Code:* *{{code}}*\n👤 *Attendee:* {{name}}\n📅 *Dates:* {{dates}}\n📍 *Venue:* Dr. Dayanand Vaddepalli Function Halls, Siddipet\n━━━━━━━━━━━━━━━━━━━━\n\n🕊️ *ప్రార్థించండి మరియు పాల్గొనండి! (Pray and Participate!)*\n— *Next Generation Ministries*`,
    reminder_4_text: `🔔 *రిమైండర్ / 4 DAYS TO GO* 🔔\n*Dear {{name}} Garu,*\n\n⏳ *కుటుంబ ఆశీర్వాద సదస్సు ప్రారంభానికి ఇంకా 4 రోజులు మాత్రమే! (4 Days to go!)*\n\n━━━━━━━━━━━━━━━━━━━━\n🎫 *Pass Code:* *{{code}}*\n👤 *Attendee:* {{name}}\n📅 *Dates:* {{dates}}\n📍 *Venue:* Dr. Dayanand Vaddepalli Function Halls, Siddipet\n━━━━━━━━━━━━━━━━━━━━\n\n🕊️ *ప్రార్థించండి మరియు పాల్గొనండి! (Pray and Participate!)*\n— *Next Generation Ministries*`,
    reminder_3_text: `🔔 *రిమైండర్ / 3 DAYS TO GO* 🔔\n*Dear {{name}} Garu,*\n\n⏳ *కుటుంబ ఆశీర్వాద సదస్సు ప్రారంభానికి ఇంకా కేవలం 3 రోజులు మాత్రమే! (Just 3 Days to go!)*\n\n━━━━━━━━━━━━━━━━━━━━\n🎫 *Pass Code:* *{{code}}*\n👤 *Name:* {{name}}\n📅 *Attending Dates:* {{dates}}\n📍 *Venue:* డా. దయానంద్ వడ్డేపల్లి ఫంక్షన్ హాల్స్, సిద్దిపేట\n⏰ *Morning:* 10 AM - 4 PM | *Evening:* 6 PM - 9 PM\n━━━━━━━━━━━━━━━━━━━━\n\n🕊️ *ప్రార్థించండి మరియు పాల్గొనండి! (Pray and Participate!)*\nమీ కుటుంబ ఆశీర్వాదం కొరకు తప్పక రండి.\n\n— *Next Generation Ministries*`,
    reminder_2_text: `🔔 *రిమైండర్ / 2 DAYS TO GO* 🔔\n*Dear {{name}} Garu,*\n\n⏳ *కుటుంబ ఆశీర్వాద సదస్సు ప్రారంభానికి ఇంకా 2 రోజులు మాత్రమే! (Only 2 Days Left!)*\n\n━━━━━━━━━━━━━━━━━━━━\n🎫 *Pass Code:* *{{code}}*\n👤 *Name:* {{name}}\n📅 *Attending Dates:* {{dates}}\n📍 *Venue:* Dr. Dayanand Vaddepalli Function Halls, Siddipet\n━━━━━━━━━━━━━━━━━━━━\n\n🕊️ *ప్రార్థించండి మరియు పాల్గొనండి! (Pray and Participate!)*\n— *Next Generation Ministries*`,
    reminder_1_text: `🔥 *అత్యంత ముఖ్యమైన రిమైండర్ / TOMORROW!* 🔥\n*Dear {{name}} Garu,*\n\n🌟 *కుటుంబ ఆశీర్వాద సదస్సు 2026 రేపే ప్రారంభం! (Event Begins TOMORROW!)*\n\n━━━━━━━━━━━━━━━━━━━━\n🎫 *ENTRY PASS CODE:* *{{code}}*\n👤 *Name:* {{name}}\n📅 *Your Dates:* {{dates}}\n📍 *Venue:* డా. దయానంద్ వడ్డేపల్లి ఫంక్షన్ హాల్స్, సిద్దిపేట\n⏰ *Opening Session:* రేపు ఉదయం 10:00 గంటలకు\n━━━━━━━━━━━━━━━━━━━━\n\n🕊️ *ప్రార్థించండి మరియు కుటుంబ సమేతంగా పాల్గొనండి! (Pray and Participate with your family!)*\n\n— *Next Generation Ministries (NGM)*`,
    reminder_0_text: `🎉 *సదస్సు నేడే ప్రారంభం / TODAY!* 🎉\n*Dear {{name}} Garu,*\n\n🌟 *కుటుంబ ఆశీర్వాద సదస్సు 2026 నేడు ప్రారంభం అవుతోంది! (Event starts TODAY!)*\n\n━━━━━━━━━━━━━━━━━━━━\n🎫 *YOUR CODE:* *{{code}}*\n📍 *Venue:* డా. దయానంద్ వడ్డేపల్లి ఫంక్షన్ హాల్స్, సిద్దిపేట\n⏰ *Session starts:* 10:00 AM\n━━━━━━━━━━━━━━━━━━━━\n\n🕊️ *ప్రార్థించండి మరియు పాల్గొనండి! (Pray and Participate!)*\n— *Next Generation Ministries*`
  },
  agenda: [
    {
      id: 'day1-1',
      date: '2026-10-16',
      time: '10:00 AM - 01:00 PM',
      title: 'Opening Family Dedication & Prayer',
      speaker: 'Bro. P. Sunil Kumar Garu',
      session_type: 'Family Life',
      target_audience: 'All'
    },
    {
      id: 'day1-2',
      date: '2026-10-16',
      time: '06:00 PM - 09:00 PM',
      title: 'Public Blessing Evening Revival',
      speaker: 'Bro. P. Sunil Kumar Garu',
      session_type: 'Revival Meeting',
      target_audience: 'Public'
    }
  ]
};

function loadLocalStore(): InMemoryStore {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
      return {
        ...defaultStore,
        ...data,
        counters: { ...defaultStore.counters, ...(data.counters || {}) },
        templates: { ...defaultStore.templates, ...(data.templates || {}) }
      };
    }
  } catch (e) {
    console.warn('Could not load local_db.json, using defaults:', e);
  }
  return { ...defaultStore };
}

let memoryStore: InMemoryStore | null = null;

function getMemoryStore(): InMemoryStore {
  if (!memoryStore) {
    memoryStore = loadLocalStore();
  }
  return memoryStore;
}

function persistLocalStore() {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(getMemoryStore(), null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save to local_db.json:', e);
  }
}

let useMemoryFallback = false;

// High-speed In-Memory Cache with TTL for instant response times
interface CacheItem<T> {
  data: T;
  time: number;
}

let regCache: CacheItem<any[]> | null = null;
let agendaCache: CacheItem<any[]> | null = null;
let templatesCache: CacheItem<any> | null = null;
const CACHE_TTL_MS = 15_000; // 15 seconds fast cache

function invalidateCaches() {
  regCache = null;
  agendaCache = null;
  templatesCache = null;
}

export const dataService = {
  async findRegistrationByPhone(phone: string) {
    const db = await getDb();
    if (!useMemoryFallback && db) {
      try {
        const snap = await db.collection('registrations').where('phone', '==', phone).limit(1).get();
        if (!snap.empty) {
          const d = snap.docs[0];
          return { id: d.id, ...d.data() };
        }
        return null;
      } catch (err: any) {
        console.warn('Firestore query failed, switching to local store:', err.message);
        useMemoryFallback = true;
      }
    }
    return getMemoryStore().registrations.find(r => r.phone === phone) || null;
  },

  async findRegistrationByCode(code: string) {
    const db = await getDb();
    if (!useMemoryFallback && db) {
      try {
        const snap = await db.collection('registrations').where('unique_code', '==', code).limit(1).get();
        if (!snap.empty) {
          const d = snap.docs[0];
          return { id: d.id, ...d.data() };
        }
        return null;
      } catch (err: any) {
        useMemoryFallback = true;
      }
    }
    return getMemoryStore().registrations.find(r => r.unique_code === code) || null;
  },

  async createRegistration(regData: any) {
    invalidateCaches();
    const db = await getDb();
    if (!useMemoryFallback && db) {
      try {
        const counterRef = db.collection('counters').doc('registrations');
        return await db.runTransaction(async (t: any) => {
          const counterDoc = await t.get(counterRef);
          let nextCount = 1;
          if (counterDoc.exists) {
            nextCount = (counterDoc.data()?.count || 0) + 1;
          }
          const padded = nextCount.toString().padStart(4, '0');
          const unique_code = `NGM2026-${padded}`;
          const newDocRef = db.collection('registrations').doc();
          const record = { ...regData, unique_code };
          t.set(counterRef, { count: nextCount }, { merge: true });
          t.set(newDocRef, record);
          return { id: newDocRef.id, unique_code, record };
        });
      } catch (err: any) {
        console.warn('Firestore transaction failed, saving to local store:', err.message);
        useMemoryFallback = true;
      }
    }

    // Local fallback
    getMemoryStore().counters.registrations += 1;
    const padded = getMemoryStore().counters.registrations.toString().padStart(4, '0');
    const unique_code = `NGM2026-${padded}`;
    const id = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const record = { id, ...regData, unique_code };
    getMemoryStore().registrations.unshift(record);
    persistLocalStore();
    return { id, unique_code, record };
  },

  async getAllRegistrations(forceFresh = false) {
    if (!forceFresh && regCache && (Date.now() - regCache.time < CACHE_TTL_MS)) {
      return regCache.data;
    }

    const db = await getDb();
    if (!useMemoryFallback && db) {
      try {
        const snap = await db.collection('registrations').get();
        const docs = snap.docs
          .map((d: any) => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        regCache = { data: docs, time: Date.now() };
        return docs;
      } catch (err: any) {
        useMemoryFallback = true;
      }
    }
    const local = [...getMemoryStore().registrations].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    regCache = { data: local, time: Date.now() };
    return local;
  },

  async updateRegistration(id: string, updateData: any) {
    invalidateCaches();
    const db = await getDb();
    if (!useMemoryFallback && db && !id.startsWith('local_')) {
      try {
        await db.collection('registrations').doc(id).update(updateData);
        return true;
      } catch (err: any) {
        useMemoryFallback = true;
      }
    }
    const idx = getMemoryStore().registrations.findIndex(r => r.id === id);
    if (idx !== -1) {
      getMemoryStore().registrations[idx] = { ...getMemoryStore().registrations[idx], ...updateData };
      persistLocalStore();
      return true;
    }
    return false;
  },

  async deleteRegistration(id: string, permanent = false, adminEmail = 'admin') {
    invalidateCaches();
    const db = await getDb();
    if (permanent) {
      // Permanent removal from Firestore & local DB
      if (!useMemoryFallback && db && !id.startsWith('local_')) {
        try {
          await db.collection('registrations').doc(id).delete();
        } catch (err: any) {
          useMemoryFallback = true;
        }
      }
      getMemoryStore().registrations = getMemoryStore().registrations.filter(r => r.id !== id);
      persistLocalStore();
      return true;
    } else {
      // Soft delete: Move to Deleted Bin
      const updateData = {
        deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: adminEmail
      };
      return await this.updateRegistration(id, updateData);
    }
  },

  async restoreRegistration(id: string) {
    invalidateCaches();
    const updateData = {
      deleted: false,
      restored_at: new Date().toISOString()
    };
    return await this.updateRegistration(id, updateData);
  },

  async emptyBin(adminEmail = 'admin') {
    invalidateCaches();
    const db = await getDb();
    const deletedDocs = getMemoryStore().registrations.filter(r => r.deleted);
    if (!useMemoryFallback && db) {
      try {
        for (const doc of deletedDocs) {
          if (doc.id && !doc.id.startsWith('local_')) {
            await db.collection('registrations').doc(doc.id).delete();
          }
        }
      } catch (e) {
        console.warn('Error emptying cloud bin:', e);
      }
    }
    getMemoryStore().registrations = getMemoryStore().registrations.filter(r => !r.deleted);
    persistLocalStore();
    return true;
  },

  async getTemplates() {
    if (templatesCache && (Date.now() - templatesCache.time < CACHE_TTL_MS)) {
      return templatesCache.data;
    }

    const db = await getDb();
    if (!useMemoryFallback && db) {
      try {
        const doc = await db.collection('settings').doc('messageTemplates').get();
        if (doc.exists) {
          const data = doc.data();
          templatesCache = { data, time: Date.now() };
          return data;
        }
      } catch (err: any) {
        useMemoryFallback = true;
      }
    }
    templatesCache = { data: getMemoryStore().templates, time: Date.now() };
    return getMemoryStore().templates;
  },

  async saveTemplates(templates: any) {
    invalidateCaches();
    const db = await getDb();
    if (!useMemoryFallback && db) {
      try {
        await db.collection('settings').doc('messageTemplates').set(templates, { merge: true });
        return true;
      } catch (err: any) {
        useMemoryFallback = true;
      }
    }
    getMemoryStore().templates = { ...getMemoryStore().templates, ...templates };
    persistLocalStore();
    return true;
  },

  async getAgenda() {
    if (agendaCache && (Date.now() - agendaCache.time < CACHE_TTL_MS)) {
      return agendaCache.data;
    }

    const db = await getDb();
    if (!useMemoryFallback && db) {
      try {
        const snap = await db.collection('agenda').get();
        if (!snap.empty) {
          const data = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
          agendaCache = { data, time: Date.now() };
          return data;
        }
      } catch (err: any) {
        useMemoryFallback = true;
      }
    }
    agendaCache = { data: getMemoryStore().agenda, time: Date.now() };
    return getMemoryStore().agenda;
  },

  async addAgenda(session: any) {
    invalidateCaches();
    const db = await getDb();
    if (!useMemoryFallback && db) {
      try {
        const docRef = await db.collection('agenda').add(session);
        return docRef.id;
      } catch (err: any) {
        useMemoryFallback = true;
      }
    }
    const id = 'agenda_' + Date.now();
    getMemoryStore().agenda.push({ id, ...session });
    persistLocalStore();
    return id;
  },

  async updateAgenda(id: string, session: any) {
    invalidateCaches();
    const db = await getDb();
    if (!useMemoryFallback && db && !id.startsWith('agenda_')) {
      try {
        await db.collection('agenda').doc(id).update(session);
        return true;
      } catch (err: any) {
        useMemoryFallback = true;
      }
    }
    const idx = getMemoryStore().agenda.findIndex(a => a.id === id);
    if (idx !== -1) {
      getMemoryStore().agenda[idx] = { ...getMemoryStore().agenda[idx], ...session };
      persistLocalStore();
      return true;
    }
    return false;
  },

  async deleteAgenda(id: string) {
    invalidateCaches();
    const db = await getDb();
    if (!useMemoryFallback && db && !id.startsWith('agenda_')) {
      try {
        await db.collection('agenda').doc(id).delete();
        return true;
      } catch (err: any) {
        useMemoryFallback = true;
      }
    }
    getMemoryStore().agenda = getMemoryStore().agenda.filter(a => a.id !== id);
    persistLocalStore();
    return true;
  }
};
