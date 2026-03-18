import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, MessageSquare, History, MapPin, 
  BookOpen, Plus, FileText, Scale, 
  ShieldCheck, LogIn, ChevronRight, Activity,
  Sun, Moon, Eye, Download, Database, HardDrive, 
  Layers, Search
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import Lenis from 'lenis';

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProMode, setIsProMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeDialog, setActiveDialog] = useState<'evidence' | 'laws' | 'meter' | 'knowledge' | null>(null);
  const [kbSearch, setKbSearch] = useState('');
  const navigate = useNavigate();
  const kbScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    let lenis: Lenis | null = null;
    let rafId: number;

    if (activeDialog === 'knowledge' && kbScrollRef.current) {
      lenis = new Lenis({
        wrapper: kbScrollRef.current,
        content: kbScrollRef.current.firstElementChild as HTMLElement,
        duration: 1.2,
        smoothWheel: true,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    return () => {
      lenis?.destroy();
      cancelAnimationFrame(rafId);
    };
  }, [activeDialog]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => console.log("Login Success:", tokenResponse),
    onError: () => console.log('Login Failed'),
  });

  const chatHistory = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    title: `Enterprise Legal Analysis #${i + 1}`,
    date: i === 0 ? 'Just now' : `${i}h ago`
  }));

  const lawsInvolved = [
    { name: 'Indian Penal Code Section 420', percentage: 85 },
    { name: 'IT Act 2000 Section 66D', percentage: 65 },
    { name: 'Consumer Protection Act', percentage: 40 },
  ];

  const evidenceList = [
    { name: 'Enterprise_Transaction_Receipt_Final_Version_2024.pdf' },
    { name: 'Official_WhatsApp_Communication_Log_March.txt' },
    { name: 'Rental_Agreement_Indore_Commercial_Property.pdf' },
  ];

  const kbFiles = [
    'Indian_Penal_Code_1860.pdf', 'Criminal_Procedure_Code.pdf', 
    'Constitution_of_India.pdf', 'IT_Act_2000_Updated.pdf',
    'Labour_Laws_Consolidated.pdf', 'Consumer_Protection_Act_2019.pdf',
    'Evidence_Act_1872.pdf', 'Contract_Act_1872.pdf'
  ].sort((a, b) => a.localeCompare(b));

  const filteredKbFiles = kbFiles.filter(f => f.toLowerCase().includes(kbSearch.toLowerCase()));

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`flex flex-col h-screen w-screen bg-[var(--bg-color)] text-[var(--text-primary)] overflow-hidden transition-colors duration-300`}>
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="p-2.5 hover:bg-black/5 rounded-full transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-[var(--text-primary)] rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} className="text-[var(--bg-color)]" />
            </div>
            <span className="font-black text-lg tracking-tighter hidden sm:block uppercase text-[var(--text-primary)]">Themis AI</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 bg-[var(--glass-bg)] p-1 rounded-full border border-[var(--glass-border)]">
            <button onClick={() => setIsProMode(false)} className={`px-3 sm:px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${!isProMode ? 'bg-[var(--text-primary)] text-[var(--bg-color)]' : 'text-[var(--text-secondary)]'}`}>FAST</button>
            <button onClick={() => setIsProMode(true)} className={`px-3 sm:px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${isProMode ? 'bg-[var(--text-primary)] text-[var(--bg-color)]' : 'text-[var(--text-secondary)]'}`}>PRO</button>
          </div>
          <button onClick={() => setActiveDialog('evidence')} className="p-2.5 hover:bg-black/5 rounded-full border border-[var(--glass-border)]"><FileText size={18} /></button>
          <button onClick={() => setActiveDialog('laws')} className="p-2.5 hover:bg-black/5 rounded-full border border-[var(--glass-border)]"><Scale size={18} /></button>
        </div>
      </nav>

      {/* Meter */}
      <div className="px-6 py-2 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-between cursor-pointer hover:brightness-110 transition-all" onClick={() => setActiveDialog('meter')}>
        <div className="flex items-center gap-3"><Activity size={14} className="text-[var(--text-secondary)]" /><span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] hidden xs:block">Status Grid</span></div>
        <div className="flex items-center gap-6 flex-1 max-w-md mx-4 sm:mx-8">
          <div className="h-1 flex-1 bg-[var(--glass-border)] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} className="h-full bg-[var(--text-primary)]" />
          </div>
          <span className="text-[11px] font-black">72%</span>
        </div>
        <ChevronRight size={14} className="text-[var(--text-secondary)]" />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleSidebar} className="absolute inset-0 bg-[var(--glass-overlay)] backdrop-blur-sm z-40" />
              <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 35, stiffness: 200 }} className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-[320px] bg-[var(--bg-color)] border-r border-[var(--glass-border)] z-50 flex flex-col p-6 space-y-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[var(--text-primary)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)]">Enterprise</span>
                  </div>
                  <button onClick={toggleSidebar} className="p-2 hover:bg-[var(--glass-bg)] rounded-full transition-colors"><X size={20} /></button>
                </div>

                <button onClick={() => { navigate('/'); toggleSidebar(); }} className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-2xl font-black text-xs hover:scale-[0.98] transition-all"><Plus size={18} /> NEW SESSION</button>

                <div className="flex-1 flex flex-col min-h-0 space-y-8">
                  <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-4 flex items-center gap-2 flex-shrink-0"><History size={12} /> Recent Logs</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                      {chatHistory.map(chat => (
                        <button key={chat.id} className="w-full text-left p-4 rounded-2xl hover:bg-[var(--glass-bg)] border border-transparent hover:border-[var(--glass-border)] transition-all flex items-center gap-4 group">
                          <MessageSquare size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold truncate">{chat.title}</div>
                            <div className="text-[9px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{chat.date}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <nav className="space-y-2 flex-shrink-0">
                    <NavLink to="/nearby" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><MapPin size={16} /><span className="text-[11px] font-black uppercase tracking-widest">Nearby Help</span></NavLink>
                    <button onClick={() => { setActiveDialog('knowledge'); toggleSidebar(); }} className="w-full flex items-center gap-4 p-4 rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"><BookOpen size={16} /><span className="text-[11px] font-black uppercase tracking-widest">Intelligence Base</span></button>
                  </nav>
                </div>

                <div className="pt-6 border-t border-[var(--glass-border)] space-y-4 flex-shrink-0">
                  <div className="flex items-center justify-between p-1.5 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)]">
                    <button onClick={() => setIsDarkMode(false)} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${!isDarkMode ? 'bg-[var(--text-primary)] text-[var(--bg-color)]' : 'text-[var(--text-secondary)]'}`}><Sun size={14} /></button>
                    <button onClick={() => setIsDarkMode(true)} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-[var(--text-primary)] text-[var(--bg-color)]' : 'text-[var(--text-secondary)]'}`}><Moon size={14} /></button>
                  </div>
                  <button onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-3 p-4 border border-[var(--glass-border)] rounded-2xl hover:bg-[var(--glass-bg)] transition-all"><LogIn size={18} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Entry</span></button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-hidden flex flex-col relative"><Outlet context={{ isProMode }} /></main>
      </div>

      {/* Dialogs */}
      <AnimatePresence>
        {activeDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveDialog(null)} className="absolute inset-0 bg-[var(--glass-overlay)] backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-lg max-h-[85vh] glass rounded-[32px] overflow-hidden border border-[var(--glass-border)] shadow-2xl transition-colors duration-300 flex flex-col mx-4 sm:mx-0`}>
              <div className="p-5 sm:p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-[var(--text-primary)]/[0.02] flex-shrink-0">
                <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                  {activeDialog === 'evidence' ? 'Evidence Vault' : activeDialog === 'laws' ? 'Statutes' : activeDialog === 'meter' ? 'Legal Position' : 'Intelligence Base'}
                </h2>
                <button onClick={() => setActiveDialog(null)} className="p-2 hover:bg-[var(--glass-bg)] rounded-full transition-colors"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar min-h-0">
                {activeDialog === 'evidence' && (
                  <div className="space-y-3">
                    {evidenceList.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)]">
                        <div className="w-9 h-9 bg-[var(--text-primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0"><FileText size={16} /></div>
                        <div className="flex-1 marquee-container min-w-0">
                          <div className="marquee-content font-bold text-xs tracking-tight text-[var(--text-primary)]">{item.name}</div>
                        </div>
                        <button className="p-2.5 hover:bg-[var(--text-primary)] hover:text-[var(--bg-color)] rounded-lg transition-all border border-[var(--glass-border)] flex-shrink-0"><Eye size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}

                {activeDialog === 'knowledge' && (
                  <div className="space-y-5 h-full flex flex-col">
                    <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                      {[
                        { label: 'Vectors', val: '1.2M+', icon: <Layers size={14} /> },
                        { label: 'Sources', val: kbFiles.length, icon: <FileText size={14} /> },
                        { label: 'Storage', val: '12.4GB', icon: <HardDrive size={14} /> },
                        { label: 'Uptime', val: '99.9%', icon: <Database size={14} /> }
                      ].map((s, i) => (
                        <div key={i} className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl flex flex-col items-center text-center justify-center space-y-1.5">
                          <div className="text-[var(--text-primary)] opacity-40">{s.icon}</div>
                          <div className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{s.label}</div>
                          <div className="text-xs font-black tracking-tight text-[var(--text-primary)]">{s.val}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 flex-1 flex flex-col min-h-0">
                      <div className="relative flex-shrink-0">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                        <input value={kbSearch} onChange={(e) => setKbSearch(e.target.value)} placeholder="Search Statutes..." className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold placeholder:text-[var(--text-secondary)]/40 text-[var(--text-primary)]" />
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredKbFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-3 p-3.5 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] group">
                            <div className="w-8 h-8 bg-[var(--text-primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0"><FileText size={14} /></div>
                            <div className="flex-1 marquee-container min-w-0">
                              <div className="marquee-content font-bold text-[10px] tracking-tight text-[var(--text-primary)]">{f}</div>
                            </div>
                            <button className="p-2 hover:bg-[var(--text-primary)] hover:text-[var(--bg-color)] rounded-lg transition-all border border-[var(--glass-border)] flex-shrink-0"><Download size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeDialog === 'laws' && (
                  <div className="space-y-8">
                    {lawsInvolved.map((law, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end gap-4"><span className="text-[11px] font-black uppercase tracking-tight max-w-[70%]">{law.name}</span><span className="text-xl font-black">{law.percentage}%</span></div>
                        <div className="h-2 w-full bg-[var(--glass-border)] rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${law.percentage}%` }} className="h-full bg-[var(--text-primary)]" /></div>
                      </div>
                    ))}
                  </div>
                )}

                {activeDialog === 'meter' && (
                  <div className="space-y-8 text-center">
                    <div className="relative inline-flex items-center justify-center p-12">
                      <div className="absolute inset-0 bg-[var(--text-primary)]/10 blur-3xl rounded-full" />
                      <div className="relative"><span className="text-7xl font-black tracking-tighter">72</span><span className="text-2xl font-black">%</span></div>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed max-w-sm mx-auto">High evidential strength detected in <span className="text-[var(--text-primary)] font-bold">IPC 420</span> classification. Documentary evidence alignment is optimal for litigation strategy.</p>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {['Admissible', 'Verified', 'Precedent', 'Low Risk'].map((tag, i) => (
                        <div key={i} className="py-3 px-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-[9px] font-black uppercase tracking-widest">{tag}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 10px; }
        .glass { background: var(--glass-bg); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px); }
      `}</style>
    </div>
  );
};
