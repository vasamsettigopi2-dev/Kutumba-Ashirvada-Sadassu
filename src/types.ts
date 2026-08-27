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
  category: 'Children' | 'Youth' | 'Adult' | string;
  gender: 'Male' | 'Female' | string;
  days_attending: string[];
  family_size?: number;
  dietary_pref?: string;
  unique_code?: string;
  created_at?: { _seconds: number; _nanoseconds: number } | any;
  checked_in?: boolean;
  whatsapp_status?: Record<string, MessageStatus>;
  deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  deleted_reason?: string;
}

export interface MessageTemplates {
  event_start_date: string;
  venue_name: string;
  confirmation_text: string;
  reminder_7_text?: string;
  reminder_6_text?: string;
  reminder_5_text?: string;
  reminder_4_text?: string;
  reminder_3_text?: string;
  reminder_2_text?: string;
  reminder_1_text?: string;
  reminder_0_text?: string;
  [key: string]: any;
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
