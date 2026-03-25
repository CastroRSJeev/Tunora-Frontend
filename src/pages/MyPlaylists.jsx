import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, ListMusic, Globe, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { PlaylistCard } from '../components/ui/PlaylistCard';

export default function MyPlaylists() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Create Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('songs/playlists/mine/');
      setPlaylists(data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to load playlists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      const { data } = await api.post('songs/playlists/create/', {
        name: newName,
        description: newDesc,
        is_public: isPublic
      });
      setPlaylists([data, ...playlists]);
      setIsCreating(false);
      setNewName('');
      setNewDesc('');
      setIsPublic(false);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create playlist');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredPlaylists = playlists.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ position: 'fixed', top: 0, left: '-10%', width: '400px', height: '400px', background: 'rgba(124,58,237,0.06)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative', zIndex: 1,
          padding: '24px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'rgba(240,240,245,0.6)', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', fontFamily: 'var(--font-body)' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,240,245,0.6)'}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListMusic style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(124,58,237,0.8)', fontWeight: 600 }}>Your Library</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f0f5', margin: 0, fontFamily: 'var(--font-heading)' }}>
              My Playlists
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Find a playlist..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '10px 16px', color: '#f0f0f5', fontSize: '13px',
                  width: '240px', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-body)'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            
            <button
              onClick={() => setIsCreating(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                border: '1px solid rgba(124,58,237,0.4)',
                color: '#fff', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s ease',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 8px 20px rgba(124,58,237,0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={16} /> Create Playlist
            </button>
          </div>
        </div>
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 40px 120px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 0', gap: '20px' }}>
            <Loader2 style={{ width: '40px', height: '40px', color: '#7c3aed' }} className="animate-spin" />
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 48px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', maxWidth: '560px', margin: '0 auto' }}>
            <p style={{ color: 'rgba(248,113,113,0.6)' }}>{error}</p>
          </div>
        ) : (
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', width: '100%' }}>
            <AnimatePresence mode="popLayout">
              {filteredPlaylists.map((playlist, i) => (
                <motion.div layout key={playlist.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: i < 15 ? i * 0.03 : 0 }}>
                  <PlaylistCard playlist={playlist} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && playlists.length > 0 && filteredPlaylists.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.3)' }}>
            No playlists match '{search}'
          </div>
        )}

        {!loading && playlists.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.3)' }}>
            You haven't created any playlists yet.
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreating && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 100 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed', top: 'calc(50% - 220px)', left: 'calc(50% - 240px)',
                width: '480px', background: '#0e0e16',
                border: '1px solid rgba(124,58,237,0.25)', borderRadius: '20px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                zIndex: 101, display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}
            >
              <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f0f0f5' }}>Create Playlist</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(240,240,245,0.5)' }}>Give your new playlist a name and description.</p>
              </div>

              <form onSubmit={handleCreate} style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(240,240,245,0.7)', marginBottom: '8px' }}>Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="My Awesome Mix"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px', padding: '12px 16px', color: '#f0f0f5', fontSize: '14px', boxSizing: 'border-box',
                      fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(240,240,245,0.7)', marginBottom: '8px' }}>Description (optional)</label>
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Describe the vibe... (Helps AI recommendations)"
                    rows={3}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px', padding: '12px 16px', color: '#f0f0f5', fontSize: '14px', boxSizing: 'border-box',
                      fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color 0.2s', resize: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 16px', borderRadius: '8px',
                      background: isPublic ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isPublic ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      color: isPublic ? '#38bdf8' : 'rgba(240,240,245,0.6)',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s'
                    }}
                  >
                    {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                    {isPublic ? 'Public' : 'Private'}
                  </button>
                  <span style={{ fontSize: '12px', color: 'rgba(240,240,245,0.4)', lineHeight: 1.4 }}>
                    {isPublic ? "Anyone can search and see this playlist." : "Only you can see this playlist."}
                  </span>
                </div>

                {createError && <p style={{ margin: 0, color: '#f87171', fontSize: '13px' }}>{createError}</p>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    style={{ padding: '10px 20px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f5', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newName.trim() || createLoading}
                    style={{ padding: '10px 24px', borderRadius: '10px', background: newName.trim() ? '#7c3aed' : 'rgba(124,58,237,0.3)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: newName.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {createLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
