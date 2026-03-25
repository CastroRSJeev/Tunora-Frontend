import { create } from 'zustand';

const useMusicStore = create((set) => ({
  songs: [],
  publicPlaylists: [],
  featuredPlaylists: [], // The 4 displayed on Discover
  isSongsLoaded: false,
  isPlaylistsLoaded: false,
  isFeaturedLoaded: false,

  setSongs: (songs) => set({ songs, isSongsLoaded: true }),
  setPublicPlaylists: (publicPlaylists) => set({ publicPlaylists, isPlaylistsLoaded: true }),
  setFeaturedPlaylists: (featuredPlaylists) => set({ featuredPlaylists, isFeaturedLoaded: true }),
}));

export default useMusicStore;
