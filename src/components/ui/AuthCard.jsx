import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

/**
 * AuthCard – reusable 3D-tilt glass card for auth pages.
 * Wraps any children in the purple-gradient background + animated border.
 */
export function AuthCard({ children }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="min-h-screen w-screen relative overflow-hidden flex items-center justify-center bg-transparent"
    >
      {/* Subtle ambient glow blobs */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vh] h-[50vh] rounded-b-full bg-purple-400/10 blur-[80px]"
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vh] h-[70vh] rounded-t-full bg-purple-600/10 blur-[60px]"
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
      />

      <motion.div
        className="w-[480px] max-w-[calc(100vw-2rem)] relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Animated border glow */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                  '0 0 15px 5px rgba(255,255,255,0.05)',
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                ],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
            />

            {/* Traveling light beams */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
              {[
                { dir: 'top', style: { top: 0, left: 0, height: '3px', width: '50%' }, gradient: 'to right', animKey: 'left', animVals: ['-50%', '100%'], delay: 0 },
                { dir: 'right', style: { top: 0, right: 0, height: '50%', width: '3px' }, gradient: 'to bottom', animKey: 'top', animVals: ['-50%', '100%'], delay: 0.6 },
                { dir: 'bottom', style: { bottom: 0, right: 0, height: '3px', width: '50%' }, gradient: 'to left', animKey: 'right', animVals: ['-50%', '100%'], delay: 1.2 },
                { dir: 'left', style: { bottom: 0, left: 0, height: '50%', width: '3px' }, gradient: 'to top', animKey: 'bottom', animVals: ['-50%', '100%'], delay: 1.8 },
              ].map(({ dir, style, gradient, animKey, animVals, delay }) => (
                <motion.div
                  key={dir}
                  className="absolute opacity-70"
                  style={{
                    ...style,
                    background: `linear-gradient(${gradient}, transparent, white, transparent)`,
                  }}
                  animate={{
                    [animKey]: animVals,
                    opacity: [0.3, 0.7, 0.3],
                    filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'],
                  }}
                  transition={{
                    [animKey]: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay },
                    opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay },
                    filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay },
                  }}
                />
              ))}
            </div>

            {/* Glass card */}
            <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }} className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.05] shadow-2xl overflow-hidden">
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
