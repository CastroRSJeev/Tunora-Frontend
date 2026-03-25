import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCw, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthCard } from '../components/ui/AuthCard';
import useAuthStore from '../stores/authStore';
import { cn } from '../lib/utils';
import ShaderBackground from '@/components/ui/shader-background';
import TunoraLogo from '../components/TunoraLogo';

const OTP_LENGTH = 6;

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

/* ── Reset Password Page ───────────────────────────────────────── */
export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const { verifyResetOtp, resetPassword, forgotPassword, isLoading, error, clearError } = useAuthStore();

  // Steps: 'otp' → 'new-password' → 'success'
  const [step, setStep] = useState('otp');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const refs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const focusInput = (idx) => refs.current[idx]?.focus();

  const handleChange = (idx, value) => {
    clearError();
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[idx] = digit; setOtp(next);
    if (digit && idx < OTP_LENGTH - 1) focusInput(idx + 1);
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (otp[idx]) { const next = [...otp]; next[idx] = ''; setOtp(next); }
      else if (idx > 0) focusInput(idx - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...otp];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    focusInput(Math.min(text.length, OTP_LENGTH - 1));
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearError();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;
    try {
      await verifyResetOtp({ email, otp: code });
      setVerifiedOtp(code);
      setStep('new-password');
    } catch { /* error shown from store */ }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await resetPassword({
        email,
        otp: verifiedOtp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setStep('success');
    } catch { /* error shown from store */ }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    setResendLoading(true); clearError();
    try {
      await forgotPassword({ email });
      setCountdown(60); setCanResend(false);
      setSuccessMsg('Code sent! Check your inbox.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch { /* error shown from store */ }
    setResendLoading(false);
  };

  const filled = otp.filter(Boolean).length;
  const passwordMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

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
              {step === 'otp' && 'Enter Reset Code'}
              {step === 'new-password' && 'New Password'}
              {step === 'success' && 'Password Reset!'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-white/50 text-[13px] text-center leading-relaxed"
            >
              {step === 'otp' && (
                <>We sent a 6-digit code to{' '}
                  <span className="text-white/80 font-medium">{email || 'your email'}</span>
                </>
              )}
              {step === 'new-password' && 'Create a strong new password for your account'}
              {step === 'success' && 'Your password has been updated successfully'}
            </motion.p>
          </div>

          {/* ── Banners ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400"
              >{error}</motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-2.5 text-xs text-green-400"
              >{successMsg}</motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════ STEP 1: OTP ═══════════ */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              {/* OTP Inputs */}
              <motion.div
                className="flex gap-2.5 justify-center"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              >
                {otp.map((digit, idx) => (
                  <motion.input
                    key={idx}
                    ref={(el) => (refs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    style={{ WebkitBoxShadow: '0 0 0px 1000px rgba(255,255,255,0.06) inset', WebkitTextFillColor: 'rgba(255,255,255,1)' }}
                    className={cn(
                      'w-11 h-12 text-center text-lg font-semibold rounded-2xl border bg-white/[0.06] text-white outline-none transition-all duration-200',
                      digit ? 'border-white/35 bg-white/[0.1]' : 'border-white/10',
                      'focus:border-violet-400/60 focus:bg-white/[0.1] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.2)]',
                    )}
                    whileFocus={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                ))}
              </motion.div>

              {/* Progress bar */}
              <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-300 rounded-full"
                  animate={{ width: `${(filled / OTP_LENGTH) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </div>

              {/* Verify CTA */}
              <motion.button
                whileHover={{ scale: filled === OTP_LENGTH ? 1.02 : 1 }}
                whileTap={{ scale: filled === OTP_LENGTH ? 0.97 : 1 }}
                type="submit" disabled={isLoading || filled < OTP_LENGTH}
                className="relative w-full group/btn"
              >
                <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover/btn:opacity-60 transition-opacity duration-300" />
                <div className={cn(
                  'relative h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5 transition-all duration-300',
                  filled === OTP_LENGTH ? 'bg-white text-black' : 'bg-white/10 text-white/30 cursor-not-allowed'
                )}>
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      </motion.span>
                    ) : (
                      <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                        Verify Code
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>

              {/* Resend */}
              <div className="flex flex-col items-center gap-1">
                <AnimatePresence mode="wait">
                  {canResend ? (
                    <motion.button
                      key="resend" type="button" onClick={handleResend} disabled={resendLoading}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
                    >
                      <RotateCw className={cn('w-3 h-3', resendLoading && 'animate-spin')} />
                      {resendLoading ? 'Sending…' : 'Resend code'}
                    </motion.button>
                  ) : (
                    <motion.p
                      key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xs text-white/35"
                    >
                      Resend code in{' '}
                      <motion.span
                        key={countdown} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
                        className="text-white/60 font-medium tabular-nums"
                      >
                        0:{countdown.toString().padStart(2, '0')}
                      </motion.span>
                    </motion.p>
                  )}
                </AnimatePresence>

                <p className="text-[12px] text-white/35">
                  <Link to="/forgot-password" className="text-white/70 hover:text-white transition-colors font-medium inline-flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    Change email
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* ═══════════ STEP 2: NEW PASSWORD ═══════════ */}
          {step === 'new-password' && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              <PasswordInput
                placeholder="New password"
                value={newPassword}
                onChange={(e) => { clearError(); setNewPassword(e.target.value); }}
                required
              />
              <PasswordInput
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => { clearError(); setConfirmPassword(e.target.value); }}
                className={passwordMismatch ? 'border-red-500/40' : ''}
                required
              />

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

              {/* Reset CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading || !!passwordMismatch || !newPassword || !confirmPassword}
                className="relative w-full mt-2 group/btn"
              >
                <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover/btn:opacity-60 transition-opacity duration-300" />
                <div className="relative h-12 rounded-full bg-white text-black font-semibold text-sm flex items-center justify-center gap-1.5 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="w-4 h-4 border-2 border-black/40 border-t-transparent rounded-full animate-spin" />
                      </motion.span>
                    ) : (
                      <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                        Reset Password
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </form>
          )}

          {/* ═══════════ STEP 3: SUCCESS ═══════════ */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </motion.div>

              <p className="text-white/60 text-sm text-center">
                Your password has been reset. You can now sign in with your new password.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="relative w-full group/btn"
              >
                <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover/btn:opacity-60 transition-opacity duration-300" />
                <div className="relative h-12 rounded-full bg-white text-black font-semibold text-sm flex items-center justify-center gap-1.5 overflow-hidden">
                  <span className="flex items-center gap-1.5">
                    Go to Sign In
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </motion.button>
            </motion.div>
          )}

        </div>
      </AuthCard>
    </>
  );
}
