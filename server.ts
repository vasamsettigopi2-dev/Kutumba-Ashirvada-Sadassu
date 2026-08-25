import express from 'express';
import jwt from 'jsonwebtoken';

import path from 'path';

import { db, auth } from './src/lib/firebase-admin';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
// Note: In a real Cloud Functions environment, WhatsApp integration uses fetch/axios.
// We simulate the required Meta API call using standard fetch.

const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Basic health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Unique Code Generation & Registration endpoint
  // Using Firestore transaction to ensure uniqueness and prevent duplicates
  app.post('/api/register', async (req, res) => {
    try {
      const { name, phone, email, church_city, category, days_attending, family_size, dietary_pref } = req.body;

      if (!name || !phone || !days_attending) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check for duplicate phone number first (idempotency)
      const existingQuery = await db.collection('registrations').where('phone', '==', phone).limit(1).get();
      if (!existingQuery.empty) {
        const existingDoc = existingQuery.docs[0];
        return res.json({ 
          success: true, 
          message: 'Already registered',
          unique_code: existingDoc.data().unique_code,
          isDuplicate: true 
        });
      }

      const counterRef = db.collection('counters').doc('registrations');
      
      const result = await db.runTransaction(async (t) => {
        const counterDoc = await t.get(counterRef);
        let nextCount = 1;
        if (counterDoc.exists) {
          nextCount = (counterDoc.data()?.count || 0) + 1;
        }

        const paddedCount = nextCount.toString().padStart(4, '0');
        const uniqueCode = `NGM2026-${paddedCount}`;

        // Create new registration doc
        const newRegRef = db.collection('registrations').doc();
        const regData = {
          name,
          phone,
          email: email || '',
          church_city: church_city || '',
          category,
          days_attending,
          family_size: Number(family_size) || 1,
          dietary_pref: dietary_pref || 'Any',
          unique_code: uniqueCode,
          created_at: new Date(),
          whatsapp_sent: false,
          email_sent: false,
          reminder_3_sent: false,
          reminder_2_sent: false,
          reminder_1_sent: false,
          checked_in: false,
          checked_in_at: null
        };

        t.set(counterRef, { count: nextCount }, { merge: true });
        t.set(newRegRef, regData);

        return { uniqueCode, regId: newRegRef.id, regData };
      });

      // Attempt to send WhatsApp and Email asynchronously so we don't block response
      sendConfirmation(result.regId, result.regData).catch(err => console.error("Post-registration notification error:", err));

      res.json({ success: true, unique_code: result.uniqueCode, isDuplicate: false });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to process registration' });
    }
  });


  // Secure JWT Secret
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-demo';

  // Custom Admin Login Route

  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if ((username === 'admin1' && password === 'admin1') || 
        (username === 'admin2' && password === 'admin2') ||
        (username === 'admin@demo.com' && password === 'admin123')) {
      
      try {
        if (!auth) throw new Error("Firebase Admin Auth is not initialized. Check FIREBASE_SERVICE_ACCOUNT env var.");
        const firebaseToken = await auth.createCustomToken(username);
        const token = jwt.sign({ email: username, uid: username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, firebaseToken, email: username });
      } catch (e) {
        console.error("Firebase custom token error:", e);
        res.status(500).json({ error: 'Failed to generate token: ' + (e.message || e) });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });


  // Custom Admin middleware using JWT
  const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const token = authHeader.split('Bearer ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };


  app.get('/api/admin/registrations', verifyAdmin, async (req, res) => {
    try {
      const snapshot = await db.collection('registrations').orderBy('created_at', 'desc').get();
      const registrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({ registrations });
    } catch (error) {
      console.error('Fetch registrations error:', error);
      res.status(500).json({ error: 'Failed to fetch' });
    }
  });

  app.post('/api/admin/checkin', verifyAdmin, async (req, res) => {
    try {
      const { unique_code } = req.body;
      const snapshot = await db.collection('registrations').where('unique_code', '==', unique_code).limit(1).get();
      if (snapshot.empty) return res.status(404).json({ error: 'Not found' });
      
      const doc = snapshot.docs[0];
      if (doc.data().checked_in) {
         return res.json({ success: true, message: 'Already checked in', doc: doc.data() });
      }

      await doc.ref.update({
        checked_in: true,
        checked_in_at: new Date()
      });
      res.json({ success: true, message: 'Check-in successful' });
    } catch (error) {
      res.status(500).json({ error: 'Check-in failed' });
    }
  });

  app.post('/api/admin/update_whatsapp_status', verifyAdmin, async (req, res) => {
    try {
      const { id, messageType, status } = req.body;
      const adminEmail = (req as any).user.email;
      
      const doc = await db.collection('registrations').doc(id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Not found' });
      
      const updateData: any = {};
      updateData[`whatsapp_status.${messageType}`] = {
        status,
        timestamp: new Date().toISOString(),
        admin_email: adminEmail
      };
      
      await doc.ref.update(updateData);
      res.json({ success: true, message: 'Status updated' });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  
app.get('/api/admin/seed-agenda', async (req, res) => {
  const sessions = [
    { day: 'Day 1', date: '2026-10-16', startTime: '18:00', endTime: '21:00', title: 'Opening Ceremony & Welcome Worship', speaker: 'Pastor John', ytLiveLink: '', notesLink: '' },
    { day: 'Day 2', date: '2026-10-17', startTime: '09:00', endTime: '12:00', title: 'Morning Worship & Message', speaker: 'Rev. Samuel', ytLiveLink: '', notesLink: '' },
    { day: 'Day 2', date: '2026-10-17', startTime: '14:00', endTime: '16:00', title: 'Youth Workshop: Walking in Faith', speaker: 'Brother David', ytLiveLink: '', notesLink: '' },
    { day: 'Day 3', date: '2026-10-18', startTime: '10:00', endTime: '13:00', title: 'Sunday Special Service', speaker: 'Pastor John', ytLiveLink: '', notesLink: '' },
    { day: 'Day 4', date: '2026-10-19', startTime: '10:00', endTime: '12:00', title: 'Leadership Seminar', speaker: 'Rev. Samuel', ytLiveLink: '', notesLink: '' },
    { day: 'Day 5', date: '2026-10-20', startTime: '18:00', endTime: '21:00', title: 'Closing Ceremony & Thanksgiving', speaker: 'Pastor John', ytLiveLink: '', notesLink: '' },
  ];
  
  try {
    for (const session of sessions) {
      await db.collection('agenda').add(session);
    }
    res.json({ success: true, message: 'Agenda seeded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

  
  // Agenda Admin Routes

  app.get('/api/admin/agenda', async (req, res) => {
    try {
      const snapshot = await db.collection('agenda').get();
      const agenda = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({ agenda });
    } catch (error) {
      console.error('Fetch agenda error:', error);
      res.status(500).json({ error: 'Failed to fetch agenda' });
    }
  });

  app.post('/api/admin/agenda', verifyAdmin, async (req, res) => {
    try {
      const docRef = await db.collection('agenda').add(req.body);
      res.json({ success: true, id: docRef.id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to add agenda session: ' + e.message });
    }
  });

  app.put('/api/admin/agenda/:id', verifyAdmin, async (req, res) => {
    try {
      await db.collection('agenda').doc(req.params.id).update(req.body);
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update agenda session: ' + e.message });
    }
  });

  app.delete('/api/admin/agenda/:id', verifyAdmin, async (req, res) => {
    try {
      await db.collection('agenda').doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete agenda session' });
    }
  });

  app.post('/api/admin/resend', verifyAdmin, async (req, res) => {
    try {
      const { id, messageType } = req.body;
      const doc = await db.collection('registrations').doc(id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Not found' });
      
      const regData = doc.data();
      
      if (messageType === 'confirmation') {
        await sendConfirmation(doc.id, regData);
      } else if (messageType && messageType.startsWith('reminder')) {
        // Send manual reminder
        const waToken = process.env.WHATSAPP_TOKEN;
        const waPhoneId = process.env.WHATSAPP_PHONE_ID;
        
        if (waToken && waPhoneId && regData.phone) {
          const response = await fetch(`https://graph.facebook.com/v17.0/${waPhoneId}/messages`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${waToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: regData.phone.replace(/\D/g, ''),
              type: "template",
              template: {
                name: "daily_reminder",
                language: { code: "te" }
              }
            })
          });
          if (response.ok) {
             await doc.ref.update({ [messageType]: true, [`whatsapp_status.${messageType}`]: { status: 'sent', timestamp: new Date().toISOString() } });
          } else {
             await doc.ref.update({ [`whatsapp_status.${messageType}`]: { status: 'failed', timestamp: new Date().toISOString() } });
          }
        } else {
          // Simulated dev mode
          await doc.ref.update({ [messageType]: true, [`whatsapp_status.${messageType}`]: { status: 'sent', timestamp: new Date().toISOString() } });
        }
      } else {
        await sendConfirmation(doc.id, regData);
      }
      
      res.json({ success: true, message: 'Message sent' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Resend failed' });
    }
  });
      

  // Cloud Scheduler Endpoint target
  app.post('/api/cron/reminders', async (req, res) => {
    // Basic shared secret check to ensure only Cloud Scheduler calls this
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'local-cron-secret'}`) {
       return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await processDailyReminders();
      res.json({ success: true });
    } catch (e) {
      console.error('Cron error:', e);
      res.status(500).json({ error: 'Cron failed' });
    }
  });

  // Background cron to trigger daily reminders if running locally/continuously
  if (!process.env.VERCEL) {
  cron.schedule('0 9 * * *', () => {
    console.log('Running daily reminder cron...');
    processDailyReminders().catch(console.error);
  });
}


// Vite middleware for development and static serving for production
if (!process.env.VERCEL) {
  (async () => {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(distPath, 'index.html'));
        }
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })();
}

export default app;



// Background Task Processors
async function sendConfirmation(regId: string, regData: any) {
  let whatsappSent = false;
  let emailSent = false;

  // 1. WhatsApp Notification via Meta API
  const waToken = process.env.WHATSAPP_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_ID;
  if (waToken && waPhoneId) {
    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${waToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: regData.phone.replace(/\D/g, ''),
          type: "template",
          template: {
            name: "registration_confirmation",
            language: { code: "te" }, // or "en"
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: regData.name },
                  { type: "text", text: regData.unique_code },
                  { type: "text", text: "Kutumba Ashirvada Sadassu, Oct 16-20 2026" },
                  { type: "text", text: "Dr. Dayanand Vaddepalli Function Hall, Siddipet" }
                ]
              }
            ]
          }
        })
      });
      if (response.ok) whatsappSent = true;
      else {
        console.error('WA Send Failed', await response.text());
        await logFailedSend(regId, 'whatsapp', 'API Error');
      }
    } catch (e) {
      console.error('WA exception', e);
      await logFailedSend(regId, 'whatsapp', 'Exception');
    }
  } else {
    console.log(`[SIMULATED DEV MODE] WhatsApp message sent successfully to ${regData.phone} with code ${regData.unique_code}`);
    whatsappSent = true; // Simulate success
  }

  // 2. Email Fallback
  if (!whatsappSent && regData.email) {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail', // or configured service
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        await transporter.sendMail({
          from: '"Next Generation Ministries" <noreply@nextgenerationministries.org>',
          to: regData.email,
          subject: "Your Registration - Kutumba Ashirvada Sadassu 2026",
          html: `<p>Dear ${regData.name},</p><p>You are registered! Your code is <strong>${regData.unique_code}</strong>.</p>`
        });
        emailSent = true;
      } catch (e) {
        console.error('Email exception', e);
        await logFailedSend(regId, 'email', 'Exception');
      }
    } else {
      console.log(`[SIMULATED DEV MODE] Email sent successfully to ${regData.email} with code ${regData.unique_code}`);
      emailSent = true; // Simulate success
    }
  }

  await db.collection('registrations').doc(regId).update({
    whatsapp_sent: whatsappSent,
    email_sent: emailSent
  });
}

async function processDailyReminders() {
  const eventDate = new Date('2026-10-16T00:00:00Z');
  const now = new Date();
  const diffTime = eventDate.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (![1, 2, 3].includes(daysUntil)) return;
  const reminderField = `reminder_${daysUntil}_sent`;

  const snapshot = await db.collection('registrations')
    .where(reminderField, '==', false)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    // Send Reminder via WhatsApp
    const waToken = process.env.WHATSAPP_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_ID;
    if (waToken && waPhoneId) {
       try {
         const response = await fetch(`https://graph.facebook.com/v17.0/${waPhoneId}/messages`, {
           method: 'POST',
           headers: { 'Authorization': `Bearer ${waToken}`, 'Content-Type': 'application/json' },
           body: JSON.stringify({
             messaging_product: "whatsapp",
             to: data.phone.replace(/\\D/g, ''),
             type: "template",
             template: {
               name: "daily_reminder",
               language: { code: "te" }
             }
           })
         });
         if (response.ok) {
           await doc.ref.update({ [reminderField]: true });
         } else {
           await logFailedSend(doc.id, `reminder_${daysUntil}`, await response.text());
         }
       } catch (e) {
         await logFailedSend(doc.id, `reminder_${daysUntil}`, 'Exception');
       }
    }
  }
}

async function logFailedSend(regId: string, type: string, error: string) {
  await db.collection('failed_sends').add({
    registration_id: regId,
    type,
    error,
    timestamp: new Date()
  });
}


