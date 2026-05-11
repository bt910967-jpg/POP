import { motion } from 'framer-motion';
import { Mic, Zap, Box, AudioWaveform } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Live Recording',
    description:
      'Crystal-clear microphone capture using the Web Audio API with real-time noise suppression.',
    accent: '#BBCCD7',
  },
  {
    icon: Zap,
    title: 'Funny Playback',
    description:
      'Five hilarious voice filters — chipmunk, monster, robot, echo, and slow motion.',
    accent: '#F59E0B',
  },
  {
    icon: Box,
    title: '3D Animation',
    description:
      'Fully interactive 3D poop emoji rendered with Three.js and react-three-fiber.',
    accent: '#A78BFA',
  },
  {
    icon: AudioWaveform,
    title: 'Audio Effects',
    description:
      'Real-time audio graph with pitch shift, distortion, delay, and ring modulation.',
    accent: '#34D399',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-kanit font-800 text-4xl md:text-5xl hero-heading mb-4">
            Features
          </h2>
          <p className="font-kanit font-300 text-[#D7E2EA]/50 text-lg">
            Premium tech packed into one absurd package.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-card rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
              style={{
                boxShadow: `0 0 0 0 ${f.accent}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${f.accent}22`;
                (e.currentTarget as HTMLDivElement).style.borderColor = `${f.accent}33`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                (e.currentTarget as HTMLDivElement).style.borderColor = '';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}30` }}
              >
                <f.icon size={20} style={{ color: f.accent }} />
              </div>
              <div>
                <h3 className="font-kanit font-700 text-base text-[#D7E2EA] mb-1.5">
                  {f.title}
                </h3>
                <p className="font-kanit font-300 text-[#D7E2EA]/50 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
