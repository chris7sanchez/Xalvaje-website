import { } from 'react';
import { Navigation } from '@/components/Navigation';
import { PageOverlay } from '@/components/PageOverlay';
import { Hero } from '@/sections/Hero';
import { About } from '@/sections/About';
import { Services } from '@/sections/Services';
import { Portfolio } from '@/sections/Portfolio';
import { Photography } from '@/sections/Photography';
import { Testimonials } from '@/sections/Testimonials';
import { CTA } from '@/sections/CTA';
import { Footer } from '@/sections/Footer';
import { usePageLoad } from '@/hooks/usePageLoad';

function App() {
  const { showOverlay } = usePageLoad(500);

  return (
    <div className="min-h-screen bg-white">
      {/* Page Load Overlay */}
      <PageOverlay isVisible={showOverlay} />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Photography />
        <Testimonials />
        <CTA />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
