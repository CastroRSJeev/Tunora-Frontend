import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Lock, Globe, ListMusic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePlayerStore from '../../stores/playerStore';

export function PlaylistCard({ playlist }) {
  const navigate = useNavigate();
  const { play, currentTrack } = usePlayerStore();
  const [hovered, setHovered] = useState(false);

  // For a playlist, "play" might play the first song, but we mainly want to open its details
  const handleOpen = () => {
    navigate(`/playlists/${playlist.id}`);
  };

  const handlePlayFirst = (e) => {
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      const firstSongObj = playlist.songs[0].song;
      play({
        ...firstSongObj,
        url: firstSongObj.audio_url || firstSongObj.url,
        cover: firstSongObj.cover_url || firstSongObj.cover,
        title: firstSongObj.title || firstSongObj.name,
        artist: firstSongObj.artist || firstSongObj.author,
        playlistRef: playlist.id, // optional context
      }, playlist.songs.map(ps => ps.song));
    }
  };

  const cover = playlist.cover_url || (playlist.songs?.[0]?.song?.cover_url) || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop';
  const name = playlist.name || 'Untitled';
  const owner = playlist.owner?.username || 'Unknown';
  const songCount = playlist.song_count || 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleOpen}
      style={{
        position: 'relative',
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '16px',
        padding: '16px',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.3)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden' }}>
        <img src={cover} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', transform: hovered ? 'scale(1.05)' : 'none' }} />
        
        {/* Play Icon Overlay */}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease',
        }}>
          <button
            onClick={handlePlayFirst}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: '#7c3aed', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transform: hovered ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(124,58,237,0.4)'
            }}
          >
            <Play style={{ width: '18px', height: '18px', fill: '#fff', color: '#fff', marginLeft: '3px' }} />
          </button>
        </div>

        {/* Public/Private Badge */}
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          borderRadius: '20px', padding: '4px 8px',
          display: 'flex', alignItems: 'center', gap: '4px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {playlist.is_public ? <Globe size={10} color="#a78bfa" /> : <Lock size={10} color="#f87171" />}
          <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>
            {playlist.is_public ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#f0f0f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(240,240,245,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          By {owner}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <ListMusic size={14} color="rgba(240,240,245,0.5)" />
        <span style={{ fontSize: '12px', color: 'rgba(240,240,245,0.5)' }}>
          {songCount} {songCount === 1 ? 'song' : 'songs'}
        </span>
      </div>
    </div>
  );
}
