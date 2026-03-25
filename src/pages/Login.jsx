import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
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

/* ── Password Pill Input ────────────────────────────────────────── */
function PasswordInput({ className, ...props }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
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
      <Lock
        className={cn(
          'w-4 h-4 shrink-0 transition-colors duration-300',
          focused ? 'text-white/70' : 'text-white/30'
        )}
      />
      <input
        type={show ? 'text' : 'password'}
        className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
        style={{
          WebkitBoxShadow: '0 0 0px 1000px transparent inset',
          WebkitTextFillColor: 'rgba(255,255,255,1)',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        tabIndex={-1}
        className="shrink-0 text-white/30 hover:text-white/70 transition-colors"
      >
        {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}

/* ── Login Page ─────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      if (showOtp) {
        // Admin OTP verification
        const { user } = await useAuthStore.getState().verifyAdminOtp({ email, otp });
        if (user) navigate('/admin'); // Admins go to dashboard
        return;
      }

      // Initial login (password)
      const data = await login({ email, password });
      
      if (data?.requires_otp) {
        setShowOtp(true);
        return;
      }

      const { user } = data;
      if (user && !user.onboarding_completed) {
        navigate('/onboarding');
      } else if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/discover');
      }
    } catch { /* error shown from store */ }
  };

  return (
    <>
    <ShaderBackground />
    <AuthCard>
      {/* ↓ KEY FIX: px-8 sm:px-12 gives consistent breathing room on all screen sizes */}
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
            {showOtp ? 'Verify Admin Access' : 'Welcome Back'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-white/50 text-[13px]"
          >
            {showOtp ? `We've sent a code to ${email}` : 'Sign in to continue to Tunora'}
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

          {!showOtp ? (
            <PasswordInput
              placeholder="Password"
              value={password}
              onChange={(e) => { clearError(); setPassword(e.target.value); }}
              required
            />
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <PillInput
                icon={Lock}
                type="text"
                maxLength="6"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => { clearError(); setOtp(e.target.value); }}
                required
              />
            </motion.div>
          )}

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between px-1 mt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative w-4 h-4">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe((v) => !v)}
                  className="appearance-none w-4 h-4 rounded border border-white/20 bg-white/5 checked:bg-white checked:border-white transition-all duration-200 cursor-pointer"
                />
                {rememberMe && (
                  <motion.svg
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 w-4 h-4 text-black pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                )}
              </div>
              <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">
                Remember me
              </span>
            </label>

            <Link
              to="/forgot-password"
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
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
                    {showOtp ? 'Verify & Enter' : 'Sign In'}
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>


          {/* Sign up */}
          <p className="text-center text-[12px] text-white/40 pt-0.5">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-white/80 hover:text-white font-medium transition-colors underline-offset-2 hover:underline"
            >
              Sign up
            </Link>
          </p>

        </form>
      </div>
    </AuthCard>
    </>
  );
}