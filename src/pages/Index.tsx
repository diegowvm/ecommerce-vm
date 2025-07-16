import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { FeaturedProducts } from "@/components/ui/featured-products";
import { CategoriesSection } from "@/components/ui/categories-section";
import { Footer } from "@/components/ui/footer";
import CookieConsentBanner from "@/components/ui/cookie-consent-banner";
import { LazyComponent } from "@/components/ui/lazy-component";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <LazyComponent>
          <FeaturedProducts />
        </LazyComponent>
        <LazyComponent>
          <CategoriesSection />
        </LazyComponent>
      </main>
      <LazyComponent>
        <Footer />
      </LazyComponent>
      <LazyComponent>
        <CookieConsentBanner />
      </LazyComponent>
      <PerformanceMonitor />
    </div>
  );
};

export default Index;
