import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { MapPin, Clock, Loader2, CheckCircle, ArrowRight, X, Phone, CalendarDays, ChevronDown, Video, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';


export default function InvitePage() {
  const [showRegForm, setShowRegForm] = useState(false);
  const [lang, setLang] = useState<'te' | 'en'>('te');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const [agenda, setAgenda] = useState<any[]>([]);

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const res = await fetch('/api/admin/agenda');
        const data = await res.json();
        if (data.agenda) {
          const docs = data.agenda;
          docs.sort((a: any, b: any) => {
            if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
            return (a.startTime || '').localeCompare(b.startTime || '');
          });
          setAgenda(docs);
        }
      } catch (e) {
        console.error('Error fetching agenda', e);
      }
    };
    fetchAgenda();
  }, []);

  
  useEffect(() => {
    // Elegant minimum preloader duration
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = 'unset';
    }, 800);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      
      {/* Preloader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[999] bg-zinc-950 flex flex-col items-center justify-center"
          >
            <motion.div
               animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.7, 1, 0.7] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               className="relative flex items-center justify-center w-28 h-28 mb-8"
            >
              <div className="absolute inset-0 rounded-full border-t-2 border-amber-500/40 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full border-r-2 border-amber-400/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <div className="absolute inset-4 bg-amber-500/5 rounded-full blur-xl" />
              <div className="flex flex-col items-center z-10">
                <span className="text-amber-500 text-2xl mb-1">✝</span>
                <span className="text-xl font-bold tracking-widest text-zinc-100 uppercase leading-none">NGM</span>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm md:text-base font-medium tracking-wide text-amber-500/90 text-center px-4"
            >
              {lang === 'te' ? '3వ వార్షిక కుటుంబ ఆశీర్వాద సదస్సు' : '3rd Annual Family Blessing Convention'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 origin-left z-[200] shadow-[0_2px_10px_rgba(245,158,11,0.5)]" 
        style={{ scaleX }} 
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center">
            <span className="text-amber-500 text-sm">✝</span>
          </div>
          <span className="font-semibold text-zinc-100 tracking-wide text-sm uppercase">NGM</span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLang(lang === 'te' ? 'en' : 'te')}
          className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-full"
        >
          {lang === 'te' ? 'Read in English' : 'తెలుగులో చదవండి'}
        </motion.button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-24 md:pt-32">
        
        {/* Hero Section */}
        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer} 
          className="mt-6 md:mt-12 mb-16 md:mb-24 flex flex-col justify-center relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 rounded-full mb-8 w-fit backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-500 text-xs font-semibold tracking-widest uppercase">
                {lang === 'te' ? 'అందరికి ఆహ్వానము' : 'Everyone Invited'}
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold text-zinc-50 leading-[1.3] md:leading-[1.4] tracking-tight mb-8">
              {lang === 'te' ? (
                <>3వ వార్షిక <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 py-2">కుటుంబ ఆశీర్వాద</span> సదస్సు</>
              ) : (
                <>3rd Annual <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 py-2">Family Blessing</span> Convention</>
              )}
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed mb-8">
              {lang === 'te' ? '2026 అక్టోబర్ 16-20 • డా॥ దయానంద్ వడ్డేపల్లి ఫంక్షన్ హాల్స్, సిద్దిపేట' : '16-20 October 2026 • Dr. Dayanand Vaddepalli Function Hall, Siddipet'}
            </motion.p>
          </div>
        </motion.section>

        {/* Speaker Section */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainer} 
          className="py-16 md:py-24 border-t border-white/5"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp}>
              <h2 className="text-xs font-semibold tracking-widest uppercase text-amber-500 mb-4">
                {lang === 'te' ? 'ముఖ్య వాక్యోపదేశకులు' : 'Main Speaker'}
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-zinc-50 leading-snug md:leading-normal mb-6">
                {lang === 'te' ? 'బ్రదర్ పి. సునీల్ కుమార్ గారు' : 'Brother P. Sunil Kumar garu'}
              </h3>
              <p className="text-zinc-400 leading-relaxed text-lg font-light">
                {lang === 'te' ? 'శుభవార్త టీవీ వర్తమానికులు. దేవుని వాక్యాన్ని శక్తివంతంగా బోధించే దైవజనులు.' : 'Subhavartha TV Speaker. A powerful minister of the Word of God.'}
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="relative group p-1 w-full max-w-sm mx-auto md:mx-0">
               <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700 opacity-0 group-hover:opacity-100" />
               <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-700 group-hover:border-amber-500/30">
                  {/* Using a sophisticated portrait placeholder matching the premium aesthetic */}
                  <img src="https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&q=80&w=800" alt="Speaker" className="w-full h-full object-cover grayscale mix-blend-luminosity opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:mix-blend-normal group-hover:scale-105 group-hover:opacity-100" />
               </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Schedule Section */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainer} 
          className="py-16 md:py-24 border-t border-white/5"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <motion.div variants={fadeUp}>
              <h2 className="text-xs font-semibold tracking-widest uppercase text-amber-500 mb-3">
                {lang === 'te' ? 'సమయ పట్టిక' : 'Event Schedule'}
              </h2>
              <h3 className="text-3xl font-bold text-zinc-50 leading-snug md:leading-normal">
                {lang === 'te' ? 'ఐదు రోజుల ఆధ్యాత్మిక పండుగ' : '5 Days of Spiritual Gathering'}
              </h3>
            </motion.div>
            <motion.p variants={fadeUp} className="text-sm text-zinc-400 max-w-xs">
              {lang === 'te' ? 'ప్రతిరోజు ఉదయం మరియు సాయంత్రం దేవుని వాక్య పరిచర్య ఉంటుంది.' : 'Daily sessions are structured to provide immersive teaching and worship.'}
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { date: '16', dayEn: 'Friday', dayTe: 'శుక్రవారం' },
              { date: '17', dayEn: 'Saturday', dayTe: 'శనివారం' },
              { date: '18', dayEn: 'Sunday', dayTe: 'ఆదివారం' },
              { date: '19', dayEn: 'Monday', dayTe: 'సోమవారం' },
              { date: '20', dayEn: 'Tuesday', dayTe: 'మంగళవారం' }
            ].map((item, i) => {
              const isExpanded = expandedDay === i;
              return (
              <motion.div key={i} variants={fadeUp} className={i === 4 ? 'md:col-span-2 w-full md:max-w-md md:mx-auto' : ''}>
                <div 
                  onClick={() => setExpandedDay(isExpanded ? null : i)}
                  className={`group p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col gap-4 ${isExpanded ? 'bg-zinc-900/40 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.03)]' : 'bg-zinc-900/20 border-zinc-800/40 hover:bg-zinc-900/60 hover:border-zinc-700/50'}`}
                >
                  {/* Header Row */}
                  <div className="flex items-center gap-4 w-full">
                    <div className={`flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-2xl border transition-colors z-10 ${isExpanded ? 'bg-amber-500/10 border-amber-500/30' : 'bg-zinc-950 border-zinc-800/50 group-hover:border-amber-500/30'}`}>
                      <span className={`text-[9px] font-bold tracking-widest uppercase mb-0.5 ${isExpanded ? 'text-amber-500' : 'text-amber-500/80'}`}>Oct</span>
                      <span className={`text-2xl font-light leading-none transition-colors ${isExpanded ? 'text-amber-400' : 'text-zinc-100 group-hover:text-white'}`}>{item.date}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0 z-10">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className={`text-sm font-medium transition-colors ${isExpanded ? 'text-amber-400' : 'text-zinc-200'}`}>
                          {lang === 'te' ? item.dayTe : item.dayEn}
                        </h3>
                        <motion.div 
                          animate={{ rotate: isExpanded ? 180 : 0 }} 
                          transition={{ duration: 0.3 }}
                          className={`w-7 h-7 flex items-center justify-center rounded-full ${isExpanded ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800/50 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200'}`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold ${isExpanded ? 'text-amber-500/60' : 'text-zinc-500 group-hover:text-amber-500/60'} transition-colors`}>
                          {lang === 'te' ? 'వివరాల కోసం ఇక్కడ నొక్కండి' : 'Tap to view schedule'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Timetable */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-2 border-t border-zinc-800/50 flex flex-col gap-3">
                          {(() => {
                            const daySessions = agenda.filter(s => s.date === `2026-10-${item.date}`);
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
                  </AnimatePresence>
                </div>
              </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Venue Section */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainer} 
          className="py-12 md:py-16 border-t border-white/5"
        >
          <motion.div variants={fadeUp} className="p-6 md:p-8 rounded-[1.5rem] bg-zinc-900 border border-zinc-800/80 relative overflow-hidden group shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
            {/* Faded Map Background Image */}
            <div 
              className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 opacity-[0.06] group-hover:opacity-[0.12]"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(100%) invert(100%)',
                WebkitMaskImage: 'radial-gradient(circle at 100% 50%, black 0%, transparent 70%)',
                maskImage: 'radial-gradient(circle at 100% 50%, black 0%, transparent 70%)'
              }}
            />
            {/* Warm Glow Effect */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[400px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-amber-500/20 z-0" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-5 items-start md:items-center">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center backdrop-blur-sm group-hover:border-amber-500/50 group-hover:scale-105 transition-all duration-500 shadow-xl">
                <MapPin className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-zinc-50 mb-2 leading-tight">
                  {lang === 'te' ? 'డా॥ దయానంద్ వడ్డేపల్లి ఫంక్షన్ హాల్స్' : 'Dr. Dayanand Vaddepalli Function Hall'}
                </h3>
                <p className="text-zinc-400 max-w-md leading-relaxed text-sm font-medium">
                  {lang === 'te' ? 'వేములవాడ కమాన్ దగ్గర, కరీంనగర్ రోడ్, సిద్దిపేట, తెలంగాణ' : 'Near Vemulawada Common, Karimnagar Road, Siddipet, Telangana'}
                </p>
              </div>
            </div>

            <motion.a 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://maps.google.com/?q=Dr.+Dayanand+Vaddepalli+Function+Hall+Siddipet" 
              target="_blank" 
              rel="noreferrer" 
              className="relative z-10 shrink-0 inline-flex items-center justify-center space-x-2 text-sm font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 px-6 py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] w-full md:w-auto"
            >
              <span>{lang === 'te' ? 'దారి తెలుసుకోండి' : 'Get Directions'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainer} 
          className="pt-16 md:pt-24 pb-12 border-t border-white/5 text-center flex flex-col items-center"
        >
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-zinc-50 leading-snug md:leading-normal mb-8 tracking-tight">
            {lang === 'te' ? 'మీ రాకను నిర్ధారించండి' : 'Confirm Your Presence'}
          </motion.h2>
          <motion.div variants={fadeUp}>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 40px -5px rgba(245,158,11,0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRegForm(true)} 
              className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-zinc-950 bg-amber-500 rounded-full overflow-hidden transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              <span className="relative z-10 flex items-center space-x-3 text-lg">
                <span>{lang === 'te' ? 'నమోదు చేసుకోండి' : 'Register Now'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-white/5 pt-16 pb-12 text-center flex flex-col items-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          
          <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <span className="text-amber-500 text-lg leading-none mt-1">✝</span>
          </div>
          
          <h4 className="text-sm font-semibold tracking-[0.2em] uppercase text-zinc-100 mb-2">
            {lang === 'te' ? 'నెక్స్ట్ జనరేషన్ మినిస్ట్రీస్' : 'Next Gen Ministries'}
          </h4>
          <p className="text-[10px] tracking-widest uppercase text-zinc-500 mb-8">
            {lang === 'te' ? 'మరిన్ని వివరాలకు సంప్రదించండి' : 'For Enquiries & Support'}
          </p>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 font-mono text-sm mb-12 max-w-2xl">
            {['99516 52104', '98493 50438', '94902 57077', '90004 41474'].map(num => (
              <a key={num} href={`tel:${num.replace(/\s/g, '')}`} className="flex items-center px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400 transition-all duration-300">
                 <Phone className="w-3 h-3 mr-2 text-amber-500/50" />
                 {num}
              </a>
            ))}
          </div>

          <div className="inline-flex items-center border border-zinc-800/80 bg-zinc-900/30 px-5 py-2.5 rounded-full">
            <span className="text-zinc-500 text-xs tracking-wider font-medium">#KutumbaAshirvadaSadassu<span className="text-amber-500/70 font-bold">2026</span></span>
          </div>
        </footer>

      </main>

      {/* Registration Modal Overlay */}
      <AnimatePresence>
        {showRegForm && (
          <RegistrationModal lang={lang} onClose={() => setShowRegForm(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function RegistrationModal({ lang, onClose }: { lang: 'te'|'en', onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ code: string, duplicate: boolean } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '+91 ',
    email: '',
    church_city: '',
    category: 'Adult',
    gender: 'Male',
    days_attending: [] as string[]
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<{name?: string, phone?: string, email?: string, days?: string}>({});

  useEffect(() => {
    const errors: {name?: string, phone?: string, email?: string, days?: string} = {};
    if (!formData.name.trim()) errors.name = lang === 'te' ? 'పేరు తప్పనిసరి' : 'Name is required';
    else if (formData.name.trim().length < 3) errors.name = lang === 'te' ? 'కనీసం 3 అక్షరాలు ఉండాలి' : 'Name must be at least 3 characters';
    
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) errors.phone = lang === 'te' ? 'వాట్సాప్ నంబర్ తప్పనిసరి' : 'WhatsApp number is required';
    else if (phoneDigits.length < 12 && !formData.phone.startsWith('+91')) errors.phone = lang === 'te' ? 'సరైన నంబర్ ఇవ్వండి' : 'Enter a valid number with country code';
    else if (phoneDigits.length < 10 || phoneDigits.length > 15) errors.phone = lang === 'te' ? 'సరైన 10 అంకెల నంబర్ ఇవ్వండి' : 'Enter a valid 10-digit phone number';
    
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = lang === 'te' ? 'సరైన ఈమెయిల్ ఇవ్వండి' : 'Enter a valid email address';
    }
    
    if (formData.days_attending.length === 0) {
      errors.days = lang === 'te' ? 'కనీసం ఒక రోజు ఎంచుకోండి' : 'Please select at least one day';
    }
    
    setFieldErrors(errors);
  }, [formData, lang]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const toggleDay = (day: string) => {
    setTouched(prev => ({ ...prev, days: true }));
    setFormData(prev => ({
      ...prev,
      days_attending: prev.days_attending.includes(day) 
        ? prev.days_attending.filter(d => d !== day)
        : [...prev.days_attending, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors if they try to submit early
    setTouched({ name: true, phone: true, email: true, days: true });
    
    if (Object.keys(fieldErrors).length > 0) {
      setError(lang === 'te' ? 'దయచేసి ఎర్రర్లను సరిదిద్దండి' : 'Please fix the errors before submitting');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setResult({ code: data.unique_code, duplicate: !!data.isDuplicate });
        setStep(2);
        
        if (!data.isDuplicate) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff'],
            disableForReducedMotion: true
          });
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl custom-scrollbar"
      >
        <div className="sticky top-0 z-10 flex justify-between items-center px-8 py-6 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-50 leading-snug">{lang === 'te' ? 'నమోదు ఫారం' : 'Registration'}</h3>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            className="p-2 text-zinc-400 hover:text-zinc-50 bg-zinc-800/50 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="p-8">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">{error}</div>}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-zinc-300">Full Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} onBlur={() => handleBlur('name')} className={`w-full bg-zinc-950 border ${touched.name && fieldErrors.name ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-800 focus:ring-amber-500/50 focus:border-amber-500'} text-zinc-200 px-5 py-4 rounded-xl focus:ring-2 outline-none transition-all placeholder:text-zinc-600`} placeholder="Enter your full name" />
                  <AnimatePresence>
                    {touched.name && fieldErrors.name && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-xs font-medium mt-2 ml-1">{fieldErrors.name}</motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-zinc-300">WhatsApp Number *</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} onBlur={() => handleBlur('phone')} className={`w-full bg-zinc-950 border ${touched.phone && fieldErrors.phone ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-800 focus:ring-amber-500/50 focus:border-amber-500'} text-zinc-200 px-5 py-4 rounded-xl focus:ring-2 outline-none transition-all placeholder:text-zinc-600`} placeholder="+91 9999999999" />
                  <AnimatePresence>
                    {touched.phone && fieldErrors.phone && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-xs font-medium mt-2 ml-1">{fieldErrors.phone}</motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-zinc-300">Email <span className="text-zinc-500 font-normal">(Optional)</span></label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} onBlur={() => handleBlur('email')} className={`w-full bg-zinc-950 border ${touched.email && fieldErrors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-800 focus:ring-amber-500/50 focus:border-amber-500'} text-zinc-200 px-5 py-4 rounded-xl focus:ring-2 outline-none transition-all placeholder:text-zinc-600`} placeholder="your@email.com" />
                  <AnimatePresence>
                    {touched.email && fieldErrors.email && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-xs font-medium mt-2 ml-1">{fieldErrors.email}</motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-zinc-300">Church / City</label>
                    <input type="text" value={formData.church_city} onChange={e => setFormData({...formData, church_city: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-5 py-4 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-zinc-600" placeholder="e.g. Hyderabad" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-zinc-300">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-5 py-4 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer">
                      <option>Adult</option>
                      <option>Youth</option>
                      <option>Children</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-zinc-300">Gender *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Male', 'Female'].map((genderOption) => (
                      <button
                        key={genderOption}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: genderOption })}
                        className={`py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border flex items-center justify-center gap-2 ${
                          formData.gender === genderOption
                            ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formData.gender === genderOption ? 'bg-zinc-950' : 'bg-zinc-600'}`}></span>
                        {genderOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-zinc-300">Days Attending *</label>
                  <div className="flex flex-wrap gap-2">
                    {['Oct 16', 'Oct 17', 'Oct 18', 'Oct 19', 'Oct 20'].map(day => (
                      <motion.button
                        key={day}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300 ${formData.days_attending.includes(day) ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]' : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'} ${touched.days && fieldErrors.days ? 'ring-1 ring-red-500/50' : ''}`}
                      >
                        {day}
                      </motion.button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {touched.days && fieldErrors.days && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-xs font-medium mt-3 ml-1">{fieldErrors.days}</motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading}
                className="w-full mt-8 bg-zinc-50 text-zinc-950 font-bold py-5 rounded-xl shadow hover:bg-amber-400 transition-colors flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (lang === 'te' ? 'సబ్మిట్ చేయండి' : 'Submit Registration')}
              </motion.button>
            </form>
          )}

          {step === 2 && result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-3xl font-bold text-zinc-50 mb-3">
                {result.duplicate ? 'Already Registered!' : 'Registration Successful!'}
              </h2>
              <p className="text-zinc-400 mb-10 leading-relaxed max-w-sm mx-auto">
                Your unique entry code is ready. Please save this QR code or show the WhatsApp message at the venue.
              </p>
              
              <div className="inline-block bg-zinc-950 p-8 rounded-[2rem] border border-zinc-800 mb-10 shadow-xl">
                <p className="text-xs text-zinc-500 font-bold mb-4 uppercase tracking-widest">Your Code</p>
                <div className="text-4xl md:text-5xl font-mono font-bold text-amber-500 mb-8 tracking-tight">{result.code}</div>
                <div className="bg-white p-4 rounded-2xl shadow-sm inline-block">
                  <QRCodeSVG value={result.code} size={180} />
                </div>
              </div>

              <p className="text-sm font-medium text-zinc-500 mb-8">A confirmation has been sent to your WhatsApp number.</p>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose} 
                className="w-full bg-zinc-800 text-white font-bold py-5 rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Done
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
