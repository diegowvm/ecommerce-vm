import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { FeaturedProducts } from "@/components/ui/featured-products";
import { CategoriesSection } from "@/components/ui/categories-section";
import { Footer } from "@/components/ui/footer";
import CookieConsentBanner from "@/components/ui/cookie-consent-banner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturedProducts />
        <CategoriesSection />
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  );
};

export default Index;
