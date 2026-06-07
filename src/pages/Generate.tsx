import { useState } from 'react';
import {
  Sparkles,
  Download,
  Share2,
  Image as ImageIcon,
  RefreshCw,
  Copy,
  Brain,
  Cpu,
  Search,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface MemeResult {
  success: boolean;
  meme_url: string;
  template_name: string;
  similarity_score: number;
  method: string;
  agent_reasoning: string;
  meme_text: string;
}

export default function Generate() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<MemeResult | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  const checkBackend = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        setBackendStatus('online');
        return true;
      }
    } catch {
      setBackendStatus('offline');
    }
    return false;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);

    try {
      const isOnline = await checkBackend();
      if (!isOnline) {
        toast.error('Backend is offline. Start it with: cd backend && python -m uvicorn app:app --reload');
        setIsGenerating(false);
        return;
      }

      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), top_k: 5 }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data: MemeResult = await response.json();
      data.meme_url = `${API_URL}${data.meme_url}`;
      setResult(data);
      toast.success(`Found match! Score: ${(data.similarity_score * 100).toFixed(1)}%`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate. Is the backend running?');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const response = await fetch(result.meme_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `memegenius-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch {
      window.open(result.meme_url, '_blank');
    }
  };

  const handleShare = async () => {
    if (!result) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MemeGenius', url: result.meme_url });
      } catch { copyUrl(); }
    } else {
      copyUrl();
    }
  };

  const copyUrl = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.meme_url).then(() => {
      toast.success('URL copied!');
    });
  };

  return (
    <div className="relative gradient-bg min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
                AI Meme Generator
              </span>
            </h1>
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Brain className="h-4 w-4" />
              Powered by CLIP + GAN Multi-Agent System
            </p>
            {/* Backend status */}
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${
                backendStatus === 'online' 
                  ? 'bg-green-500/10 text-green-500' 
                  : backendStatus === 'offline'
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  backendStatus === 'online' ? 'bg-green-500' : 
                  backendStatus === 'offline' ? 'bg-red-500' : 'bg-muted-foreground'
                }`} />
                {backendStatus === 'online' ? 'Backend Connected' : 
                 backendStatus === 'offline' ? 'Backend Offline' : 'Click Generate to connect'}
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-5"
            >
              {/* Architecture badge */}
              <div className="p-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Multi-Agent Architecture</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                    Agent 1: Intent Analyzer (emotion + topic)
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Agent 2: CLIP Retrieval (text→image matching)
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                    Agent 3: GAN Generator (image synthesis)
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Orchestrator: Picks best result
                  </div>
                </div>
              </div>

              {/* Prompt input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  Describe what you want
                </label>
                <textarea
                  placeholder="e.g. when your code compiles on first try, sad programming moment, waiting for deployment..."
                  className="w-full min-h-[130px] rounded-2xl border border-border bg-card/80 backdrop-blur-sm px-4 py-3.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition-all"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleGenerate();
                    }
                  }}
                />
                <p className="text-[11px] text-muted-foreground/70">
                  ⌘+Enter to generate • CLIP finds the most relevant meme from 2400+ images
                </p>
              </div>

              {/* Generate button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-violet-500/20"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Agents Working...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </motion.button>

              {/* Agent reasoning */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-3"
                  >
                    {/* Score & Method */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/60">
                      <div>
                        <span className="text-xs text-muted-foreground">Match Score</span>
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {result.method.toUpperCase()}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${
                        result.similarity_score > 0.5 ? 'text-green-500' :
                        result.similarity_score > 0.3 ? 'text-amber-500' : 'text-muted-foreground'
                      }`}>
                        {(result.similarity_score * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* Meme text extracted */}
                    {result.meme_text && (
                      <div className="p-3 rounded-xl border border-border bg-card/60">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Text in meme</span>
                        <p className="text-xs text-foreground mt-1 italic">"{result.meme_text}"</p>
                      </div>
                    )}

                    {/* Reasoning toggle */}
                    <button
                      onClick={() => setShowReasoning(!showReasoning)}
                      className="w-full text-left p-3 rounded-xl border border-border bg-card/60 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium">Agent Reasoning</span>
                      </div>
                      {showReasoning && (
                        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                          {result.agent_reasoning}
                        </p>
                      )}
                    </button>

                    {/* Action buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownload}
                        className="py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Save
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleShare}
                        className="py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={copyUrl}
                        className="py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right: Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 flex items-start justify-center"
            >
              <div className="w-full max-w-[540px] rounded-3xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden glow">
                <div className="aspect-square flex items-center justify-center p-2">
                  <AnimatePresence mode="wait">
                    {result ? (
                      <motion.img
                        key={result.meme_url}
                        src={result.meme_url}
                        alt="Generated meme"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center p-10"
                      >
                        <div className="h-20 w-20 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-5">
                          <ImageIcon className="h-9 w-9 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground font-medium text-sm">
                          AI will find the best meme
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-2 max-w-[240px] mx-auto">
                          CLIP analyzes 2,400+ meme images and finds the one that best matches your description
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
