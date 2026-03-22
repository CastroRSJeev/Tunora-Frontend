import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Disc } from 'lucide-react';
import { SongCard } from '../components/ui/SongCard';

const DUMMY_SONGS = [
  { id: 1, title: 'Midnight City', artist: 'M83', genre: 'Synth-pop', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Starboy', artist: 'The Weeknd', genre: 'R&B', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Levitating', artist: 'Dua Lipa', genre: 'Dance-pop', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 4, title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Synth-pop', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=1000&auto=format&fit=crop', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 5, title: 'Save Your Tears', artist: 'The Weeknd', genre: 'Synth-pop', cover: 'https://images.unsplash.com/photo-1514525253344-f81aba3e2584?q=80&w=1000&auto=format&fit=crop', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 6, title: 'Peaches', artist: 'Justin Bieber', genre: 'Pop', cover: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?q=80&w=1000&auto=format&fit=crop', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: 7, title: 'Drivers License', artist: 'Olivia Rodrigo', genre: 'Bedroom pop', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: 8, title: 'Montero', artist: 'Lil Nas X', genre: 'Pop rap', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000&auto=format&fit=crop', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
];

export default function MusicLibrary() {
  const [search, setSearch] = useState('');
  const filteredSongs = DUMMY_SONGS.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-32 px-6 max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col gap-10 mb-16">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Disc className="w-8 h-8 text-purple-500 animate-spin-slow" />
            Your Library
          </h1>
          <p className="text-white/50">Explore your favorite tracks and new AI recommendations.</p>
        </div>

        <div className="relative group max-w-md w-full flex justify-start">
          <div className="search-container-uiverse">
            <Search className="search-icon-small" />
            <input 
              type="text" 
              placeholder="Search library..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-uiverse"
            />
          </div>
        </div>
      </div>

      {/* Songs Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredSongs.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <Search className="w-8 h-8 text-white/10" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
          <p className="text-white/40">Try adjusting your search or explore new genres.</p>
        </motion.div>
      )}
    </div>
  );
}
