import { Link } from 'react-router-dom';
import { Sparkles, Zap, Palette, Download, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { MEME_TEMPLATES } from '@/lib/memeTemplates';

const features = [
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Create memes in seconds using 25+ popular templates with the Imgflip API.',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/20',
  },
  {
    icon: Palette,
    title: 'Classic Templates',
    description: 'Drake, Distracted Boyfriend, Change My Mind — all your favorites are here.',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/20',
  },
  {
    icon: Download,
    title: 'Download & Share',
    description: 'Save memes as images or share them directly via the Web Share API.',
    gradient: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/20',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  return (
    <div className="relative gradient-bg noise">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-[15%] w-72 h-72 bg-violet-500/8 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-40 right-[10%] w-96 h-96 bg-pink-500/6 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-20 left-[30%] w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Free &amp; Open — No signup required
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Create Viral Memes{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
              In Seconds
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Type your idea, choose from 25+ classic templates, and download your meme. 
            No accounts, no watermarks — just pure meme energy.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/generate">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold text-base shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
              >
                <Sparkles className="h-5 w-5" />
                Start Creating
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link to="/gallery">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-border bg-card hover:bg-muted font-semibold text-base transition-colors"
              >
                <Play className="h-4 w-4" />
                Browse Templates
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Template preview strip */}
      <section className="py-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex gap-4 animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused]">
            {[...MEME_TEMPLATES, ...MEME_TEMPLATES].map((template, i) => (
              <div
                key={`${template.id}-${i}`}
                className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border border-border/50 bg-card"
              >
                <img
                  src={template.url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything you need</h2>
          <p className="text-muted-foreground text-lg">Simple, fast, and completely free</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className={`relative p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm hover:border-border/80 transition-all duration-300 hover:shadow-xl ${feature.glow}`}
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.glow}`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Three steps to perfection</h2>
          <p className="text-muted-foreground text-lg">No learning curve. Just memes.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: '01', title: 'Type Your Idea', desc: 'Enter your meme text. Use " | " to set top and bottom lines.' },
            { step: '02', title: 'Pick a Template', desc: 'Choose from 25+ classic formats or let us pick a random one.' },
            { step: '03', title: 'Download & Share', desc: 'Save as an image or share directly to any platform.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="text-5xl font-bold text-primary/10 mb-3">{item.step}</div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-violet-500/10 via-card to-pink-500/10 p-10 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,80,255,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.08),transparent_50%)]" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to make some memes?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Jump in and start creating. It takes about 3 seconds.
            </p>
            <Link to="/generate">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold shadow-xl shadow-violet-500/25"
              >
                <Sparkles className="h-5 w-5" />
                Let's Go
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built with React, Tailwind CSS, Framer Motion &amp; the{' '}
            <a href="https://imgflip.com/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Imgflip API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
