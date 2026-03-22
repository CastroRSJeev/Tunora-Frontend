import { create } from 'zustand';

const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  volume: 0.8,
  progress: 0,
  duration: 0,
  isMuted: false,
  isShuffled: false,
  repeatMode: 'off', // 'off' | 'all' | 'one'

  // Playback controls
  play: (track) => {
    if (track) {
      set({ currentTrack: track, isPlaying: true, progress: 0 });
    } else {
      set({ isPlaying: true });
    }
  },

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () => {
    const { queue, currentTrack } = get();
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    set({ currentTrack: queue[nextIndex], isPlaying: true, progress: 0 });
  },

  previous: () => {
    const { queue, currentTrack } = get();
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    set({ currentTrack: queue[prevIndex], isPlaying: true, progress: 0 });
  },

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setProgress: (progress) => set({ progress }),

  setDuration: (duration) => set({ duration }),

  setQueue: (queue) => set({ queue }),

  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

  cycleRepeat: () =>
    set((state) => {
      const modes = ['off', 'all', 'one'];
      const next = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
      return { repeatMode: next };
    }),
}));

export default usePlayerStore;
