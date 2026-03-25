import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, Clock, Music2, Heart, Play, Users,
  ArrowLeft, Loader2, ChevronUp, ChevronDown, ExternalLink,
  Disc3, Headphones, Eye
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../lib/api';
import useAuthStore from '../stores/authStore';

/* ─── Color palette ─── */
const VIOLET = '#7c3aed';
const VIOLET_LIGHT = '#a78bfa';
const VIOLET_DIM = 'rgba(124,58,237,0.15)';
const CYAN = '#06b6d4';
const EMERALD = '#10b981';
const AMBER = '#f59e0b';
const ROSE = '#f43f5e';
const PINK = '#ec4899';

const PIE_COLORS = [VIOLET, CYAN, EMERALD, AMBER, ROSE, PINK, '#8b5cf6', '#14b8a6', '#f97316', '#6366f1'];

/* ─── Shared styles ─── */
const CARD_STYLE = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '20px',
  padding: '24px',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
};

const CARD_GLOW = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  filter: 'blur(60px)',
  opacity: 0.15,
  pointerEvents: 'none',
};

/* ─── Custom Tooltip ─── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(14,14,22,0.95)',
      border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(20px)',
    }}>
      <p style={{ margin: 0, fontSize: '11px', color: 'rgba(240,240,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        {label}
      </p>
      {payload.map((item, i) => (
        <p key={i} style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: item.color || VIOLET_LIGHT }}>
          {item.name}: {item.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, suffix = '', color, delay = 0, trend, trendIcon, trendLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        ...CARD_STYLE,
        flex: '1 1 200px',
        minWidth: '200px',
        transition: 'border-color 0.3s, transform 0.3s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}33`;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ ...CARD_GLOW, background: color }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '14px',
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon style={{ width: '20px', height: '20px', color }} />
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            fontSize: '12px', fontWeight: 600,
            color: trend >= 0 ? EMERALD : ROSE,
          }}>
            {trendIcon || (trend >= 0 ? <ChevronUp style={{ width: '14px', height: '14px' }} /> : <ChevronDown style={{ width: '14px', height: '14px' }} />)}
            {Math.abs(trend)}%
            {trendLabel && <span style={{ marginLeft: '2px', opacity: 0.7, fontWeight: 500 }}>{trendLabel}</span>}
          </div>
        )}
      </div>

      <p style={{
        margin: 0, fontSize: '32px', fontWeight: 800,
        color: '#f0f0f5',
        fontFamily: 'var(--font-heading)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span style={{ fontSize: '16px', fontWeight: 500, color: 'rgba(240,240,245,0.35)', marginLeft: '4px' }}>{suffix}</span>}
      </p>
      <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(240,240,245,0.35)', fontWeight: 500 }}>{label}</p>
    </motion.div>
  );
}

/* ─── Main Dashboard Component ─── */
export default function ArtistDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [daysFilter, setDaysFilter] = useState(30);
  const [chartMetric, setChartMetric] = useState('plays'); // 'plays' or 'hours'

  const WATCH_HOURS_GOAL = 10; // Monetization/Milestone goal

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get(`songs/analytics/?days=${daysFilter}`);
        setAnalytics(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [daysFilter]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'songs', label: 'Top Songs', icon: Music2 },
    { id: 'audience', label: 'Audience', icon: Users },
  ];

  const handleLike = async (songId, index) => {
    if (!analytics || !analytics.top_songs) return;
    
    // Copy analytics for optimistic update
    const newAnalytics = JSON.parse(JSON.stringify(analytics));
    const song = newAnalytics.top_songs[index];
    const becomingLiked = !song.is_liked;
    
    song.is_liked = becomingLiked;
    song.like_count += becomingLiked ? 1 : -1;
    newAnalytics.overview.total_likes += becomingLiked ? 1 : -1;
    
    setAnalytics(newAnalytics);

    try {
      await api.post(`songs/${songId}/like/`);
    } catch (err) {
      console.error('Like failed', err);
      // Revert on failure
      const revertAnalytics = JSON.parse(JSON.stringify(newAnalytics));
      revertAnalytics.top_songs[index].is_liked = !becomingLiked;
      revertAnalytics.top_songs[index].like_count -= becomingLiked ? 1 : -1;
      revertAnalytics.overview.total_likes -= becomingLiked ? 1 : -1;
      setAnalytics(revertAnalytics);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '72px', background: '#06060b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ width: '48px', height: '48px', color: VIOLET }} className="animate-spin" />
          <p style={{ marginTop: '16px', color: 'rgba(240,240,245,0.4)', fontSize: '14px' }}>Loading your studio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '72px', background: '#06060b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#f87171' }}>{error}</div>
      </div>
    );
  }

  const { overview, top_songs, daily_plays, genre_breakdown, recent_plays } = analytics || {};

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', background: '#06060b', position: 'relative' }}>
      {/* Background effects */}
      <div style={{ position: 'fixed', top: '5%', left: '20%', width: '500px', height: '500px', background: 'rgba(124,58,237,0.04)', filter: 'blur(150px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(6,182,212,0.03)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 120px' }}>

        {/* Back button */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => navigate('/discover')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'rgba(240,240,245,0.4)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: '28px', padding: 0 }}
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />Back to Discover
          </button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '36px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(124,58,237,0.3)',
            }}>
              <Disc3 style={{ width: '24px', height: '24px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{
                margin: 0, fontSize: '28px', fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(135deg, #f0f0f5, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Creator Studio
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '14px', color: 'rgba(240,240,245,0.35)' }}>
                Welcome back, <span style={{ color: VIOLET_LIGHT, fontWeight: 600 }}>{user?.username || 'Artist'}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: 'flex', gap: '4px', marginBottom: '32px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '4px',
            width: 'fit-content',
          }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '10px',
                  background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                  color: isActive ? VIOLET_LIGHT : 'rgba(240,240,245,0.4)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.25s ease',
                }}
              >
                <TabIcon style={{ width: '15px', height: '15px' }} />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ════════════════  OVERVIEW TAB  ════════════════ */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              {/* Stat Cards */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <StatCard icon={Music2} label="Total Tracks" value={overview?.total_songs || 0} color={VIOLET} delay={0.05} />
                <StatCard icon={Headphones} label="Total Streams" value={overview?.total_plays || 0} color={CYAN} delay={0.1} />
                <StatCard 
                  icon={Clock} 
                  label="Watch Hours" 
                  value={overview?.watch_hours || 0} 
                  suffix="hrs" 
                  color={EMERALD} 
                  delay={0.15} 
                  trend={Math.round(((overview?.watch_hours || 0) / WATCH_HOURS_GOAL) * 100)}
                  trendIcon={<TrendingUp style={{ width: '14px', height: '14px' }} />}
                  trendLabel="of goal"
                />
                <StatCard icon={Heart} label="Total Likes" value={overview?.total_likes || 0} color={ROSE} delay={0.2} />
              </div>

              {/* Charts Row */}
              <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
                {/* Area Chart - Daily Streams */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  style={CARD_STYLE}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f5' }}>
                        {chartMetric === 'plays' ? 'Daily Streams' : 'Daily Watch Hours'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(240,240,245,0.3)' }}>Last {daysFilter} days performance</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ 
                        display: 'flex', background: 'rgba(255,255,255,0.03)', 
                        padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' 
                      }}>
                        <button 
                          onClick={() => setChartMetric('plays')}
                          style={{
                            padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer',
                            background: chartMetric === 'plays' ? VIOLET : 'transparent',
                            color: chartMetric === 'plays' ? '#fff' : 'rgba(240,240,245,0.4)',
                            border: 'none', transition: 'all 0.2s'
                          }}
                        >Streams</button>
                        <button 
                          onClick={() => setChartMetric('hours')}
                          style={{
                            padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer',
                            background: chartMetric === 'hours' ? EMERALD : 'transparent',
                            color: chartMetric === 'hours' ? '#fff' : 'rgba(240,240,245,0.4)',
                            border: 'none', transition: 'all 0.2s'
                          }}
                        >Hours</button>
                      </div>
                      <select
                        value={daysFilter}
                        onChange={(e) => setDaysFilter(Number(e.target.value))}
                        style={{
                          padding: '6px 12px', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '11px', fontWeight: 600, color: 'rgba(240,240,245,0.6)',
                          appearance: 'none', cursor: 'pointer', outline: 'none'
                        }}
                      >
                        <option value={7}>7 Days</option>
                        <option value={30}>30 Days</option>
                        <option value={90}>90 Days</option>
                      </select>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={daily_plays || []}>
                      <defs>
                        <linearGradient id="streamGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={VIOLET} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={VIOLET} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={d => {
                          const date = new Date(d);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                        stroke="rgba(240,240,245,0.15)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="rgba(240,240,245,0.15)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey={chartMetric === 'plays' ? 'plays' : 'hours'}
                        name={chartMetric === 'plays' ? 'Streams' : 'Hours'}
                        stroke={chartMetric === 'plays' ? VIOLET_LIGHT : EMERALD}
                        strokeWidth={2.5}
                        fill="url(#streamGradient)"
                        dot={false}
                        activeDot={{ r: 6, fill: chartMetric === 'plays' ? VIOLET : EMERALD, stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Pie Chart - Genre Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  style={CARD_STYLE}
                >
                  <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#f0f0f5' }}>Genre Breakdown</h3>
                  {genre_breakdown && genre_breakdown.some(g => g.plays > 0) ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={genre_breakdown}
                            dataKey="plays"
                            nameKey="genre"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            strokeWidth={0}
                          >
                            {genre_breakdown.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                        {genre_breakdown.slice(0, 6).map((g, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '11px', color: 'rgba(240,240,245,0.5)',
                          }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            {g.genre}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : genre_breakdown && genre_breakdown.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'rgba(240,240,245,0.4)', fontSize: '13px' }}>
                      <BarChart3 style={{ width: '32px', height: '32px', marginBottom: '8px', opacity: 0.3 }} />
                      <p style={{ margin: 0 }}>No plays yet for breakdown</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'rgba(240,240,245,0.2)', fontSize: '13px' }}>
                      No genre data yet
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                style={CARD_STYLE}
              >
                <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#f0f0f5' }}>
                  <Eye style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: VIOLET_LIGHT }} />
                  Recent Activity
                </h3>
                {recent_plays && recent_plays.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recent_plays.map((rp, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.015)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.04)',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}
                      >
                        <img
                          src={rp.song_cover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&auto=format&fit=crop'}
                          alt="" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#f0f0f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {rp.song_title}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(240,240,245,0.3)' }}>
                            <Users style={{ width: '10px', height: '10px', display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                            {rp.listener}
                          </p>
                        </div>
                        <span style={{ fontSize: '11px', color: 'rgba(240,240,245,0.25)', flexShrink: 0 }}>
                          {new Date(rp.played_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(240,240,245,0.2)', fontSize: '13px' }}>
                    No plays recorded yet. Share your music to start getting plays!
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ════════════════  TOP SONGS TAB  ════════════════ */}
          {activeTab === 'songs' && (
            <motion.div
              key="songs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              {/* Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ ...CARD_STYLE, marginBottom: '24px' }}
              >
                <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#f0f0f5' }}>
                  Song Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top_songs || []} layout="vertical" barSize={16}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={VIOLET} />
                        <stop offset="100%" stopColor={CYAN} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(240,240,245,0.15)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="title"
                      width={140}
                      stroke="rgba(240,240,245,0.15)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={({ x, y, payload }) => (
                        <text x={x} y={y} dy={4} textAnchor="end" fill="rgba(240,240,245,0.6)" fontSize={12}>
                          {payload.value.length > 18 ? payload.value.slice(0, 18) + '…' : payload.value}
                        </text>
                      )}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
                    <Bar dataKey="play_count" name="Streams" fill="url(#barGradient)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Songs List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={CARD_STYLE}
              >
                <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#f0f0f5' }}>
                  All Tracks Ranking
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(top_songs || []).map((song, i) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.05 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '12px 16px',
                        background: i === 0 ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.015)',
                        border: i === 0 ? '1px solid rgba(124,58,237,0.15)' : '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '14px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)';
                        e.currentTarget.style.background = 'rgba(124,58,237,0.06)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = i === 0 ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.background = i === 0 ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.015)';
                      }}
                    >
                      {/* Rank */}
                      <span style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 800,
                        color: i < 3 ? '#fff' : 'rgba(240,240,245,0.35)',
                        background: i === 0 ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : i === 1 ? 'rgba(6,182,212,0.2)' : i === 2 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>

                      {/* Cover */}
                      <img
                        src={song.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&auto=format&fit=crop'}
                        alt="" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                      />

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f0f0f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {song.title}
                        </p>
                        {song.genre && (
                          <span style={{
                            display: 'inline-block', marginTop: '4px',
                            fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em',
                            color: 'rgba(167,139,250,0.6)', fontWeight: 600,
                            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                            borderRadius: '4px', padding: '1px 6px',
                          }}>
                            {song.genre.split(',')[0].trim()}
                          </span>
                        )}
                      </div>

                      {/* Stats & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                        <div style={{ textAlign: 'right', minWidth: '70px' }}>
                          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: CYAN }}>
                            {song.play_count.toLocaleString()}
                          </p>
                          <p style={{ margin: 0, fontSize: '10px', color: 'rgba(240,240,245,0.25)' }}>streams</p>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '70px' }}>
                          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: EMERALD }}>
                            {song.watch_hours || 0}
                          </p>
                          <p style={{ margin: 0, fontSize: '10px', color: 'rgba(240,240,245,0.25)' }}>hours</p>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ textAlign: 'right', minWidth: '60px' }}>
                            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: ROSE }}>
                              {song.like_count.toLocaleString()}
                            </p>
                            <p style={{ margin: 0, fontSize: '10px', color: 'rgba(240,240,245,0.25)' }}>likes</p>
                          </div>
                          <button
                            onClick={() => handleLike(song.id, i)}
                            style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                          >
                            <Heart style={{ width: '14px', height: '14px', color: song.is_liked ? '#f43f5e' : 'rgba(240,240,245,0.4)', fill: song.is_liked ? '#f43f5e' : 'none' }} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {(!top_songs || top_songs.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,240,245,0.2)', fontSize: '13px' }}>
                    <Music2 style={{ width: '40px', height: '40px', margin: '0 auto 12px', opacity: 0.3 }} />
                    <p>No songs uploaded yet. Upload your first track!</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ════════════════  AUDIENCE TAB  ════════════════ */}
          {activeTab === 'audience' && (
            <motion.div
              key="audience"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <div className="dashboard-audience-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Streams over time with bar chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={CARD_STYLE}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f5' }}>
                      Streams Over Time
                    </h3>
                    <select
                      value={daysFilter}
                      onChange={(e) => setDaysFilter(Number(e.target.value))}
                      style={{
                        padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(6,182,212,0.1)',
                        border: '1px solid rgba(6,182,212,0.2)',
                        fontSize: '12px', fontWeight: 600, color: CYAN,
                        appearance: 'none', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      <option value={7}>7 Days</option>
                      <option value={30}>30 Days</option>
                      <option value={90}>90 Days</option>
                    </select>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={daily_plays || []}>
                      <defs>
                        <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CYAN} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={CYAN} stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={d => `${new Date(d).getDate()}`}
                        stroke="rgba(240,240,245,0.15)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis stroke="rgba(240,240,245,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6,182,212,0.05)' }} />
                      <Bar dataKey="plays" name="Streams" fill="url(#barGrad2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Genre Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  style={CARD_STYLE}
                >
                  <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#f0f0f5' }}>
                    Genre Distribution
                  </h3>
                  {genre_breakdown && genre_breakdown.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {genre_breakdown.slice(0, 6).map((g, i) => {
                        const maxPlays = Math.max(...genre_breakdown.map(x => x.plays), 1);
                        const pct = Math.round((g.plays / maxPlays) * 100);
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f5' }}>{g.genre}</span>
                              <span style={{ fontSize: '12px', color: 'rgba(240,240,245,0.4)' }}>{g.plays.toLocaleString()} plays</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                style={{ height: '100%', borderRadius: '3px', background: `linear-gradient(90deg, ${PIE_COLORS[i % PIE_COLORS.length]}, ${PIE_COLORS[(i + 1) % PIE_COLORS.length]})` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'rgba(240,240,245,0.2)', fontSize: '13px' }}>
                      No genre data yet
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}
                className="dashboard-actions-grid"
              >
                {[
                  { label: 'Upload New Song', desc: 'Share your latest creation', icon: Music2, path: '/upload', color: VIOLET },
                  { label: 'Manage Uploads', desc: 'Edit or delete your tracks', icon: Disc3, path: '/my-uploads', color: CYAN },
                  { label: 'Discover Music', desc: 'Explore trending tracks', icon: Headphones, path: '/discover', color: EMERALD },
                ].map((action, i) => {
                  const ActionIcon = action.icon;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      onClick={() => navigate(action.path)}
                      style={{
                        ...CARD_STYLE,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s ease',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${action.color}33`;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: `${action.color}18`,
                        border: `1px solid ${action.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '14px',
                      }}>
                        <ActionIcon style={{ width: '18px', height: '18px', color: action.color }} />
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f0f0f5' }}>{action.label}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(240,240,245,0.3)' }}>{action.desc}</p>
                      <ExternalLink style={{ position: 'absolute', top: '16px', right: '16px', width: '14px', height: '14px', color: 'rgba(240,240,245,0.15)' }} />
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-charts-grid,
          .dashboard-audience-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .dashboard-actions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
