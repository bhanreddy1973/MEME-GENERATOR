import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Generate from '@/pages/Generate';
import Gallery from '@/pages/Gallery';
import { ThemeProvider } from '@/components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
