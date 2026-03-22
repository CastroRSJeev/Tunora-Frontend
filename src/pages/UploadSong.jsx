import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ImagePlus, FileAudio, ArrowLeft, CheckCircle2, Loader2, Music2 } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../stores/authStore';

const FIELD = (placeholder, key, form, setForm, required = false) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(240,240,245,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {placeholder}{required && <span style={{ color: '#a78bfa', marginLeft: '3px' }}>*</span>}
    </label>
    <input
      placeholder={`Enter ${placeholder.toLowerCase()}...`}
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '12px 16px', color: '#f0f0f5',
        fontSize: '14px', outline: 'none', fontFamily: 'var(--font-body)',
        width: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.45)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
    />
  </div>
);

export default function UploadSong() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [form, setForm] = useState({ title: '', artist: user?.username || '', genre: '', description: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const coverRef = useRef(null);
  const audioRef = useRef(null);

  const canSubmit = form.title.trim() && form.artist.trim() && audioFile && !loading;

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('artist', form.artist.trim());
      fd.append('genre', form.genre.trim());
      fd.append('description', form.description.trim());
      fd.append('audio', audioFile);
      if (coverFile) fd.append('cover', coverFile);

      await api.post('songs/upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──
  if (success) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06060b' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', padding: '40px' }}
        >
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 style={{ width: '32px', height: '32px', color: '#4ade80' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f0f0f5', margin: 0 }}>Song uploaded!</h2>
          <p style={{ fontSize: '14px', color: 'rgba(240,240,245,0.4)', margin: 0, maxWidth: '320px' }}>
            Your track is now live on Tunora and will be available for listeners to discover.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={() => { setSuccess(false); setForm({ title: '', artist: user?.username || '', genre: '', description: '' }); setCoverFile(null); setCoverPreview(null); setAudioFile(null); }}
              style={{ padding: '11px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f5', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Upload another
            </button>
            <button
              onClick={() => navigate('/discover')}
              style={{ padding: '11px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Go to Discover
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', background: '#06060b', position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'rgba(124,58,237,0.06)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', padding: '32px 24px 120px' }}>

        {/* Back + header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => navigate('/discover')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'rgba(240,240,245,0.45)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: '28px', padding: 0 }}
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />
            Back to Discover
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music2 style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#f0f0f5', fontFamily: 'var(--font-heading)' }}>Upload a Song</h1>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(240,240,245,0.35)' }}>Share your music with the Tunora community</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >

            {/* ── Cover + basic info row ── */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

              {/* Cover picker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(240,240,245,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cover Art</label>
                <div
                  onClick={() => coverRef.current?.click()}
                  style={{
                    width: '140px', height: '140px', borderRadius: '16px', overflow: 'hidden',
                    background: coverPreview ? 'transparent' : 'rgba(255,255,255,0.02)',
                    border: `2px dashed ${coverPreview ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative', transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => { if (!coverPreview) e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; }}
                  onMouseLeave={e => { if (!coverPreview) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <ImagePlus style={{ width: '28px', height: '28px', color: 'rgba(240,240,245,0.2)', marginBottom: '8px' }} />
                      <span style={{ fontSize: '11px', color: 'rgba(240,240,245,0.25)', textAlign: 'center', lineHeight: 1.4 }}>Click to add<br />cover art</span>
                    </>
                  )}
                  {coverPreview && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                    >
                      <ImagePlus style={{ width: '22px', height: '22px', color: '#fff', opacity: 0 }} className="cover-edit-icon" />
                    </div>
                  )}
                  <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCover} />
                </div>
              </div>

              {/* Title, Artist, Genre */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {FIELD('Title', 'title', form, setForm, true)}
                {FIELD('Artist Name', 'artist', form, setForm, true)}
                {FIELD('Genres', 'genre', form, setForm)}
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(240,240,245,0.25)', marginTop: '-6px' }}>Separate multiple genres with commas, e.g. Phonk, Hip-Hop</p>
              </div>
            </div>

            {/* ── Description ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(240,240,245,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Description <span style={{ color: 'rgba(240,240,245,0.25)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— used for AI recommendations</span>
              </label>
              <textarea
                placeholder="Describe the vibe, energy, and story of this song. e.g. 'A dark phonk track with heavy bass, perfect for late night drives and car edits...'"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '12px 16px', color: '#f0f0f5',
                  fontSize: '14px', lineHeight: 1.6, outline: 'none', fontFamily: 'var(--font-body)',
                  width: '100%', boxSizing: 'border-box', resize: 'vertical', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.45)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* ── Audio file picker ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(240,240,245,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Audio File <span style={{ color: '#a78bfa', marginLeft: '3px' }}>*</span>
              </label>
              <div
                onClick={() => audioRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 20px',
                  background: audioFile ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `2px dashed ${audioFile ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!audioFile) { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.background = 'rgba(124,58,237,0.03)'; } }}
                onMouseLeave={e => { if (!audioFile) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; } }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: audioFile ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileAudio style={{ width: '20px', height: '20px', color: audioFile ? '#a78bfa' : 'rgba(240,240,245,0.25)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: audioFile ? '#c084fc' : 'rgba(240,240,245,0.4)' }}>
                    {audioFile ? audioFile.name : 'Choose audio file'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(240,240,245,0.25)', marginTop: '2px' }}>
                    {audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB` : 'MP3, WAV, FLAC, AAC supported'}
                  </p>
                </div>
                {audioFile && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setAudioFile(null); audioRef.current.value = ''; }}
                    style={{ background: 'none', border: 'none', color: 'rgba(240,240,245,0.3)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px' }}
                  >×</button>
                )}
                <input ref={audioRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => setAudioFile(e.target.files[0] || null)} />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ margin: 0, fontSize: '13px', color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '14px', borderRadius: '14px', border: 'none',
                background: canSubmit ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255,255,255,0.05)',
                color: canSubmit ? '#fff' : 'rgba(255,255,255,0.2)',
                fontSize: '15px', fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
                boxShadow: canSubmit ? '0 4px 24px rgba(124,58,237,0.3)' : 'none',
              }}
            >
              {loading
                ? <><Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" /> Uploading to Cloudinary...</>
                : <><Upload style={{ width: '17px', height: '17px' }} /> Publish Song</>
              }
            </button>

          </motion.div>
        </form>
      </div>
    </div>
  );
}
