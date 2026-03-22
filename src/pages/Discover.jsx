import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc, Search, Sparkles, Loader2, Music2, X, Wand2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../stores/authStore';
import { SongCard } from '../components/ui/SongCard';

export default function Discover() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // AI modal state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const textareaRef = useRef(null);

  const isArtist = user?.role === 'artist';

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('songs/');
        const allSongs = Array.isArray(data) ? data : (data.results || []);
        const preferredGenres = user?.favourite_genres || [];
        const preferredAuthors = user?.favourite_artists || [];
        const tier1 = allSongs.filter(s =>
          preferredGenres.some(g => (s.genre || '').toLowerCase().includes(g.toLowerCase())) &&
          preferredAuthors.some(a => (s.artist || s.author || '').includes(a))
        );
        const tier2 = allSongs.filter(s =>
          preferredGenres.some(g => (s.genre || '').toLowerCase().includes(g.toLowerCase())) && !tier1.find(t => t.id === s.id)
        );
        const tier3 = allSongs.filter(s =>
          preferredAuthors.some(a => (s.artist || s.author || '').includes(a)) &&
          !tier1.find(t => t.id === s.id) && !tier2.find(t => t.id === s.id)
        );
        const tier4 = allSongs.filter(s =>
          !tier1.find(t => t.id === s.id) && !tier2.find(t => t.id === s.id) && !tier3.find(t => t.id === s.id)
        );
        setSongs([...tier1, ...tier2, ...tier3, ...tier4]);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Unable to load feed.');
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSongs();
  }, [user]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (aiOpen) setTimeout(() => textareaRef.current?.focus(), 100);
    else { setAiPrompt(''); setAiResults([]); setAiError(null); }
  }, [aiOpen]);

  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiResults([]);
    try {
      const { data } = await api.post('recommendations/recommend/', { prompt: aiPrompt });
      setAiResults(data.results || []);
    } catch (err) {
      setAiError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setAiLoading(false);
    }
  };

  const filteredSongs = songs.filter(s =>
    (s.title || s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.artist || s.author || '').toLowerCase().includes(search.toLowerCase())
  );

  const SUGGESTIONS = ['a cool song for car edit', 'chill vibes for late night', 'hype gym workout', 'sad rainy day'];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', width: '100%', boxSizing: 'border-box' }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: 0, left: '30%', width: '700px', height: '500px', background: 'rgba(124,58,237,0.07)', filter: 'blur(130px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: '400px', height: '400px', background: 'rgba(109,40,217,0.05)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

      {/* ── Top bar: search | title | AI button ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative', zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '10px 40px 10px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          gap: '24px',
        }}
      >
        {/* Left: search bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div className="discover-search-wrap">
            <Search className="discover-search-icon" />
            <input
              type="text"
              placeholder="Search songs, artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="discover-search-input"
            />

          </div>
        </div>

        {/* Center: title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles style={{ width: '11px', height: '11px', color: '#a78bfa' }} />
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(167,139,250,0.6)', fontWeight: 600 }}>Personalized for you</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f0f5', margin: 0, fontFamily: 'var(--font-heading)', lineHeight: 1.15, whiteSpace: 'nowrap' }}>
            Discover Music
          </h1>
        </div>

        {/* Right: Upload (artist only) + AI button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {isArtist && (
            <>
              <button
                onClick={() => navigate('/my-uploads')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'rgba(240,240,245,0.7)',
                  fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#f0f0f5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(240,240,245,0.7)'; }}
              >
                <Music2 style={{ width: '14px', height: '14px' }} />
                My Uploads
              </button>
              <button
                onClick={() => navigate('/upload')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'rgba(240,240,245,0.7)',
                  fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#f0f0f5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(240,240,245,0.7)'; }}
              >
                <Upload style={{ width: '14px', height: '14px' }} />
                Upload
              </button>
            </>
          )}
          <button
            onClick={() => setAiOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(109,40,217,0.15))',
              border: '1px solid rgba(124,58,237,0.35)',
              borderRadius: '12px',
              color: '#c084fc',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(109,40,217,0.25))'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(109,40,217,0.15))'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Wand2 style={{ width: '14px', height: '14px' }} />
            AI Recommend
          </button>
        </div>
      </motion.div>

      {/* ── Song grid ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '24px 40px 120px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: '20px' }}>
            <Loader2 style={{ width: '40px', height: '40px', color: '#7c3aed' }} className="animate-spin" />
            <p style={{ color: 'rgba(240,240,245,0.35)', fontWeight: 500, fontSize: '14px' }} className="animate-pulse">Personalizing your experience...</p>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 48px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', maxWidth: '560px', margin: '0 auto' }}>
            <Music2 style={{ width: '36px', height: '36px', color: '#f87171', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f0f0f5', marginBottom: '10px' }}>Sync Required</h2>
            <p style={{ color: 'rgba(248,113,113,0.6)', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>{typeof error === 'string' ? error : 'Failed to load.'}</p>
            <button onClick={() => window.location.reload()} style={{ padding: '12px 32px', borderRadius: '50px', background: '#fff', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '14px' }}>Retry</button>
          </div>
        ) : (
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', width: '100%' }}>
            <AnimatePresence mode="popLayout">
              {filteredSongs.map((song, i) => (
                <motion.div layout key={song.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: i < 12 ? i * 0.03 : 0 }}>
                  <SongCard song={song} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {songs.length === 0 && !loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 0', textAlign: 'center' }}>
            <Disc style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.06)', marginBottom: '20px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f0f0f5', marginBottom: '8px' }}>The Stage is Quiet</h2>
            <p style={{ color: 'rgba(255,255,255,0.2)', maxWidth: '360px', fontSize: '14px' }}>No tracks found. Check back later.</p>
          </div>
        )}
      </div>

      {/* ── AI Recommendation Modal ── */}
      <AnimatePresence>
        {aiOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAiOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 100 }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: 'calc(50% - 40vh)',
                left: 'calc(50% - 280px)',
                width: '560px',
                maxHeight: '80vh',
                background: '#0e0e16',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: '20px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                zIndex: 101,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(109,40,217,0.2))', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wand2 style={{ width: '15px', height: '15px', color: '#c084fc' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f0f0f5' }}>AI Recommend</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(240,240,245,0.35)' }}>Describe your vibe, get matched songs</p>
                  </div>
                </div>
                <button onClick={() => setAiOpen(false)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X style={{ width: '14px', height: '14px', color: 'rgba(240,240,245,0.5)' }} />
                </button>
              </div>

              {/* Scrollable body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                {/* Prompt input */}
                <textarea
                  ref={textareaRef}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault(); }}
                  placeholder="e.g. a cool song for car edit, chill vibes for late night..."
                  rows={2}
                  style={{
                    width: '100%', resize: 'none',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: '12px', padding: '12px 16px',
                    color: '#f0f0f5', fontSize: '14px', lineHeight: 1.6,
                    fontFamily: 'var(--font-body)', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.2)'}
                />

                {/* Suggestion chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => setAiPrompt(s)}
                      style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)', color: 'rgba(192,132,252,0.8)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}
                    >{s}</button>
                  ))}
                </div>

                {/* Search button */}
                <button
                  onClick={handleAiSearch}
                  disabled={aiLoading || !aiPrompt.trim()}
                  style={{
                    width: '100%', marginTop: '12px',
                    padding: '11px',
                    background: aiPrompt.trim() ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.4)',
                    borderRadius: '12px',
                    color: aiPrompt.trim() ? '#fff' : 'rgba(192,132,252,0.4)',
                    fontSize: '13px', fontWeight: 600,
                    cursor: aiPrompt.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--font-body)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  {aiLoading
                    ? <><Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> Finding matches...</>
                    : <><Wand2 style={{ width: '14px', height: '14px' }} /> Find Songs</>}
                </button>

                {/* Divider */}
                <div style={{ margin: '16px 0 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }} />

                {/* Results label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                  <Sparkles style={{ width: '12px', height: '12px', color: '#a78bfa' }} />
                  <span style={{ fontSize: '11px', color: 'rgba(167,139,250,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {aiResults.length > 0 ? `Top ${aiResults.length} matches` : 'Results'}
                  </span>
                </div>

                {/* Error */}
                {aiError && (
                  <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center', margin: '8px 0' }}>{aiError}</p>
                )}

                {/* Results grid */}
                {aiResults.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {aiResults.map((song, i) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <SongCard song={song} />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Empty state before search */}
                {!aiLoading && aiResults.length === 0 && !aiError && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(240,240,245,0.2)', fontSize: '13px' }}>
                    Describe the music you want above and hit Find Songs
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
