import { Navbar } from '@components/landing/Navbar';
import { Footer } from '@components/landing/Footer';
import { Features } from '@components/landing/Features';

export function FeaturesPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar />
      <div className="pt-20">
        <Features />
      </div>
      <Footer />
    </div>
  );
}
