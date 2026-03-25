import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPinOff, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #050508 100%)',
        padding: '24px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Background Ambience */}
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(124, 58, 237, 0.1)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '300px', height: '300px', background: 'rgba(192, 132, 252, 0.05)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-heavy"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '60px 40px',
          borderRadius: '32px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(124, 58, 237, 0.2)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 0 20px rgba(124, 58, 237, 0.05)'
        }}
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(192, 132, 252, 0.15))',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            border: '1px solid rgba(124, 58, 237, 0.3)'
          }}
        >
          <MapPinOff size={48} color="#c084fc" style={{ filter: 'drop-shadow(0 0 10px rgba(192, 132, 252, 0.5))' }} />
        </motion.div>

        <h1 style={{ fontSize: '72px', fontWeight: 900, margin: 0, color: 'white', letterSpacing: '-2px', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
          404
        </h1>
        <h2 style={{ fontSize: '24px', color: '#f0f0f5', margin: '8px 0 16px', fontWeight: 700 }}>
          Lost in the Soundscape
        </h2>
        <p style={{ color: 'rgba(240, 240, 245, 0.45)', lineHeight: 1.6, marginBottom: '40px', fontSize: '15px' }}>
          The frequency you're looking for seems to have faded into silence. Let's get you back to the beat.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '14px 28px',
              borderRadius: '16px',
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(124, 58, 237, 0.25)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(124, 58, 237, 0.15)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button
            onClick={() => navigate('/')}
            className="btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Home size={18} />
            Return Home
          </button>
        </div>
      </motion.div>

      {/* Scattered Dust Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, Math.random() * -100, 0],
            x: [0, Math.random() * 50, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 10 + Math.random() * 5, 
            repeat: Infinity, 
            delay: i * 2 
          }}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '4px',
            height: '4px',
            background: 'white',
            borderRadius: '50%',
            filter: 'blur(1px)',
            zIndex: 0
          }}
        />
      ))}
    </div>
  );
}
