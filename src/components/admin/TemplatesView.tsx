import React, { useState, useEffect } from 'react';
import { Save, MessageSquare, Sparkles, Check, Copy, RefreshCw, Calendar, MapPin, Eye } from 'lucide-react';
import { MessageTemplates } from '../../types';

const SAMPLE_ATTENDEE = {
  name: 'Bro. David Raju',
  code: 'NGM2026-0001',
  dates: 'Oct 16, Oct 17, Oct 18',
  city: 'Siddipet',
  gender: 'Male',
  venue: 'Dr. Dayanand Vaddepalli Function Halls, Siddipet'
};

const TEMPLATE_KEYS = [
  { key: 'confirmation_text', label: 'Registration Confirmation', icon: '🎫', badge: 'Welcome Pass' },
  { key: 'reminder_7_text', label: '7 Days Countdown', icon: '🔔', days: '7 Days Left' },
  { key: 'reminder_6_text', label: '6 Days Countdown', icon: '🔔', days: '6 Days Left' },
  { key: 'reminder_5_text', label: '5 Days Countdown', icon: '🔔', days: '5 Days Left' },
  { key: 'reminder_4_text', label: '4 Days Countdown', icon: '🔔', days: '4 Days Left' },
  { key: 'reminder_3_text', label: '3 Days Countdown', icon: '🔔', days: '3 Days Left' },
  { key: 'reminder_2_text', label: '2 Days Countdown', icon: '🔔', days: '2 Days Left' },
  { key: 'reminder_1_text', label: '1 Day Reminder (Tomorrow)', icon: '🔥', days: 'Tomorrow' },
  { key: 'reminder_0_text', label: 'Event Day (Today)', icon: '🎉', days: 'Starting Today' },
];

export default function TemplatesView() {
  const [templates, setTemplates] = useState<MessageTemplates | null>(null);
  const [activeKey, setActiveKey] = useState<string>('confirmation_text');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchTemplates = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/settings/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.templates) {
          setTemplates(prev => {
            if (!prev) return data.templates;
            if (saving) return prev;
            const same = JSON.stringify(prev) === JSON.stringify(data.templates);
            return same ? prev : data.templates;
          });
        }
      }
    } catch (e) {
      console.error('Failed to load templates:', e);
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(false);
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (saving) return;
      fetchTemplates(true);
    }, 12000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchTemplates(true);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [saving]);

  const handleSave = async () => {
    if (!templates) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/settings/templates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(templates)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (varName: string) => {
    if (!templates) return;
    const currentText = templates[activeKey] || '';
    const updated = currentText + ` {{${varName}}}`;
    setTemplates({ ...templates, [activeKey]: updated });
  };

  const renderPreview = (rawText: string) => {
    if (!rawText) return 'No template message configured.';
    let preview = rawText
      .replace(/{{name}}/g, SAMPLE_ATTENDEE.name)
      .replace(/{{code}}/g, SAMPLE_ATTENDEE.code)
      .replace(/{{dates}}/g, SAMPLE_ATTENDEE.dates)
      .replace(/{{city}}/g, SAMPLE_ATTENDEE.city)
      .replace(/{{gender}}/g, SAMPLE_ATTENDEE.gender)
      .replace(/{{venue}}/g, templates?.venue_name || SAMPLE_ATTENDEE.venue)
      .replace(/{{days_left}}/g, activeKey.includes('_') ? (activeKey.split('_')[1] || '3') : '3');

    // Convert *bold* to <strong>
    const formatted = preview.split('\n').map((line, idx) => {
      const boldFormatted = line.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      return (
        <span key={idx} className="block leading-relaxed" dangerouslySetInnerHTML={{ __html: boldFormatted || '&nbsp;' }} />
      );
    });

    return formatted;
  };

  const copyPreview = () => {
    if (!templates) return;
    const text = (templates[activeKey] || '')
      .replace(/{{name}}/g, SAMPLE_ATTENDEE.name)
      .replace(/{{code}}/g, SAMPLE_ATTENDEE.code)
      .replace(/{{dates}}/g, SAMPLE_ATTENDEE.dates)
      .replace(/{{city}}/g, SAMPLE_ATTENDEE.city)
      .replace(/{{gender}}/g, SAMPLE_ATTENDEE.gender)
      .replace(/{{venue}}/g, templates.venue_name || SAMPLE_ATTENDEE.venue)
      .replace(/{{days_left}}/g, activeKey.includes('_') ? (activeKey.split('_')[1] || '3') : '3');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !templates) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  const currentTemplateObj = TEMPLATE_KEYS.find(t => t.key === activeKey);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            WhatsApp Message Templates
          </h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            Customize bilingual messages sent to attendees with live WhatsApp preview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => void fetchTemplates()}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
            title="Reload Templates"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-zinc-900 text-white rounded-md text-[13px] font-medium hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-70"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Templates
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 text-emerald-700 text-[13px] font-medium px-4 py-3 rounded-lg border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" /> Templates saved successfully and synced with cloud database.
        </div>
      )}

      {/* Template Type Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-200 custom-scrollbar">
        {TEMPLATE_KEYS.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveKey(item.key)}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeKey === item.key
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.days && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded ${activeKey === item.key ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-500'}`}>
                {item.days}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Area (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <span>{currentTemplateObj?.icon}</span> {currentTemplateObj?.label} Editor
              </span>
              <span className="text-xs text-zinc-400">WhatsApp Formatting: *bold*, _italic_</span>
            </div>

            {/* Variable Insertion Chips */}
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                Click to Insert Variables:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'name', label: '👤 Attendee Name' },
                  { name: 'code', label: '🆔 Pass Code' },
                  { name: 'dates', label: '📅 Selected Dates' },
                  { name: 'city', label: '📍 City' },
                  { name: 'gender', label: '⚧ Gender' },
                  { name: 'venue', label: '🏛 Venue Name' },
                  { name: 'days_left', label: '⏳ Days Remaining' }
                ].map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => insertVariable(v.name)}
                    className="px-2.5 py-1 bg-zinc-100 hover:bg-amber-100 hover:text-amber-900 text-zinc-700 rounded text-xs font-medium transition-colors border border-zinc-200"
                  >
                    + {`{{${v.name}}}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                rows={16}
                value={templates[activeKey] || ''}
                onChange={(e) => setTemplates({ ...templates, [activeKey]: e.target.value })}
                className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-[13px] font-mono text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all resize-y leading-relaxed"
                placeholder="Type your WhatsApp message template here..."
              />
            </div>
          </div>

          {/* Event Configuration Box */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-500" /> Event Details & Venue Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Event Start Date</label>
                <input
                  type="date"
                  value={templates.event_start_date || '2026-10-16'}
                  onChange={(e) => setTemplates({ ...templates, event_start_date: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Venue Description</label>
                <input
                  type="text"
                  value={templates.venue_name || ''}
                  onChange={(e) => setTemplates({ ...templates, venue_name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] text-zinc-900 focus:outline-none focus:border-zinc-900"
                  placeholder="Dr. Dayanand Vaddepalli Function Halls, Siddipet"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live WhatsApp Preview Screen (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
            {/* Phone Top Bar */}
            <div className="bg-emerald-700 text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  NGM
                </div>
                <div>
                  <div className="text-xs font-semibold">Kutumba Ashirvada Sadassu</div>
                  <div className="text-[10px] text-emerald-100">Next Generation Ministries</div>
                </div>
              </div>
              <button
                onClick={copyPreview}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                title="Copy sample message text"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Chat Body */}
            <div className="bg-[#E5DDD5] dark:bg-[#0b141a] p-4 min-h-[460px] max-h-[560px] overflow-y-auto custom-scrollbar flex flex-col justify-start">
              <div className="bg-white dark:bg-[#202c33] text-zinc-800 dark:text-[#e9edef] rounded-lg p-3.5 shadow-sm max-w-[92%] self-start relative text-[13px] border border-black/5 dark:border-white/5 space-y-1">
                {renderPreview(templates[activeKey])}
                <div className="text-[10px] text-zinc-400 text-right mt-2 flex items-center justify-end gap-1">
                  <span>10:30 AM</span>
                  <span className="text-emerald-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Phone Footer */}
            <div className="bg-zinc-800 p-2.5 text-center text-zinc-400 text-xs flex items-center justify-center gap-1">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Sample Preview for <strong>{SAMPLE_ATTENDEE.name}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
