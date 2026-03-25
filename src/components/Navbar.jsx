import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User as UserIcon, BarChart3, Music2, Upload, ListMusic, Shield } from 'lucide-react';
import TunoraLogo from './TunoraLogo';
import useAuthStore from '../stores/authStore';

const NAV_LINKS = [
  { label: 'Discover', path: '/discover' },
  { label: 'Playlists', path: '/playlists' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <nav
      className="glass-heavy"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '72px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <TunoraLogo size="sm" />
      </Link>

      {/* Desktop Nav Links */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        className="nav-links-desktop"
      >
        {isAuthenticated && NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding: '8px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                color: isActive ? '#c084fc' : '#9394a5',
                background: isActive ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              {link.label}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '2px',
                    borderRadius: '1px',
                    background: '#7c3aed',
                    boxShadow: '0 0 8px rgba(124,58,237,0.5)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right side: Auth buttons or User menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAuthenticated ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '2px solid rgba(124,58,237,0.4)',
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                transition: 'all 0.3s ease',
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || <UserIcon size={16} />}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="glass-heavy"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    width: '200px',
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      {user?.username || 'User'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {user?.email || ''}
                    </p>
                  </div>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/admin'); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                        padding: '10px 12px', border: 'none', background: 'transparent',
                        color: '#fbbf24', fontSize: '14px', cursor: 'pointer',
                        borderRadius: '8px', transition: 'background 0.2s', fontFamily: 'var(--font-body)',
                        marginTop: '4px',
                      }}
                      onMouseEnter={(e) => (e.target.style.background = 'rgba(251,191,36,0.1)')}
                      onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                    >
                      <Shield size={14} />
                      Admin Dashboard
                    </button>
                  )}
                  {user?.role === 'artist' && (
                    <>
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/dashboard'); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                          padding: '10px 12px', border: 'none', background: 'transparent',
                          color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer',
                          borderRadius: '8px', transition: 'background 0.2s', fontFamily: 'var(--font-body)',
                          marginTop: '4px',
                        }}
                        onMouseEnter={(e) => (e.target.style.background = 'rgba(124,58,237,0.1)')}
                        onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                      >
                        <BarChart3 size={14} />
                        Creator Studio
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/my-uploads'); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                          padding: '10px 12px', border: 'none', background: 'transparent',
                          color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer',
                          borderRadius: '8px', transition: 'background 0.2s', fontFamily: 'var(--font-body)',
                        }}
                        onMouseEnter={(e) => (e.target.style.background = 'rgba(124,58,237,0.1)')}
                        onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                      >
                        <Music2 size={14} />
                        My Uploads
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/upload'); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                          padding: '10px 12px', border: 'none', background: 'transparent',
                          color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer',
                          borderRadius: '8px', transition: 'background 0.2s', fontFamily: 'var(--font-body)',
                        }}
                        onMouseEnter={(e) => (e.target.style.background = 'rgba(124,58,237,0.1)')}
                        onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                      >
                        <Upload size={14} />
                        Upload Song
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/my-playlists'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                      padding: '10px 12px', border: 'none', background: 'transparent',
                      color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer',
                      borderRadius: '8px', transition: 'background 0.2s', fontFamily: 'var(--font-body)',
                      marginTop: user?.role === 'artist' ? '0px' : '4px',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(124,58,237,0.1)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <ListMusic size={14} />
                    My Playlists
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      color: '#ef4444',
                      fontSize: '14px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      fontFamily: 'var(--font-body)',
                      marginTop: '4px',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(239,68,68,0.1)')}
                    onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="auth-buttons-desktop" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link
              to="/login"
              style={{
                padding: '8px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#9394a5',
                textDecoration: 'none',
                transition: 'color 0.3s',
              }}
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-heavy"
            style={{
              position: 'fixed',
              top: '72px',
              left: 0,
              right: 0,
              padding: '16px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {isAuthenticated && NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: location.pathname === link.path ? '#c084fc' : '#9394a5',
                  background: location.pathname === link.path ? 'rgba(124,58,237,0.1)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary"
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .auth-buttons-desktop { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
