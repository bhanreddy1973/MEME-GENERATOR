import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { MEME_TEMPLATES } from '@/lib/memeTemplates';

export default function Gallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  return (
    <div className="relative gradient-bg min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
              Meme Templates
            </span>
          </h1>
          <p className="text-muted-foreground">
            Click any template to start creating with it
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {MEME_TEMPLATES.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5) }}
            >
              <Link
                to="/generate"
                className="block group"
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="aspect-square rounded-2xl border border-border bg-card overflow-hidden relative shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:border-primary/30">
                  {/* Shimmer placeholder */}
                  {!loadedImages.has(template.id) && (
                    <div className="absolute inset-0 shimmer" />
                  )}

                  <img
                    src={template.url}
                    alt={template.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      hoveredId === template.id ? 'scale-110 brightness-75' : 'scale-100'
                    } ${loadedImages.has(template.id) ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => setLoadedImages((prev) => new Set(prev).add(template.id))}
                  />

                  {/* Hover overlay */}
                  <AnimatePresence>
                    {hoveredId === template.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]"
                      >
                        <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                          <span className="text-white text-xs font-medium flex items-center gap-1.5">
                            Use this
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="mt-2.5 text-xs text-muted-foreground text-center font-medium truncate px-1">
                  {template.name}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-14"
        >
          <Link to="/generate">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-medium text-sm shadow-lg shadow-violet-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Start Creating a Meme
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
