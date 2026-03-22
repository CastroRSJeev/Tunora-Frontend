import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import usePlayerStore from '../../stores/playerStore';

export function SongCard({ song }) {
  const { play, currentTrack, isPlaying, pause } = usePlayerStore();
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);
  const isCurrentlyPlaying = currentTrack?.id === song.id && isPlaying;

  const handleMouseMove = (e) => {
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

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrentlyPlaying) pause();
    else play({
      ...song,
      url: song.audio_url || song.url,
      cover: song.cover_url || song.cover,
      title: song.name || song.title,
      artist: song.author || song.artist,
    });
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
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease', zIndex: 3 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
            style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Heart style={{ width: '13px', height: '13px', color: liked ? '#f43f5e' : 'rgba(240,240,245,0.5)', fill: liked ? '#f43f5e' : 'none' }} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <MoreHorizontal style={{ width: '13px', height: '13px', color: 'rgba(240,240,245,0.5)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
