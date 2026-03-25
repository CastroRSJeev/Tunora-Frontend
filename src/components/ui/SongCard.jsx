import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, MoreHorizontal, Loader2, ListMusic, Plus, X, AlertTriangle } from 'lucide-react';
import usePlayerStore from '../../stores/playerStore';
import api from '../../lib/api';

export function SongCard({ song, queue }) {
  const { play, currentTrack, isPlaying, pause } = usePlayerStore();
  const [liked, setLiked] = useState(song?.is_liked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  
  // Playlist Modal State
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [addToPlaylistError, setAddToPlaylistError] = useState(null);
  const [addToPlaylistSuccess, setAddToPlaylistSuccess] = useState(null);

  const cardRef = useRef(null);
  const isCurrentlyPlaying = currentTrack?.id === song.id && isPlaying;

  useEffect(() => {
    if (showPlaylistModal) {
      const fetchPlaylists = async () => {
        setPlaylistsLoading(true);
        setAddToPlaylistError(null);
        try {
          const { data } = await api.get('songs/playlists/mine/');
          setMyPlaylists(data || []);
        } catch (err) {
          setAddToPlaylistError('Failed to load playlists');
        } finally {
          setPlaylistsLoading(false);
        }
      };
      fetchPlaylists();
    }
  }, [showPlaylistModal]);

  const handleAddToPlaylist = async (playlistId) => {
    setAddToPlaylistError(null);
    setAddToPlaylistSuccess(null);
    try {
      await api.post(`songs/playlists/${playlistId}/add/`, { song_id: song.id });
      setAddToPlaylistSuccess('Added to playlist!');
      
      // Auto-close modal after 1.5s on success
      setTimeout(() => {
        setShowPlaylistModal(false);
        setAddToPlaylistSuccess(null);
      }, 1500);
    } catch (err) {
      setAddToPlaylistError(err.response?.data?.error || 'Failed to add song');
    }
  };

  const handleMouseMove = (e) => {
    if (showPlaylistModal) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to 1
    const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1
    setTilt({ x: -dy * 12, y: dx * 12 });
    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  React.useEffect(() => {
    if (song?.is_liked !== undefined) {
      setLiked(song.is_liked);
    }
  }, [song?.is_liked]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    
    setIsLiking(true);
    const prevLiked = liked;
    setLiked(!prevLiked); // Optimistic UI update
    
    try {
      await api.post(`songs/${song.id}/like/`);
    } catch (error) {
      console.error('Failed to toggle like', error);
      setLiked(prevLiked); // Revert on failure
    } finally {
      setIsLiking(false);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (song.is_blocked) return;
    if (isCurrentlyPlaying) pause();
    else play({
      ...song,
      url: song.audio_url || song.url,
      cover: song.cover_url || song.cover,
      title: song.name || song.title,
      artist: song.author || song.artist,
    }, queue);
  };

  const cover = song.cover_url || song.cover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop';
  const title = song.name || song.title || 'Unknown';
  const artist = song.author || song.artist || 'Unknown Artist';
  const genre = Array.isArray(song.genre) ? song.genre.join(', ') : (song.genre || '');

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handlePlay}
      style={{
        position: 'relative',
        perspective: '800px',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      {/* The tilt wrapper */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '12px',
          background: isCurrentlyPlaying
            ? 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(17,17,24,0.95))'
            : 'linear-gradient(135deg, #1a1a24, #111118)',
          border: `1px solid ${isCurrentlyPlaying ? 'rgba(124,58,237,0.5)' : hovered ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '14px',
          position: 'relative',
          overflow: 'hidden',
          transform: hovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : 'rotateX(0deg) rotateY(0deg) scale(1)',
          transition: hovered ? 'transform 80ms ease-out, border-color 0.3s' : 'transform 400ms ease, border-color 0.3s',
          boxShadow: hovered
            ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.15), 0 0 ${isCurrentlyPlaying ? '30px' : '20px'} rgba(124,58,237,${isCurrentlyPlaying ? '0.2' : '0.1'})`
            : `0 2px 8px rgba(0,0,0,0.3)`,
          willChange: 'transform',
        }}
      >
        {/* Glare layer */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '14px',
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Scan line */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '14px',
          background: 'linear-gradient(to bottom, transparent, rgba(124,58,237,0.08), transparent)',
          animation: 'songcard-scan 2.5s linear infinite',
          pointerEvents: 'none', zIndex: 1,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s',
        }} />

        {/* Corner elements */}
        {hovered && <>
          <span style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderTop: '1.5px solid rgba(124,58,237,0.7)', borderLeft: '1.5px solid rgba(124,58,237,0.7)', borderRadius: '2px 0 0 0', zIndex: 2, pointerEvents: 'none', boxShadow: '0 0 6px rgba(124,58,237,0.4)' }} />
          <span style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderTop: '1.5px solid rgba(124,58,237,0.7)', borderRight: '1.5px solid rgba(124,58,237,0.7)', borderRadius: '0 2px 0 0', zIndex: 2, pointerEvents: 'none', boxShadow: '0 0 6px rgba(124,58,237,0.4)' }} />
          <span style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderBottom: '1.5px solid rgba(124,58,237,0.7)', borderLeft: '1.5px solid rgba(124,58,237,0.7)', borderRadius: '0 0 0 2px', zIndex: 2, pointerEvents: 'none', boxShadow: '0 0 6px rgba(124,58,237,0.4)' }} />
          <span style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderBottom: '1.5px solid rgba(124,58,237,0.7)', borderRight: '1.5px solid rgba(124,58,237,0.7)', borderRadius: '0 0 2px 0', zIndex: 2, pointerEvents: 'none', boxShadow: '0 0 6px rgba(124,58,237,0.4)' }} />
        </>}

        {/* Particles */}
        {hovered && [
          { top: '40%', left: '20%', tx: 1, ty: -1 },
          { top: '60%', right: '20%', tx: -1, ty: -1 },
          { top: '20%', left: '40%', tx: 0.5, ty: 1 },
          { top: '75%', right: '35%', tx: -0.5, ty: 1 },
        ].map((p, i) => (
          <span key={i} style={{
            position: 'absolute', width: '3px', height: '3px',
            background: '#a78bfa', borderRadius: '50%',
            top: p.top, left: p.left, right: p.right,
            animation: `songcard-particle-${i % 2 === 0 ? 'a' : 'b'} 1.8s ease-out infinite`,
            animationDelay: `${i * 0.3}s`,
            zIndex: 2, pointerEvents: 'none',
          }} />
        ))}

        {/* Cover — z-index above effects */}
        <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, zIndex: 3 }}>
          <img
            src={cover}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hovered || isCurrentlyPlaying ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}>
            {isCurrentlyPlaying ? (
              <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '16px' }}>
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ['6px', '14px', '6px'] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay, ease: 'easeInOut' }}
                    style={{ width: '3px', background: '#a78bfa', borderRadius: '2px' }}
                  />
                ))}
              </div>
            ) : (
              <Play style={{ width: '18px', height: '18px', fill: '#fff', color: '#fff' }} />
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, zIndex: 3 }}>
          <p style={{
            fontSize: '14px', fontWeight: 600,
            color: isCurrentlyPlaying ? '#c084fc' : '#f0f0f5',
            margin: 0, marginBottom: '3px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            transition: 'color 0.2s',
          }}>
            {title}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(240,240,245,0.38)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {artist}
          </p>
          {genre && (
            <span style={{
              display: 'inline-block', marginTop: '5px',
              fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'rgba(167,139,250,0.6)', fontWeight: 600,
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '4px', padding: '1px 6px',
            }}>
              {genre.split(',')[0].trim()}
            </span>
          )}
          {song.is_blocked && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-tight">Blocked by Admin</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease', zIndex: 3 }}>
          <button
            onClick={handleLike}
            disabled={isLiking}
            style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLiking ? 'default' : 'pointer' }}
          >
            <Heart style={{ width: '13px', height: '13px', color: liked ? '#f43f5e' : 'rgba(240,240,245,0.5)', fill: liked ? '#f43f5e' : 'none' }} />
          </button>
          <button
            onClick={(e) => { 
                e.stopPropagation(); 
                setShowPlaylistModal(true); 
                setHovered(false);
                setTilt({ x: 0, y: 0 });
                setGlarePos({ x: 50, y: 50 });
            }}
            style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Add to Playlist"
          >
            <ListMusic style={{ width: '13px', height: '13px', color: 'rgba(240,240,245,0.5)' }} />
          </button>
        </div>
      </div>

      {showPlaylistModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowPlaylistModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ position: 'relative', width: '320px', background: '#0e0e16', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '20px', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#f0f0f5', fontWeight: 600 }}>Add to Playlist</h3>
              <button onClick={() => setShowPlaylistModal(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(240,240,245,0.5)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            {playlistsLoading ? (
              <div style={{ padding: '30px', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" color="#7c3aed" /></div>
            ) : myPlaylists.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(240,240,245,0.5)', fontSize: '13px', margin: '20px 0' }}>You have no playlists yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {myPlaylists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => handleAddToPlaylist(pl.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer',
                      textAlign: 'left', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#1a1a24', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={pl.cover_url || (pl.songs?.[0]?.song?.cover_url) || cover} alt={pl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#f0f0f5', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</span>
                  </button>
                ))}
              </div>
            )}
            {addToPlaylistError && (
              <div style={{ padding: '8px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', marginTop: '16px' }}>
                <p style={{ color: '#f87171', fontSize: '12px', margin: 0, textAlign: 'center' }}>{addToPlaylistError}</p>
              </div>
            )}
            
            {addToPlaylistSuccess && (
              <div style={{ padding: '8px 12px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', marginTop: '16px' }}>
                <p style={{ color: '#34d399', fontSize: '12px', margin: 0, textAlign: 'center', fontWeight: 600 }}>{addToPlaylistSuccess}</p>
              </div>
            )}
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
