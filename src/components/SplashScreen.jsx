import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TunoraLogo from './TunoraLogo';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete?.(), 600);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#06060b',
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <TunoraLogo size="xl" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              marginTop: '20px',
              color: '#9394a5',
              fontSize: '15px',
              fontFamily: 'var(--font-body)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            Your Music, Reimagined
          </motion.p>

          {/* Animated waveform bars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            style={{
              display: 'flex',
              gap: '4px',
              marginTop: '40px',
              alignItems: 'center',
              height: '24px',
            }}
          >
            {[12, 20, 8, 24, 14, 18, 10].map((h, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [h, h * 0.3, h, h * 0.5, h],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '3px',
                  height: `${h}px`,
                  borderRadius: '2px',
                  background: 'linear-gradient(180deg, #c084fc, #7c3aed)',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
