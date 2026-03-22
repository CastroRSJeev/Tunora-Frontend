import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import Navbar from '../components/Navbar';
import MusicPlayer from '../components/MusicPlayer';

export default function RootLayout() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '72px', paddingBottom: '80px' }}>
        <Outlet />
      </main>
      <MusicPlayer />
    </div>
  );
}
