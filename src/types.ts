export interface MessageStatus {
  status: 'pending' | 'sent' | 'failed';
  timestamp?: string;
  admin_email?: string;
}

export interface Registration {
  id?: string;
  name: string;
  phone: string;
  email: string;
  church_city: string;
  category: string; // Children, Youth, Adult, Senior
  days_attending: string[];
  family_size: number;
  dietary_pref: string;
  unique_code?: string;
  created_at?: { _seconds: number; _nanoseconds: number } | any;
  checked_in?: boolean;
  checked_in_at?: any;
  whatsapp_status?: {
    confirmation?: MessageStatus;
    reminder_3?: MessageStatus;
    reminder_2?: MessageStatus;
    reminder_1?: MessageStatus;
  };
}

export interface AgendaSession {
  id?: string;
  day: string; // e.g., 'Day 1 - Oct 16'
  date: string; // YYYY-MM-DD
  startTime: string; // e.g., '09:00 AM'
  endTime: string; // e.g., '10:30 AM'
  title: string;
  speaker?: string;
  description?: string;
  ytLiveLink?: string;
  notesLink?: string;
}
