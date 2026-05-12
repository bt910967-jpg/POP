import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const links = ['About', 'Voice Modes', 'Demo', 'Contact'];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
      style={{
        background: scrolled ? 'rgba(12,12,12,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'background 0.4s, backdrop-filter 0.4s',
      }}
    >
      <motion.div
        className="flex items-center gap-2"
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <span className="text-2xl">🐥</span>
        <span className="font-kanit font-700 text-lg tracking-widest uppercase hero-heading">
          Talking Chick
        </span>
      </motion.div>

      <ul className="hidden md:flex items-center gap-8">
        {links.map((link, i) => (
          <motion.li
            key={link}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
          >
            <a
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              className="font-kanit font-400 text-sm tracking-widest uppercase text-[#D7E2EA] opacity-60 hover:opacity-100 transition-opacity duration-200"
            >
              {link}
            </a>
          </motion.li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="gradient-btn px-5 py-2 rounded-full text-sm font-kanit font-600 tracking-wider uppercase"
      >
        Try Now
      </motion.button>
    </motion.nav>
  );
}
