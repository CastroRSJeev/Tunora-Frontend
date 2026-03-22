import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader2, Music, Users } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import api from '../lib/api';

const STEPS = [
  {
    key: 'genres',
    title: 'What genres do you love?',
    subtitle: 'Pick at least 3 genres to personalize your experience.',
    icon: Music,
    endpoint: 'songs/genres/',
  },
  {
    key: 'artists',
    title: 'Artists you enjoy?',
    subtitle: 'Pick at least 3 artists to help us understand your taste.',
    icon: Users,
    endpoint: 'songs/authors/',
  },
];

const EMOJI_MAP = {
  // Genres
  'Pop': '🎵', 'Hip Hop': '🎤', 'R&B': '💜', 'Rock': '🎸', 'Electronic': '⚡',
  'Jazz': '🎷', 'Classical': '🎻', 'Country': '🤠', 'Latin': '💃', 'Indie': '🌿',
  'Metal': '🤘', 'Soul': '✨', 'Reggae': '🌴', 'Blues': '🎺', 'Folk': '🪕',
  'Punk': '🔥', 'K-Pop': '💖', 'Afrobeats': '🥁',
  // Artists
  'Drake': '🦉', 'Taylor Swift': '🎶', 'The Weeknd': '🌃', 'Billie Eilish': '🖤',
  'Kendrick Lamar': '👑', 'Dua Lipa': '💫', 'Bad Bunny': '🐰', 'Post Malone': '🍻',
  'Ariana Grande': '🌙', 'Ed Sheeran': '🎸', 'Travis Scott': '🌵', 'SZA': '🦋',
  'Doja Cat': '🐱', 'Harry Styles': '🍉', 'Beyoncé': '👸', 'Kanye West': '🐻',
  'Rihanna': '💎', 'BTS': '💜', 'Coldplay': '🌈', 'Imagine Dragons': '🐉',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateOnboarding, isLoading: isUpdating } = useAuthStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    genres: [],
    artists: [],
  });
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState({
    genres: [],
    artists: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [genresRes, artistsRes] = await Promise.all([
          api.get('songs/genres/'),
          api.get('songs/authors/'),
        ]);
        
        // Handle both simple string arrays and object arrays (common in DRF)
        const processData = (res) => {
          if (Array.isArray(res.data)) {
            return res.data.map(item => typeof item === 'object' ? item.name : item);
          }
          return [];
        };

        setData({
          genres: processData(genresRes),
          artists: processData(artistsRes),
        });
      } catch (err) {
        console.error('Failed to fetch options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const currentStep = STEPS[step];
  const currentItems = data[currentStep.key] || [];

  const toggleItem = (item) => {
    setSelections((prev) => {
      const key = currentStep.key;
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(item)
          ? current.filter((i) => i !== item)
          : [...current, item],
      };
    });
  };

  const canProceed = selections[currentStep.key].length >= 3;

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      try {
        await updateOnboarding({
          favourite_genres: selections.genres,
          favourite_moods: [], // Not collected in new flow
          favourite_artists: selections.artists,
        });
        navigate('/discover');
      } catch {
        // error handled in store
        navigate('/discover');
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => navigate('/');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        position: 'relative',
        backgroundColor: '#09090b',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 60%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          height: '4px',
          borderRadius: '2px',
          background: '#27272a',
          marginBottom: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #7c3aed, #c084fc)',
          }}
        />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%',
            maxWidth: '700px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Step header */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'rgba(124,58,237,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <currentStep.icon size={24} color="#a855f7" />
          </div>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            {currentStep.title}
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '15px', marginBottom: '36px', textAlign: 'center' }}>
            {currentStep.subtitle}
          </p>

          {/* Selection grid */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              marginBottom: '48px',
            }}
          >
            {currentItems.map((item) => {
              const isSelected = selections[currentStep.key].includes(item);
              return (
                <motion.button
                  key={item}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleItem(item)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '100px',
                    border: isSelected
                      ? '2px solid rgba(124,58,237,0.6)'
                      : '2px solid #27272a',
                    background: isSelected
                      ? 'rgba(124,58,237,0.12)'
                      : '#18181b',
                    color: isSelected ? '#c084fc' : '#a1a1aa',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{EMOJI_MAP[item] || (step === 0 ? '🎵' : '👤')}</span>
                  {item}
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </motion.button>
              );
            })}
            {currentItems.length === 0 && (
              <p className="text-zinc-500">No options available for this step.</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          width: '100%',
          maxWidth: '700px',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {step > 0 && (
            <button 
              onClick={handleBack} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '100px',
                background: '#18181b',
                color: '#ffffff',
                border: '1px solid #27272a',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Removed Skip for now button */}
          <button
            onClick={handleNext}
            disabled={!canProceed || isUpdating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '100px',
              background: canProceed ? '#7c3aed' : '#27272a',
              color: canProceed ? '#ffffff' : '#71717a',
              border: 'none',
              cursor: canProceed ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            {isUpdating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : step === STEPS.length - 1 ? (
              <>
                Finish
                <Check size={18} />
              </>
            ) : (
              <>
                Continue
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '32px' }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i <= step
                ? 'linear-gradient(90deg, #7c3aed, #c084fc)'
                : '#27272a',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
