import React, { useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1,
} from 'lucide-react';
import usePlayerStore from '../stores/playerStore';

export default function MusicPlayer() {
  const audioRef = React.useRef(new Audio());
  const {
    currentTrack, isPlaying, progress, duration,
    volume, isMuted, isShuffled, repeatMode,
    togglePlay, next, previous, setVolume, toggleMute,
    toggleShuffle, cycleRepeat, setProgress, setDuration
  } = usePlayerStore();

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
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
    if (currentTrack?.url) {
      // Only update src if it's a different track to prevent resetting currentTime to 0 on resume
      if (audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
      }
      
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack?.url, isPlaying]);

  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleProgressChange = (newTime) => {
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

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
              ? `url(${currentTrack.cover}) center/cover`
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
            {currentTrack?.title || 'No track selected'}
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
            {currentTrack?.artist || 'Select a song to play'}
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
              color: repeatMode !== 'off' ? '#7c3aed' : 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              transition: 'color 0.2s',
            }}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '500px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', minWidth: '35px', textAlign: 'right' }}>
            {formatTime(progress)}
          </span>
          <div
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: 'var(--color-border)',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              handleProgressChange(percent * duration);
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                borderRadius: '2px',
                background: 'linear-gradient(90deg, #7c3aed, #c084fc)',
                transition: 'width 0.1s linear',
              }}
            />
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
