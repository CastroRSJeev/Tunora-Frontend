'use client'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import ShaderBackground from '@/components/ui/shader-background';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const beams = [
    { key: 'top', className: 'top-0 left-0 h-[2px] w-1/2', grad: 'bg-gradient-to-r from-transparent via-white to-transparent', anim: { left: ['-50%', '100%'] }, delay: 0 },
    { key: 'right', className: 'top-0 right-0 w-[2px] h-1/2', grad: 'bg-gradient-to-b from-transparent via-white to-transparent', anim: { top: ['-50%', '100%'] }, delay: 0.875 },
    { key: 'bottom', className: 'bottom-0 right-0 h-[2px] w-1/2', grad: 'bg-gradient-to-r from-transparent via-white to-transparent', anim: { right: ['-50%', '100%'] }, delay: 1.75 },
    { key: 'left', className: 'bottom-0 left-0 w-[2px] h-1/2', grad: 'bg-gradient-to-b from-transparent via-white to-transparent', anim: { bottom: ['-50%', '100%'] }, delay: 2.625 },
  ];

  return (
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
      <ShaderBackground />

      {/* Bottom glow pulse */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] h-[60vh] bg-[radial-gradient(ellipse,rgba(109,40,217,0.3),transparent_70%)] blur-[40px]"
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror' }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10 px-4 mx-auto"
        style={{ perspective: 1500 }}
      >
        <motion.div
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative bg-black/45 backdrop-blur-xl rounded-2xl p-7 border border-white/[0.06] shadow-2xl overflow-hidden">

            {/* Grid texture */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                backgroundSize: '30px 30px',
              }}
            />

            {/* Traveling border beams */}
            {beams.map(({ key, className, grad, anim, delay }) => (
              <motion.div
                key={key}
                className={`absolute ${className} ${grad} opacity-60 blur-[1.5px]`}
                animate={anim}
                transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity, delay }}
              />
            ))}

            {/* ── Header ── */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className="mx-auto w-10 h-10 rounded-full border border-white/[0.12] bg-gradient-to-br from-white/10 to-white/[0.02] flex items-center justify-center mb-3"
              >
                <span className="text-lg font-bold text-white">S</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-white mb-1"
              >
                Welcome Back
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/50 text-xs"
              >
                Sign in to continue to StyleMe
              </motion.p>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Email field */}
              <div
                className={`flex items-center gap-2.5 rounded-lg h-[42px] px-3 border transition-all duration-200
                  ${focusedInput === 'email'
                    ? 'bg-white/[0.08] border-white/20'
                    : 'bg-white/5 border-white/[0.07]'
                  }`}
              >
                <Mail
                  className={`w-[15px] h-[15px] shrink-0 transition-colors duration-200
                    ${focusedInput === 'email' ? 'text-white' : 'text-white/35'}`}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  className="flex-1 bg-transparent border-none outline-none text-white text-[13px] placeholder:text-white/28 min-w-0"
                />
              </div>

              {/* Password field */}
              <div
                className={`flex items-center gap-2.5 rounded-lg h-[42px] px-3 border transition-all duration-200
                  ${focusedInput === 'password'
                    ? 'bg-white/[0.08] border-white/20'
                    : 'bg-white/5 border-white/[0.07]'
                  }`}
              >
                <Lock
                  className={`w-[15px] h-[15px] shrink-0 transition-colors duration-200
                    ${focusedInput === 'password' ? 'text-white' : 'text-white/35'}`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  className="flex-1 bg-transparent border-none outline-none text-white text-[13px] placeholder:text-white/28 min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-white/35 hover:text-white transition-colors duration-200 flex items-center"
                >
                  {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="appearance-none h-[15px] w-[15px] rounded border border-white/20 bg-white/5 checked:bg-white checked:border-white transition-all duration-200 cursor-pointer"
                    />
                    {rememberMe && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none text-black"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  <span className="text-[11.5px] text-white/55 select-none">Remember me</span>
                </label>

                <Link to="/forgot-password" className="text-[11.5px] text-white/55 hover:text-white transition-colors duration-200">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In button */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-white text-black font-semibold h-10 rounded-lg text-[13px] flex items-center justify-center gap-1.5 mt-2 transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.08] to-transparent"
                  animate={{ x: ['-100%', '110%'] }}
                  transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
                />

                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="spin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 relative z-10"
                    >
                      Sign In <ArrowRight size={13} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[11px] text-white/35">or</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Google button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full h-10 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-white/80 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </motion.button>

              {/* Sign up link */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-[11.5px] text-white/50 mt-4"
              >
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-white font-semibold hover:text-white/70 transition-colors duration-200 relative group"
                >
                  Sign up
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.p>

            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}