import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ListMusic } from 'lucide-react';
import api from '../lib/api';
import useMusicStore from '../stores/musicStore';
import { PlaylistCard } from '../components/ui/PlaylistCard';

export default function Playlists() {
  const { publicPlaylists, setPublicPlaylists, isPlaylistsLoaded } = useMusicStore();
  const [loading, setLoading] = useState(!isPlaylistsLoaded);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!isPlaylistsLoaded || search) setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`songs/playlists/public/?q=${search}`);
        setPublicPlaylists(data || []);
      } catch (err) {
        if (!isPlaylistsLoaded) setError(err.response?.data?.error || err.message || 'Unable to load playlists.');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchPlaylists();
    }, search ? 300 : 0);

    return () => clearTimeout(debounce);
  }, [search]);

  const filteredPlaylists = publicPlaylists;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', width: '100%', boxSizing: 'border-box' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: 0, right: '0', width: '600px', height: '600px', background: 'rgba(56,189,248,0.05)', filter: 'blur(130px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'rgba(124,58,237,0.05)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative', zIndex: 1,
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', padding: '10px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div className="discover-search-wrap">
            <Search className="discover-search-icon" />
            <input
              type="text"
              placeholder="Search playlists, curators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="discover-search-input"
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ListMusic style={{ width: '12px', height: '12px', color: '#38bdf8' }} />
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(56,189,248,0.6)', fontWeight: 600 }}>Curated by community</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f0f5', margin: 0, fontFamily: 'var(--font-heading)', lineHeight: 1.15 }}>
            Public Playlists
          </h1>
        </div>
        <div></div>
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 40px 120px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 0', gap: '20px' }}>
            <Loader2 style={{ width: '40px', height: '40px', color: '#38bdf8' }} className="animate-spin" />
            <p style={{ color: 'rgba(240,240,245,0.35)', fontWeight: 500, fontSize: '14px' }}>Loading playlists...</p>
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

        {publicPlaylists.length > 0 && filteredPlaylists.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.3)' }}>
            No playlists match '{search}'
          </div>
        )}
      </div>
    </div>
  );
}
