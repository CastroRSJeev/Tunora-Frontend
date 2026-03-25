import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowLeft, Loader2, ListMusic, Globe, Lock, Trash2, Edit2 } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../stores/authStore';
import usePlayerStore from '../stores/playerStore';
import { SongCard } from '../components/ui/SongCard';

export default function PlaylistDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { play, currentTrack } = usePlayerStore();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchPlaylist = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`songs/playlists/${id}/`);
      setPlaylist(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to load playlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const handlePlayAll = () => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      const firstSongObj = playlist.songs[0].song;
      play({
        ...firstSongObj,
        url: firstSongObj.audio_url || firstSongObj.url,
        cover: firstSongObj.cover_url || firstSongObj.cover,
        title: firstSongObj.title || firstSongObj.name,
        artist: firstSongObj.artist || firstSongObj.author,
        playlistRef: playlist.id,
      }, playlist.songs.map(ps => ps.song));
    }
  };

  const handleRemoveSong = async (songId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`songs/playlists/${playlist.id}/remove/${songId}/`);
      setPlaylist(prev => ({
        ...prev,
        songs: prev.songs.filter(s => s.song.id !== songId),
        song_count: prev.song_count - 1
      }));
    } catch (err) {
      console.error('Failed to remove song', err);
    }
  };

  const filteredSongs = playlist?.songs.filter(ps => 
    (ps.song.title || ps.song.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (ps.song.artist || ps.song.author || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '72px' }}>
        <Loader2 style={{ width: '40px', height: '40px', color: '#7c3aed' }} className="animate-spin" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '72px' }}>
        <p style={{ color: '#f87171', fontSize: '18px' }}>{error || 'Playlist not found.'}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  const isOwner = user?.id === playlist.owner?.id;
  const cover = playlist.cover_url || (playlist.songs?.[0]?.song?.cover_url) || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop';
  
  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', width: '100%', boxSizing: 'border-box' }}>
      {/* Background blur using cover */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '400px', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(100px) brightness(0.3)', zIndex: 0, opacity: 0.6 }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '40px 40px 120px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'rgba(240,240,245,0.6)', cursor: 'pointer', fontSize: '14px', marginBottom: '32px', fontFamily: 'var(--font-body)' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,240,245,0.6)'}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '220px', height: '220px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', flexShrink: 0 }}>
            <img src={cover} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(240,240,245,0.8)', fontWeight: 600 }}>Playlist</span>
              {playlist.is_public ? <Globe size={14} color="#38bdf8" /> : <Lock size={14} color="#f87171" />}
            </div>
            
            <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.02em', color: '#f0f0f5', margin: '0 0 16px', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
              {playlist.name}
            </h1>
            
            {playlist.description && (
              <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'rgba(240,240,245,0.6)', maxWidth: '600px', lineHeight: 1.6 }}>
                {playlist.description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'rgba(240,240,245,0.8)' }}>
              <span style={{ fontWeight: 600, color: '#c084fc' }}>{playlist.owner?.username}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ListMusic size={14} /> {playlist.song_count} songs</span>
            </div>
          </div>
        </div>

        {/* Play Button & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <button
            onClick={handlePlayAll}
            disabled={playlist.songs.length === 0}
            style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#7c3aed', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: playlist.songs.length === 0 ? 'default' : 'pointer',
              opacity: playlist.songs.length === 0 ? 0.5 : 1,
              boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={e => { if (playlist.songs.length > 0) e.currentTarget.style.transform = 'scale(1.05)' }}
            onMouseLeave={e => { if (playlist.songs.length > 0) e.currentTarget.style.transform = 'scale(1)' }}
          >
            <Play style={{ width: '24px', height: '24px', fill: '#fff', color: '#fff', marginLeft: '4px' }} />
          </button>

          {playlist.songs.length > 0 && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search in playlist..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '10px 16px', color: '#f0f0f5', fontSize: '13px',
                  width: '280px', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-body)'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          )}
        </div>

        {/* Song List */}
        <div>
          {playlist.songs.length === 0 ? (
            <div style={{ padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(240,240,245,0.4)', textAlign: 'center' }}>
              No songs in this playlist yet.
            </div>
          ) : filteredSongs.length === 0 ? (
            <div style={{ padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(240,240,245,0.4)', textAlign: 'center' }}>
              No songs match '{search}'
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {filteredSongs.map((playlistSong, idx) => (
                <div key={playlistSong.id} style={{ position: 'relative' }}>
                  <SongCard 
                    song={playlistSong.song} 
                    queue={playlist.songs.map(ps => ps.song)} 
                  />
                  {isOwner && (
                    <button
                      onClick={(e) => handleRemoveSong(playlistSong.song.id, e)}
                      style={{
                        position: 'absolute', top: '-8px', right: '-8px', width: '28px', height: '28px',
                        borderRadius: '50%', background: 'rgba(239,68,68,0.9)', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                        boxShadow: '0 4px 12px rgba(239,68,68,0.4)'
                      }}
                      title="Remove from playlist"
                    >
                      <Trash2 size={12} color="#fff" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
