import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { CartDrawer } from "@/components/cart/CartDrawer";
import CookieConsentBanner from "@/components/ui/cookie-consent-banner";
import { Helmet } from "react-helmet-async";
import { APP_CONFIG } from "@/lib/constants";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>{APP_CONFIG.name} - Moda, Calçados e Acessórios</title>
        <meta name="description" content={APP_CONFIG.description} />
        <meta name="keywords" content="moda, calçados, roupas, acessórios, outlet, marcas" />
        <meta property="og:title" content={`${APP_CONFIG.name} - Moda, Calçados e Acessórios`} />
        <meta property="og:description" content={APP_CONFIG.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={APP_CONFIG.url} />
        <link rel="canonical" href={APP_CONFIG.url} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          <HeroSection />
          <FeaturedProducts />
          <CategoriesSection />
          <BenefitsSection />
          <NewsletterSection />
        </main>
        
        <Footer />
        <CartDrawer />
        <CookieConsentBanner />
      </div>
    </>
  );
};

export default Index;
