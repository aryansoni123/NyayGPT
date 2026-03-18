import React, { useState, useEffect } from 'react';
import { MapPin, ShieldAlert, Scale, Navigation, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const NearbyHelp: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLoading(false);
      },
      (err) => {
        console.error("Location access denied or failed:", err);
        setError("Unable to retrieve your location. Showing default results.");
        setLoading(false);
      }
    );
  }, []);

  const mapUrl = location 
    ? `https://maps.google.com/maps?q=lawyers+and+police+stations+near+${location.lat},${location.lng}&z=14&output=embed`
    : `https://maps.google.com/maps?q=lawyers+and+police+stations+near+Indore,+Madhya+Pradesh&z=13&output=embed`;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-10 bg-[var(--bg-color)] overflow-hidden h-full transition-colors duration-300 max-w-6xl mx-auto w-full">
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"><ArrowLeft size={14} /> Back to Session</button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl shadow-lg"><MapPin size={24} className="text-[var(--text-primary)]" /></div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-[var(--text-primary)] uppercase">Nearby Help</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-xs font-bold max-w-sm leading-relaxed uppercase tracking-wider opacity-60">
            Emergency verification and contact points.
          </p>
        </div>

        <div className="flex flex-row items-center justify-center gap-3 w-full sm:w-auto">
          {[
            { label: 'Law Firms', icon: <Scale size={16} />, count: '12 Found' },
            { label: 'Stations', icon: <ShieldAlert size={16} />, count: '4 Found' }
          ].map((cat, i) => (
            <div key={i} className="glass flex items-center gap-4 px-5 py-3 rounded-2xl border border-[var(--glass-border)] shadow-sm min-w-[140px]">
              <span className="text-[var(--text-primary)]">{cat.icon}</span>
              <div className="text-left">
                <div className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-widest">{cat.label}</div>
                <div className="text-[8px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">{cat.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 glass rounded-[40px] overflow-hidden border border-[var(--glass-border)] relative shadow-2xl group"
      >
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/20 backdrop-blur-3xl z-10">
             <div className="w-16 h-16 border-4 border-[var(--glass-border)] border-t-[var(--text-primary)] rounded-full animate-spin" />
             <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] animate-pulse">Scanning Grid Coordinates</div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <iframe 
              src={mapUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(1.2) contrast(1.1)' }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
            
            <div className="absolute inset-0 pointer-events-none border-[1px] border-[var(--glass-border)] rounded-[40px]" />
            
            <button className="absolute bottom-8 right-8 bg-[var(--text-primary)] text-[var(--bg-color)] px-8 py-4 rounded-3xl font-black text-sm flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
              <Navigation size={18} />
              Verify Route
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
