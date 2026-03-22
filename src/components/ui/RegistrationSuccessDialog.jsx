import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, ArrowRight, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RegistrationSuccessDialog({ open, onOpenChange, email }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
        >
          {/* Background Highlight */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/10 blur-[60px] rounded-full" />

          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
              <p className="text-white/60 text-sm leading-relaxed px-4">
                Your account is ready
              </p>
            </div>

            <div className="grid grid-cols-1 w-full gap-3 mt-4">
              {/* <button
                onClick={() => navigate('/verify-otp', { state: { email } })}
                className="h-12 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
              >
                Verify OTP Now
                <ArrowRight className="w-4 h-4" />
              </button> */}

              <button
                onClick={() => navigate('/login')}
                className="h-12 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Go to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
