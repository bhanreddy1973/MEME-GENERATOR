import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Sparkles, Download, Share2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Generate() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Add your actual API integration here
      toast.success('Meme generated successfully!');
      setGeneratedMeme('https://source.unsplash.com/random/800x800/?meme');
    } catch (error) {
      toast.error('Failed to generate meme');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container py-10 min-h-[calc(100vh-4rem)]"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 text-center"
        >
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-purple-500 to-pink-600">
            Create Your Meme
          </h1>
          <p className="text-muted-foreground">
            Let AI transform your ideas into hilarious memes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Textarea
              placeholder="Describe your meme idea..."
              className="min-h-[200px] resize-none text-lg p-4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button
              className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-600 hover:opacity-90"
              size="lg"
              onClick={handleGenerate}
              disabled={!prompt || isGenerating}
            >
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="flex items-center"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generating...
                </motion.div>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Meme
                </>
              )}
            </Button>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={generatedMeme ? 'meme' : 'placeholder'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="aspect-square flex items-center justify-center bg-muted relative overflow-hidden group">
                {generatedMeme ? (
                  <img
                    src={generatedMeme}
                    alt="Generated meme"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Your meme will appear here</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <Button
            variant="outline"
            disabled={!generatedMeme || isGenerating}
            className="group"
          >
            <Download className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
            Download
          </Button>
          <Button
            variant="outline"
            disabled={!generatedMeme || isGenerating}
            className="group"
          >
            <Share2 className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
            Share
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}