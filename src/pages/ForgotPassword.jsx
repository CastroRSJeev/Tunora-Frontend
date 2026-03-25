import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthCard } from '../components/ui/AuthCard';
import useAuthStore from '../stores/authStore';
import { cn } from '../lib/utils';
import ShaderBackground from '@/components/ui/shader-background';
import TunoraLogo from '../components/TunoraLogo';

/* ── Pill Input ─────────────────────────────────────────────────── */
function PillInput({ icon: Icon, className, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{ paddingLeft: '24px', paddingRight: '24px', gap: '16px' }}
      className={cn(
        'flex items-center h-12 rounded-full border transition-all duration-300',
        'bg-white/[0.06] border-white/10',
        focused && 'bg-white/[0.09] border-white/25 shadow-[0_0_0_3px_rgba(124,58,237,0.15)]',
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'w-4 h-4 shrink-0 transition-colors duration-300',
            focused ? 'text-white/70' : 'text-white/30'
          )}
        />
      )}
      <input
        className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
        style={{
          WebkitBoxShadow: '0 0 0px 1000px transparent inset',
          WebkitTextFillColor: 'rgba(255,255,255,1)',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </div>
  );
}

/* ── Forgot Password Page ──────────────────────────────────────── */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await forgotPassword({ email });
      setSent(true);
      // Navigate to reset password page with the email
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch { /* error shown from store */ }
  };

  return (
    <>
      <ShaderBackground />
      <AuthCard>
        <div style={{ padding: '2rem 1.5rem' }} className="flex flex-col gap-5">

          {/* ── Header ── */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.7 }}
              className="mb-2"
            >
              <TunoraLogo size="md" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[22px] font-bold text-white leading-tight"
            >
              Forgot Password
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-white/50 text-[13px] text-center leading-relaxed"
            >
              Enter your email and we'll send you a code to reset your password
            </motion.p>
          </div>

          {/* ── Error banner ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Success banner ── */}
          <AnimatePresence>
            {sent && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-2.5 text-xs text-green-400"
              >
                Reset code sent! Check your inbox. Redirecting…
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            <PillInput
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => { clearError(); setEmail(e.target.value); }}
              required
            />

            {/* Send Reset Code CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading || sent}
              className="relative w-full mt-2 group/btn"
            >
              <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover/btn:opacity-60 transition-opacity duration-300" />
              <div className="relative h-12 rounded-full bg-white text-black font-semibold text-sm flex items-center justify-center gap-1.5 overflow-hidden">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.span
                      key="spin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="w-4 h-4 border-2 border-black/40 border-t-transparent rounded-full animate-spin" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      Send Reset Code
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>

            {/* Back to login */}
            <p className="text-center text-[12px] text-white/40 pt-1">
              <Link
                to="/login"
                className="text-white/80 hover:text-white font-medium transition-colors underline-offset-2 hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Sign In
              </Link>
            </p>

          </form>
        </div>
      </AuthCard>
    </>
  );
}
