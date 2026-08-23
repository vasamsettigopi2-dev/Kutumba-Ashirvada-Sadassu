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
  whatsapp_sent?: boolean;
  email_sent?: boolean;
  reminder_3_sent?: boolean;
  reminder_2_sent?: boolean;
  reminder_1_sent?: boolean;
  checked_in?: boolean;
  checked_in_at?: any;
}
