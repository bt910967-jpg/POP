import { motion } from 'framer-motion';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-10 px-6 border-t border-white/5"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐥</span>
          <span className="font-kanit font-600 text-sm tracking-widest uppercase hero-heading">
            Talking Chick 3D
          </span>
        </div>

        <p className="font-kanit font-300 text-xs tracking-widest text-[#D7E2EA]/30 uppercase">
          Talking Chick 3D &copy; 2026 — Made with zero shame
        </p>

        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Contact'].map((item) => (
            <a
              key={item}
              href="#"
              className="font-kanit font-300 text-xs tracking-widest uppercase text-[#D7E2EA]/30 hover:text-[#D7E2EA]/70 transition-opacity duration-200"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}
