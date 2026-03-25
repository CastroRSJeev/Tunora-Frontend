import React, { useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1,
} from 'lucide-react';
import usePlayerStore from '../stores/playerStore';
import api from '../lib/api';

export default function MusicPlayer() {
  const audioRef = React.useRef(new Audio());
  const {
    currentTrack, isPlaying, progress, duration,
    volume, isMuted, isShuffled, repeatMode,
    togglePlay, next, previous, setVolume, toggleMute,
    toggleShuffle, cycleRepeat, setProgress, setDuration, pause, play
  } = usePlayerStore();

  const [isDragging, setIsDragging] = React.useState(false);
  const isDraggingRef = React.useRef(false); // Ref for event listeners to avoid closure staleness
  const [hoveredSeek, setHoveredSeek] = React.useState(false);
  const progressBarRef = useRef(null);

  const playStartRef = useRef(null);
  const lastTrackIdRef = useRef(null);

  // Record play when track changes or component unmounts
  const recordPlay = (trackId, startTime) => {
    if (!trackId || !startTime) return;
    const durationListened = (Date.now() - startTime) / 1000;
    if (durationListened < 5) return; // Only count if listened > 5 seconds
    api.post(`songs/${trackId}/play/`, { duration_listened: Math.round(durationListened) }).catch(() => {});
  };

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!isDraggingRef.current) setProgress(audio.currentTime);
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      const { repeatMode, next, queue, currentTrack } = usePlayerStore.getState();
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (repeatMode === 'all') {
        next();
      } else {
        // Mode 'off'
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        if (currentIndex < queue.length - 1) {
          next();
        } else {
          pause();
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [next, repeatMode, setDuration, setProgress]);

  useEffect(() => {
    const trackUrl = currentTrack?.audio_url || currentTrack?.url;
    if (trackUrl) {
      const audio = audioRef.current;
      const isNewTrack = lastTrackIdRef.current !== currentTrack.id;

      if (isNewTrack) {
        audio.src = trackUrl;
        audio.load();
        audio.currentTime = 0;
        setProgress(0);
        lastTrackIdRef.current = currentTrack.id;
      }

      if (isPlaying) {
        // Use a timeout or promise-aware play to avoid race conditions with load()
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Playback failed:", error);
          });
        }
      } else {
        audio.pause();
      }
    } else {
      // If no track, ensure audio is paused and src is cleared
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, [currentTrack?.id, currentTrack?.audio_url, currentTrack?.url, isPlaying, setProgress]);

  // Track play start/end for recording
  useEffect(() => {
    if (currentTrack?.id && isPlaying) {
      // If different track than before, record old one
      if (lastTrackIdRef.current && lastTrackIdRef.current !== currentTrack.id) {
        recordPlay(lastTrackIdRef.current, playStartRef.current);
      }
      // Start timing new track
      if (lastTrackIdRef.current !== currentTrack.id || !playStartRef.current) {
        playStartRef.current = Date.now();
      }
      lastTrackIdRef.current = currentTrack.id;
    } else if (!isPlaying && lastTrackIdRef.current) {
      // Paused: record the play
      recordPlay(lastTrackIdRef.current, playStartRef.current);
      playStartRef.current = null;
    }
  }, [currentTrack?.id, isPlaying]);

  // Record play on page close/navigate
  useEffect(() => {
    const handleUnload = () => {
      if (lastTrackIdRef.current && playStartRef.current) {
        // We use sendBeacon if available for more reliability on close, 
        // but since we wrap api in post, we'll try a regular post or beacon.
        const trackId = lastTrackIdRef.current;
        const durationListened = Math.round((Date.now() - playStartRef.current) / 1000);
        if (durationListened >= 5) {
          // fetch with keepalive is modern alternative to sendBeacon
          const API_BASE_URL = 'http://localhost:8000/api/';
          fetch(`${API_BASE_URL}songs/${trackId}/play/`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('tunora_access_token')}` 
            },
            body: JSON.stringify({ duration_listened: durationListened }),
            keepalive: true
          }).catch(() => {});
        }
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleProgressChange = (newTime) => {
    if (isNaN(newTime) || !isFinite(newTime)) return;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const handleSeekStart = (e) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    handleSeekMove(e);
  };

  const handleSeekMove = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    
    // Smoothly update UI but skip audio update during drag for performance if desired, 
    // but usually audio sync feels better.
    setProgress(newTime);
  };

  const handleSeekEnd = () => {
    if (isDraggingRef.current) {
      handleProgressChange(usePlayerStore.getState().progress);
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  // Global mouse handlers for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleSeekMove);
      window.addEventListener('mouseup', handleSeekEnd);
    } else {
      window.removeEventListener('mousemove', handleSeekMove);
      window.removeEventListener('mouseup', handleSeekEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleSeekMove);
      window.removeEventListener('mouseup', handleSeekEnd);
    };
  }, [isDragging, progress]);

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  if (!currentTrack) return null;

  return (
    <div
      className="glass-heavy"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '20px',
        borderTop: '1px solid var(--glass-border)',
      }}
    >
      {/* Track info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 25%', minWidth: 0 }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            background: currentTrack
              ? `url(${currentTrack.cover_url || currentTrack.cover}) center/cover`
              : 'linear-gradient(135deg, var(--color-surface), var(--color-surface-hover))',
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentTrack?.title || currentTrack?.name || 'No track selected'}
          </p>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentTrack?.artist || currentTrack?.author || 'Select a song to play'}
          </p>
        </div>
      </div>

      {/* Center controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 50%', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={toggleShuffle}
            style={{
              background: 'none',
              border: 'none',
              color: isShuffled ? '#7c3aed' : 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              transition: 'color 0.2s',
            }}
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={previous}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              transition: 'color 0.2s',
            }}
          >
            <SkipBack size={18} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 0 15px rgba(124,58,237,0.3)',
            }}
          >
            {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{ marginLeft: '2px' }} />}
          </button>
          <button
            onClick={next}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              transition: 'color 0.2s',
            }}
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
          <button
            onClick={cycleRepeat}
            style={{
              background: 'none',
              border: 'none',
              color: repeatMode === 'one' ? '#c084fc' : repeatMode === 'all' ? '#7c3aed' : 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              transition: 'all 0.2s',
              transform: repeatMode !== 'off' ? 'scale(1.1)' : 'scale(1)',
              filter: repeatMode !== 'off' ? 'drop-shadow(0 0 4px rgba(124,58,237,0.4))' : 'none'
            }}
            title={repeatMode === 'one' ? 'Repeat One' : repeatMode === 'all' ? 'Repeat All' : 'Repeat Off'}
          >
            {repeatMode === 'one' ? <Repeat1 size={17} strokeWidth={2.5} /> : <Repeat size={17} strokeWidth={repeatMode === 'all' ? 2.5 : 2} />}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '500px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', minWidth: '35px', textAlign: 'right' }}>
            {formatTime(progress)}
          </span>
          <div
            ref={progressBarRef}
            style={{
              flex: 1,
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255,255,255,0.06)',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseDown={handleSeekStart}
            onMouseEnter={() => setHoveredSeek(true)}
            onMouseLeave={() => setHoveredSeek(false)}
          >
            {/* Background track */}
            <div style={{ position: 'absolute', inset: 0, background: 'var(--color-border)', borderRadius: '3px' }} />
            
            {/* Active progress */}
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                borderRadius: '3px',
                background: 'linear-gradient(90deg, #7c3aed, #c084fc)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Drag handle */}
              {(isDragging || hoveredSeek) && (
                <div style={{
                  position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)',
                  width: '12px', height: '12px', background: '#fff', borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(124,58,237,0.5)', zIndex: 2
                }} />
              )}
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', minWidth: '35px' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 25%', justifyContent: 'flex-end' }}>
        <button
          onClick={toggleMute}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{
            width: '90px',
            accentColor: '#7c3aed',
          }}
        />
      </div>

      {/* Responsive: hide volume on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .glass-heavy > div:last-of-type { display: none !important; }
        }
      `}</style>
    </div>
  );
}
