import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Music2, Pencil, Trash2, X, Check, Loader2, ImagePlus, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../stores/authStore';

const LABEL_STYLE = { fontSize: '11px', fontWeight: 600, color: 'rgba(240,240,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px', display: 'block' };
const INPUT_STYLE = { width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#f0f0f5', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color 0.2s' };

function EditModal({ song, onClose, onSaved }) {
  const [form, setForm] = useState({ title: song.title || '', artist: song.artist || '', genre: song.genre || '', description: song.description || '' });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(song.cover_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const coverRef = useRef(null);

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('artist', form.artist.trim());
      fd.append('genre', form.genre.trim());
      fd.append('description', form.description.trim());
      if (coverFile) fd.append('cover', coverFile);
      const { data } = await api.patch(`songs/${song.id}/edit/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ width: '520px', background: '#0e0e16', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Pencil style={{ width: '15px', height: '15px', color: '#a78bfa' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f5' }}>Edit Song</span>
          </div>
          <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X style={{ width: '13px', height: '13px', color: 'rgba(240,240,245,0.5)' }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Cover + fields row */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            {/* Cover picker */}
            <div
              onClick={() => coverRef.current?.click()}
              style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', position: 'relative', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = coverFile ? 'transparent' : 'rgba(255,255,255,0.1)'}
            >
              {coverPreview
                ? <img src={coverPreview} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px' }}>
                    <ImagePlus style={{ width: '20px', height: '20px', color: 'rgba(240,240,245,0.2)' }} />
                    <span style={{ fontSize: '9px', color: 'rgba(240,240,245,0.2)', textAlign: 'center' }}>Change cover</span>
                  </div>
              }
              {coverPreview && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                >
                  <ImagePlus style={{ width: '18px', height: '18px', color: '#fff' }} />
                </div>
              )}
              <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCover} />
            </div>

            {/* Title + Artist */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['Title', 'title'], ['Artist Name', 'artist']].map(([label, key]) => (
                <div key={key}>
                  <label style={LABEL_STYLE}>{label}</label>
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={INPUT_STYLE}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.45)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
              ))}
            </div>
          </div>

          {/* Genre */}
          <div>
            <label style={LABEL_STYLE}>Genres</label>
            <input value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} placeholder="e.g. Phonk, Hip-Hop" style={INPUT_STYLE}
              onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>

          {/* Description */}
          <div>
            <label style={LABEL_STYLE}>Description <span style={{ color: 'rgba(240,240,245,0.2)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— for AI recommendations</span></label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />{error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,240,245,0.6)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', background: loading ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
              {loading ? <><Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" />Saving...</> : <><Check style={{ width: '14px', height: '14px' }} />Save Changes</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MyUploads() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('songs/my/');
        setSongs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load your uploads.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSaved = (updated) => {
    setSongs(s => s.map(x => x.id === updated.id ? updated : x));
    setEditingSong(null);
  };

  const handleDelete = async (songId) => {
    setDeleting(true);
    try {
      await api.delete(`songs/${songId}/delete/`);
      setSongs(s => s.filter(x => x.id !== songId));
      setConfirmDeleteId(null);
    } catch {
      // silently fail — keep confirm open
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', background: '#06060b', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'rgba(124,58,237,0.05)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '32px 24px 120px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <button onClick={() => navigate('/discover')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'rgba(240,240,245,0.4)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: '28px', padding: 0 }}>
            <ArrowLeft style={{ width: '15px', height: '15px' }} />Back to Discover
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music2 style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#f0f0f5', fontFamily: 'var(--font-heading)' }}>My Uploads</h1>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(240,240,245,0.35)' }}>{songs.length} track{songs.length !== 1 ? 's' : ''} published</p>
              </div>
            </div>
            <button onClick={() => navigate('/upload')}
              style={{ padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              + Upload New
            </button>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 style={{ width: '36px', height: '36px', color: '#7c3aed' }} className="animate-spin" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#f87171', fontSize: '14px' }}>{error}</div>
        ) : songs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Music2 style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.06)', margin: '0 auto 16px' }} />
            <p style={{ color: 'rgba(240,240,245,0.3)', fontSize: '15px', margin: 0 }}>No uploads yet. Share your first track!</p>
          </div>
        ) : (
          <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {songs.map((song, i) => (
              <motion.div key={song.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                {/* Cover */}
                <img src={song.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&auto=format&fit=crop'}
                  alt={song.title} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f0f0f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(240,240,245,0.38)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</p>
                  {song.genre && (
                    <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(167,139,250,0.6)', fontWeight: 600, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '4px', padding: '1px 6px' }}>
                      {song.genre.split(',')[0].trim()}
                    </span>
                  )}
                </div>

                {/* Date */}
                <span style={{ fontSize: '11px', color: 'rgba(240,240,245,0.25)', flexShrink: 0 }}>
                  {new Date(song.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {confirmDeleteId === song.id ? (
                    <>
                      <span style={{ fontSize: '12px', color: 'rgba(240,240,245,0.45)' }}>Delete?</span>
                      <button onClick={() => handleDelete(song.id)} disabled={deleting}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', fontSize: '12px', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
                        {deleting ? <Loader2 style={{ width: '11px', height: '11px' }} className="animate-spin" /> : <Check style={{ width: '11px', height: '11px' }} />}Yes
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,240,245,0.5)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingSong(song)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.18)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'; }}
                      >
                        <Pencil style={{ width: '12px', height: '12px' }} />Edit
                      </button>
                      <button onClick={() => setConfirmDeleteId(song.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; }}
                      >
                        <Trash2 style={{ width: '12px', height: '12px' }} />Delete
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingSong && <EditModal song={editingSong} onClose={() => setEditingSong(null)} onSaved={handleSaved} />}
      </AnimatePresence>
    </div>
  );
}
