import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Music, Shield, AlertTriangle, Search, 
  Filter, Ban, CheckCircle, BarChart3, TrendingUp,
  UserCheck, UserX, Ghost, MoreVertical, X
} from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../stores/authStore';
import { cn } from '../lib/utils';

/* ── Components ─────────────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, color, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group hover:bg-white/[0.05] transition-all duration-500"
      style={{
        padding: '32px',
        borderRadius: '32px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      {/* Decorative Gradient Blob */}
      <div 
        className={cn("absolute -top-10 -right-10 w-40 h-40 blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-700 rounded-full", color)} 
        style={{ pointerEvents: 'none' }}
      />
      
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div 
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110",
            color.replace('bg-', 'bg-').replace('-500', '-500/10').replace('-600', '-600/10'),
            color.replace('bg-', 'border-').replace('-500', '-500/20').replace('-600', '-600/20'),
            color.replace('bg-', 'text-')
          )}
        >
          <Icon className="w-7 h-7" />
        </div>
        
        <div>
          <h3 style={{ fontSize: '36px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', margin: 0, marginBottom: '4px' }} className="group-hover:translate-x-1 transition-transform duration-500">{value}</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 32px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
        border: 'none',
        color: active ? '#fff' : 'rgba(255, 255, 255, 0.4)',
        cursor: 'pointer'
      }}
      className="group"
    >
      {active && (
        <motion.div 
          layoutId="tab-pill-admin"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '9999px',
            boxShadow: '0 0 20px rgba(255,255,255,0.05)'
          }}
          initial={false}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <Icon className={cn("w-4 h-4 relative z-10 transition-colors", active ? "text-purple-400" : "text-current")} />
      <span style={{ position: 'relative', zIndex: 10 }}>{children}</span>
    </button>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────────── */

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [userRole, setUserRole] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [songStatus, setSongStatus] = useState('');
  const [songSearch, setSongSearch] = useState('');

  const fetchStats = async () => {
    try {
      const { data } = await api.get('auth/admin/stats/');
      setStats(data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get(`auth/admin/users/?role=${userRole}&q=${userSearch}`);
      setUsers(data);
    } catch (err) { console.error(err); }
  };

  const fetchSongs = async () => {
    try {
      const { data } = await api.get(`auth/admin/songs/?status=${songStatus}&q=${songSearch}`);
      setSongs(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'songs') fetchSongs();
    setLoading(false);
  }, [activeTab, userRole, userSearch, songStatus, songSearch]);

  const handleToggleBan = async (uid) => {
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, is_banned: !u.is_banned } : u));
    
    try {
      await api.post(`auth/admin/users/${uid}/toggle-ban/`);
      await fetchStats(); // Just sync stats
    } catch (err) {
      // Rollback on error
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, is_banned: !u.is_banned } : u));
      alert(err.response?.data?.error || 'Failed to toggle ban');
    }
  };

  const handleToggleBlock = async (sid) => {
    // Optimistic UI update
    setSongs(prev => prev.map(s => s.id === sid ? { ...s, is_blocked: !s.is_blocked } : s));
    
    try {
      await api.post(`auth/admin/songs/${sid}/toggle-block/`);
      await fetchStats(); // Just sync stats
    } catch (err) {
      // Rollback on error
      setSongs(prev => prev.map(s => s.id === sid ? { ...s, is_blocked: !s.is_blocked } : s));
      alert(err.response?.data?.error || 'Failed to toggle block');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '24px' }}>
        <div style={{ padding: '40px', borderRadius: '40px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(40px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', maxWidth: '448px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <Shield className="w-10 h-10" />
          </div>
          <div>
            <h2 style={{ fontSize: '30px', fontWeight: 700, color: 'white', margin: '0 0 8px 0' }}>Access Restricted</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.6, margin: 0 }}>This area is reserved for the High Table. Unauthorized biological entities are prohibited.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background Ambience */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: '25%', width: '500px', height: '500px', backgroundColor: 'rgba(124, 58, 237, 0.05)', filter: 'blur(120px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '25%', width: '600px', height: '600px', backgroundColor: 'rgba(59, 130, 246, 0.05)', filter: 'blur(120px)', borderRadius: '50%' }} />
      </div>

      <div 
        style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '48px 32px 100px 32px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '64px',
          position: 'relative',
          zIndex: 10
        }}
      >
        
        {/* Header Section */}
        <div 
          style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'between',
            gap: '40px', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
            paddingBottom: '48px' 
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a78bfa', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
              <div style={{ width: '32px', height: '1px', backgroundColor: 'rgba(167, 139, 250, 0.3)' }} />
              Administrative Control
            </div>
            <h1 style={{ fontSize: '64px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 0.9, margin: 0 }}>Platform Admin</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '18px', fontWeight: 500, margin: 0 }}>Manage the Tunora ecosystem and monitor growth.</p>
          </div>
          
          <div 
            style={{ 
              display: 'flex', 
              gap: '8px', 
              padding: '8px', 
              borderRadius: '9999px', 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(32px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={BarChart3}>Overview</TabButton>
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users}>Users</TabButton>
            <TabButton active={activeTab === 'songs'} onClick={() => setActiveTab('songs')} icon={Music}>Songs</TabButton>
          </div>
        </div>

          <AnimatePresence mode="wait">
            {activeTab === 'stats' && (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px'
                }}
              >
                <StatCard index={0} label="Total Listeners" value={stats?.total_listeners || 0} icon={Users} color="bg-blue-500" />
                <StatCard index={1} label="Total Artists" value={stats?.total_artists || 0} icon={Music} color="bg-purple-500" />
                <StatCard index={2} label="Active Songs" value={stats?.total_songs || 0} icon={CheckCircle} color="bg-green-500" />
                <StatCard index={3} label="Total Streams" value={stats?.total_plays || 0} icon={TrendingUp} color="bg-orange-500" />
                <StatCard index={4} label="Banned Users" value={stats?.banned_users || 0} icon={UserX} color="bg-red-500" />
                <StatCard index={5} label="Blocked Content" value={stats?.blocked_songs || 0} icon={AlertTriangle} color="bg-red-600" />
              </motion.div>
            )}

        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
          >
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center' }}>
                <Search style={{ position: 'absolute', left: '16px', width: '16px', height: '16px', color: 'rgba(255, 255, 255, 0.3)' }} />
                <input 
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    width: '100%', height: '48px', paddingLeft: '48px', paddingRight: '16px',
                    borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white',
                    outline: 'none', fontSize: '14px'
                  }}
                />
              </div>
              <select 
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                style={{
                  padding: '0 16px', height: '48px', borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)',
                  color: 'white', outline: 'none', fontSize: '14px', cursor: 'pointer',
                  minWidth: '160px'
                }}
              >
                <option value="" style={{ background: '#111' }}>All Roles</option>
                <option value="listener" style={{ background: '#111' }}>Listeners</option>
                <option value="artist" style={{ background: '#111' }}>Artists</option>
                <option value="admin" style={{ background: '#111' }}>Admins</option>
              </select>
            </div>

            {/* User List */}
            <div style={{ borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.02)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                    <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>User</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Role</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)' }}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{u.username}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.3)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '9999px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                          backgroundColor: u.role === 'admin' ? 'rgba(168, 85, 247, 0.1)' : u.role === 'artist' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: u.role === 'admin' ? '#a855f7' : u.role === 'artist' ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: u.is_banned ? '#ef4444' : '#22c55e', fontSize: '12px', fontWeight: 600 }}>
                          {u.is_banned ? <Ban size={14} /> : <CheckCircle size={14} />}
                          {u.is_banned ? 'Banned' : 'Active'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        {u.id !== user.id && (
                          <button 
                            onClick={() => handleToggleBan(u.id)}
                            style={{
                              padding: '8px 20px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                              backgroundColor: u.is_banned ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: u.is_banned ? '#22c55e' : '#ef4444'
                            }}
                          >
                            {u.is_banned ? "Unban Account" : "Ban Account"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div style={{ padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.2)', gap: '16px' }}>
                  <Ghost className="w-12 h-12" style={{ opacity: 0.1 }} />
                  <p style={{ margin: 0 }}>No users found matching your search</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'songs' && (
          <motion.div 
            key="songs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
          >
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center' }}>
                <Search style={{ position: 'absolute', left: '16px', width: '16px', height: '16px', color: 'rgba(255, 255, 255, 0.3)' }} />
                <input 
                  type="text"
                  placeholder="Search songs..."
                  value={songSearch}
                  onChange={(e) => setSongSearch(e.target.value)}
                  style={{
                    width: '100%', height: '48px', paddingLeft: '48px', paddingRight: '16px',
                    borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white',
                    outline: 'none', fontSize: '14px'
                  }}
                />
              </div>
              <select 
                value={songStatus}
                onChange={(e) => setSongStatus(e.target.value)}
                style={{
                  padding: '0 16px', height: '48px', borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)',
                  color: 'white', outline: 'none', fontSize: '14px', cursor: 'pointer',
                  minWidth: '160px'
                }}
              >
                <option value="" style={{ background: '#111' }}>All Status</option>
                <option value="public" style={{ background: '#111' }}>Public Only</option>
                <option value="blocked" style={{ background: '#111' }}>Blocked Only</option>
              </select>
            </div>

            <div style={{ borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.02)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                    <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Song</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Artist</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img src={s.cover_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{s.title}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.3)' }}>{s.genre}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>{s.artist}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)' }}>Uploaded {new Date(s.created_at).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: s.is_blocked ? '#f97316' : '#22c55e', fontSize: '12px', fontWeight: 600 }}>
                          {s.is_blocked ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                          {s.is_blocked ? 'Blocked' : 'Public'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleToggleBlock(s.id)}
                          style={{
                            padding: '8px 20px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            backgroundColor: s.is_blocked ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                            color: s.is_blocked ? '#22c55e' : '#f97316'
                          }}
                        >
                          {s.is_blocked ? "Publish Song" : "Block Song"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {songs.length === 0 && (
                <div style={{ padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.2)', gap: '16px' }}>
                  <Ghost className="w-12 h-12" style={{ opacity: 0.1 }} />
                  <p style={{ margin: 0 }}>No songs found matching your search</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
