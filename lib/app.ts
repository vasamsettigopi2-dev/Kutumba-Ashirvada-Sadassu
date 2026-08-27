import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { dataService } from './db-adapter';

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, email, church_city, category, gender, days_attending } = req.body;

    if (!name || !phone || !days_attending || !Array.isArray(days_attending) || days_attending.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cleanPhone = phone.trim();

    const existing = await dataService.findRegistrationByPhone(cleanPhone);
    if (existing) {
      return res.json({
        success: true,
        message: 'Already registered',
        unique_code: existing.unique_code,
        isDuplicate: true,
      });
    }

    const regData = {
      name,
      phone: cleanPhone,
      email: email || '',
      church_city: church_city || '',
      category: category || 'Adult',
      gender: gender || 'Male',
      days_attending,
      created_at: new Date().toISOString(),
      confirmation_status: 'not_sent',
      confirmation_at: null,
      confirmation_by: null,
      reminder_3_status: 'not_sent',
      reminder_3_at: null,
      reminder_3_by: null,
      reminder_2_status: 'not_sent',
      reminder_2_at: null,
      reminder_2_by: null,
      reminder_1_status: 'not_sent',
      reminder_1_at: null,
      reminder_1_by: null,
      checked_in: false,
      checked_in_at: null,
    };

    const result = await dataService.createRegistration(regData);
    res.json({ success: true, unique_code: result.unique_code, isDuplicate: false });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to process registration: ' + (error?.message || error) });
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'ngm-sadassu-2026-secret-key';

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const envAdminUser = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL;
  const envAdminPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;

  const isValid =
    (username === 'admin1' && password === 'admin1') ||
    (username === 'admin2' && password === 'admin2') ||
    (username === 'admin@demo.com' && password === 'admin123') ||
    (envAdminUser && envAdminPass && username === envAdminUser && password === envAdminPass);

  if (isValid) {
    try {
      const token = jwt.sign({ email: username, uid: username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, email: username });
    } catch (e: any) {
      console.error('Login token error:', e);
      res.status(500).json({ error: 'Failed to generate token: ' + (e.message || e) });
    }
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

const verifyAdmin = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.get('/api/admin/registrations', verifyAdmin, async (req, res) => {
  try {
    const forceFresh = Boolean(req.query.force) || String(req.query.forceFresh) === 'true';
    const registrations = await dataService.getAllRegistrations(forceFresh);
    res.json({ registrations });
  } catch (error: any) {
    console.error('Fetch registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations: ' + (error?.message || error) });
  }
});

app.post('/api/admin/checkin', verifyAdmin, async (req, res) => {
  try {
    const { unique_code } = req.body;
    const attendee = await dataService.findRegistrationByCode(unique_code);
    if (!attendee) return res.status(404).json({ error: 'Attendee not found with this code' });

    if (attendee.checked_in) {
      return res.json({ success: true, message: 'Already checked in', doc: attendee });
    }

    await dataService.updateRegistration(attendee.id, {
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    });
    res.json({ success: true, message: 'Check-in successful', doc: { ...attendee, checked_in: true } });
  } catch (error: any) {
    res.status(500).json({ error: 'Check-in failed: ' + (error?.message || error) });
  }
});

app.post('/api/admin/update_whatsapp_status', verifyAdmin, async (req, res) => {
  try {
    const { id, messageType, status } = req.body;
    const adminEmail = (req as any).user.email || 'admin';

    if (!id || !messageType || !status) {
      return res.status(400).json({ error: 'Missing id, messageType, or status' });
    }

    const updateData: any = {};
    updateData[`${messageType}_status`] = status;
    updateData[`${messageType}_at`] = new Date().toISOString();
    updateData[`${messageType}_by`] = adminEmail;
    updateData[`whatsapp_status.${messageType}`] = {
      status,
      timestamp: new Date().toISOString(),
      admin_email: adminEmail,
    };

    await dataService.updateRegistration(id, updateData);
    res.json({ success: true, message: 'Status updated' });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status: ' + (error?.message || error) });
  }
});

app.post('/api/admin/registration/update', verifyAdmin, async (req, res) => {
  try {
    const { id, name, phone, church_city, gender, category, days_attending, email } = req.body;
    if (!id || !name || !phone) {
      return res.status(400).json({ error: 'Missing required attendee fields' });
    }
    await dataService.updateRegistration(id, {
      name,
      phone,
      church_city,
      gender,
      category,
      days_attending,
      email: email || '',
      updated_at: new Date().toISOString(),
      updated_by: (req as any).user.email || 'admin',
    });
    res.json({ success: true, message: 'Registration updated successfully' });
  } catch (error: any) {
    console.error('Update registration error:', error);
    res.status(500).json({ error: 'Failed to update registration: ' + error.message });
  }
});

app.post('/api/admin/registration/delete', verifyAdmin, async (req, res) => {
  try {
    const { id, permanent } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing registration id' });

    const adminEmail = (req as any).user.email || 'admin';
    await dataService.deleteRegistration(id, Boolean(permanent), adminEmail);
    res.json({ success: true, message: permanent ? 'Permanently deleted' : 'Moved to Deleted Bin' });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete: ' + error.message });
  }
});

app.post('/api/admin/registration/restore', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing registration id' });

    await dataService.restoreRegistration(id);
    res.json({ success: true, message: 'Registration restored successfully' });
  } catch (error: any) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'Failed to restore: ' + error.message });
  }
});

app.post('/api/admin/registration/empty_bin', verifyAdmin, async (req, res) => {
  try {
    const adminEmail = (req as any).user.email || 'admin';
    await dataService.emptyBin(adminEmail);
    res.json({ success: true, message: 'Deleted bin emptied permanently' });
  } catch (error: any) {
    console.error('Empty bin error:', error);
    res.status(500).json({ error: 'Failed to empty bin: ' + error.message });
  }
});

app.get('/api/admin/settings/templates', verifyAdmin, async (_req, res) => {
  try {
    const templates = await dataService.getTemplates();
    res.json({ templates });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch templates: ' + error.message });
  }
});

app.post('/api/admin/settings/templates', verifyAdmin, async (req, res) => {
  try {
    await dataService.saveTemplates(req.body);
    res.json({ success: true, message: 'Templates saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save templates: ' + error.message });
  }
});

app.get('/api/admin/agenda', async (_req, res) => {
  try {
    const agenda = await dataService.getAgenda();
    res.json({ agenda });
  } catch (error: any) {
    console.error('Fetch agenda error:', error);
    res.status(500).json({ error: 'Failed to fetch agenda' });
  }
});

app.post('/api/admin/agenda', verifyAdmin, async (req, res) => {
  try {
    const id = await dataService.addAgenda(req.body);
    res.json({ success: true, id });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to add agenda session: ' + e.message });
  }
});

app.put('/api/admin/agenda/:id', verifyAdmin, async (req, res) => {
  try {
    await dataService.updateAgenda(req.params.id, req.body);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to update agenda session: ' + e.message });
  }
});

app.delete('/api/admin/agenda/:id', verifyAdmin, async (req, res) => {
  try {
    await dataService.deleteAgenda(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete agenda session' });
  }
});

export default app;
