import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-10 text-center">
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-purple-500 to-pink-600">
            Transform Text into
            <br />
            Viral Memes Instantly
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Harness the power of AI to create hilarious, shareable memes from your text prompts. No design skills needed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/generate">
            <Button size="lg" className="group">
              Start Creating
              <Sparkles className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
        <div className="p-6 rounded-lg border bg-card">
          <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
            <Sparkles className="h-5 w-5 text-violet-500" />
          </div>
          <h3 className="font-semibold mb-2">AI-Powered</h3>
          <p className="text-muted-foreground">Advanced AI that understands context and humor to create perfect memes.</p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="font-semibold mb-2">Lightning Fast</h3>
          <p className="text-muted-foreground">Generate memes in seconds with our optimized processing pipeline.</p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center mb-4">
            <Sparkles className="h-5 w-5 text-pink-500" />
          </div>
          <h3 className="font-semibold mb-2">Endless Possibilities</h3>
          <p className="text-muted-foreground">Access a vast library of meme templates and styles.</p>
        </div>
      </div>
    </div>
  );
}