import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Headphones, Sparkles, Radio, ChevronRight } from 'lucide-react';
import ShaderBackground from '@/components/ui/shader-background';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Discovery',
    desc: 'Machine learning that understands your taste and finds music you\'ll love.',
  },
  {
    icon: Headphones,
    title: 'Premium Audio',
    desc: 'Crystal-clear streaming quality that brings every note to life.',
  },
  {
    icon: Radio,
    title: 'Live Sessions',
    desc: 'Exclusive live performances and behind-the-scenes artist content.',
  },
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function Home() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <ShaderBackground />
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          minHeight: 'calc(100vh - 72px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 24px 100px',
          overflow: 'hidden',
        }}
      >



        {/* Badge */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '100px',
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            fontSize: '13px',
            color: '#c084fc',
            fontWeight: 500,
            marginBottom: '32px',
          }}
        >
          <Sparkles size={14} />
          AI-Powered Music Experience
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            maxWidth: '800px',
            marginBottom: '24px',
          }}
        >
          <span className="gradient-text animate-gradient">Your Music,</span>
          <br />
          <span style={{ color: 'var(--color-text-primary)' }}>Your Way</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            maxWidth: '520px',
            lineHeight: 1.7,
            marginBottom: '40px',
          }}
        >
          Discover music that matches your soul. Powered by AI that learns what moves you, 
          delivering personalized recommendations and premium audio.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '16px 36px', fontSize: '16px' }}>
            Get Started Free
            <ChevronRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '16px 36px', fontSize: '16px' }}>
            Sign In
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            gap: '48px',
            marginTop: '72px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { value: '10M+', label: 'Songs' },
            { value: '500K+', label: 'Artists' },
            { value: '2M+', label: 'Listeners' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '32px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                }}
                className="gradient-text"
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: '80px 24px 120px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <motion.div
          variants={itemVariants}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '36px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '16px',
            }}
          >
            Why Tunora?
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
            More than a music player — it's your personal music curator.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="glass"
              style={{
                padding: '36px 28px',
                borderRadius: '20px',
                cursor: 'default',
                transition: 'box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-glow-sm)';
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(124,58,237,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <feature.icon size={22} color="#a855f7" />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '10px',
                }}
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 24px 120px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          variants={itemVariants}
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(91,33,182,0.1))',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '24px',
            padding: '64px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 60%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '16px',
              position: 'relative',
            }}
            className="gradient-text"
          >
            Start Your Journey Today
          </h2>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '16px',
              maxWidth: '460px',
              margin: '0 auto 32px',
              position: 'relative',
            }}
          >
            Join millions of music lovers and let AI curate the perfect soundtrack for your life.
          </p>
          <Link
            to="/register"
            className="btn-primary"
            style={{ textDecoration: 'none', padding: '16px 40px', fontSize: '16px', position: 'relative' }}
          >
            Create Free Account
            <ChevronRight size={18} />
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
