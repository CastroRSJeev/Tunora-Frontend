import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Music, Mic2 } from 'lucide-react';
import { AuthCard } from '../components/ui/AuthCard';
import { RegistrationSuccessDialog } from '../components/ui/RegistrationSuccessDialog';
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
    )}>
      {Icon && <Icon className={cn('w-4 h-4 shrink-0 transition-colors duration-300', focused ? 'text-white/70' : 'text-white/30')} />}
      <input
        className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
        style={{ WebkitBoxShadow: '0 0 0px 1000px transparent inset', WebkitTextFillColor: 'rgba(255,255,255,1)' }}
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
    )}>
      <Lock className={cn('w-4 h-4 shrink-0 transition-colors duration-300', focused ? 'text-white/70' : 'text-white/30')} />
      <input
        type={show ? 'text' : 'password'}
        className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
        style={{ WebkitBoxShadow: '0 0 0px 1000px transparent inset', WebkitTextFillColor: 'rgba(255,255,255,1)' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      <button type="button" tabIndex={-1} onClick={() => setShow((v) => !v)}
        className="shrink-0 text-white/30 hover:text-white/70 transition-colors">
        {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
}

/* ── Register Page ──────────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '', role: 'listener' });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const set = (key) => (e) => { clearError(); setForm((f) => ({ ...f, [key]: typeof e === 'string' ? e : e.target.value })); };

  const passwordMismatch = form.password && form.password_confirm && form.password !== form.password_confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await register(form);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch { /* error shown from store */ }
  };

  return (
    <>
    <ShaderBackground />
    <AuthCard>
      <div className="py-10 flex flex-col gap-5">

        {/* Header */}
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
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-[22px] font-bold text-white leading-tight"
          >
            Create Account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-white/50 text-[13px]"
          >
            {form.role === 'artist' ? 'Join Tunora and share your music' : 'Join Tunora and start listening'}
          </motion.p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400"
            >{error}</motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <PillInput icon={User} type="text" placeholder="Username" value={form.username} onChange={set('username')} required />
          <PillInput icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={set('email')} required />
          <PasswordInput placeholder="Password" value={form.password} onChange={set('password')} required />
          <PasswordInput
            placeholder="Confirm password"
            value={form.password_confirm}
            onChange={set('password_confirm')}
            className={passwordMismatch ? 'border-red-500/40' : ''}
            required
          />

          {/* Role Selection */}
          <div className="flex gap-2.5 p-1.5 rounded-full bg-white/[0.04] border border-white/5">
            {[
              { id: 'listener', label: 'Listener', icon: Music },
              { id: 'artist', label: 'Artist', icon: Mic2 },
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => set('role')(role.id)}
                className={cn(
                  "flex-1 relative flex items-center justify-center gap-2 h-10 rounded-full transition-all duration-300 text-xs font-semibold overflow-hidden",
                  form.role === role.id 
                    ? "bg-white text-black shadow-lg" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                )}
              >
                {/* Moving light beam effect for selected role */}
                {form.role === role.id && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[
                      { dir: 'top', style: { top: 0, left: 0, height: '2px', width: '50%' }, gradient: 'to right', animKey: 'left', animVals: ['-50%', '100%'], delay: 0 },
                      { dir: 'bottom', style: { bottom: 0, right: 0, height: '2px', width: '50%' }, gradient: 'to left', animKey: 'right', animVals: ['-50%', '100%'], delay: 1.2 },
                    ].map((beam) => (
                      <motion.div
                        key={beam.dir}
                        className="absolute opacity-40"
                        style={{
                          ...beam.style,
                          background: `linear-gradient(${beam.gradient}, transparent, #000, transparent)`,
                        }}
                        animate={{
                          [beam.animKey]: beam.animVals,
                        }}
                        transition={{
                          [beam.animKey]: { duration: 2, ease: 'easeInOut', repeat: Infinity, delay: beam.delay },
                        }}
                      />
                    ))}
                  </motion.div>
                )}
                <role.icon className={cn("relative z-10 w-3.5 h-3.5", form.role === role.id ? "text-black" : "text-white/40")} />
                <span className="relative z-10">{role.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {passwordMismatch && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[11px] text-red-400 px-2"
              >
                Passwords do not match
              </motion.p>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            type="submit" disabled={isLoading || !!passwordMismatch}
            className="relative w-full mt-1 group/btn"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover/btn:opacity-60 transition-opacity duration-300" />
            <div className="relative h-12 rounded-full bg-white text-black font-semibold text-sm flex items-center justify-center gap-1.5">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="w-4 h-4 border-2 border-black/40 border-t-transparent rounded-full animate-spin" />
                  </motion.span>
                ) : (
                  <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                    Create Account
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>



          <p className="text-center text-[12px] text-white/40 pt-0.5">
            Already have an account?{' '}
            <Link to="/login" className="text-white/80 hover:text-white font-medium transition-colors hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthCard>
    </>
  );
}
