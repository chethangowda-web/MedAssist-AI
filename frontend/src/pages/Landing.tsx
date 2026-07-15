import { Navbar } from '@components/landing/Navbar';
import { Hero } from '@components/landing/Hero';
import { Features } from '@components/landing/Features';
import { Stats } from '@components/landing/Stats';
import { Footer } from '@components/landing/Footer';

export function Landing() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Footer />
    </div>
  );
}
