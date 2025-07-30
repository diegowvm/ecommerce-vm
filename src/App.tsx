import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CacheProvider } from "@/lib/cache";

// Core pages (loaded immediately)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";

// User pages (lazy loaded)
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Profile = lazy(() => import("./pages/Profile"));
const AddressBook = lazy(() => import("./pages/user/AddressBook"));
const Wishlist = lazy(() => import("./pages/user/Wishlist"));

// Legal pages (lazy loaded)
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));

// Info pages (lazy loaded)
const Help = lazy(() => import("./pages/Help"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));

// Product category pages (lazy loaded)
const NewReleases = lazy(() => import("./pages/products/NewReleases"));
const Men = lazy(() => import("./pages/products/Men"));
const Women = lazy(() => import("./pages/products/Women"));
const Kids = lazy(() => import("./pages/products/Kids"));
const Outlet = lazy(() => import("./pages/products/Outlet"));
const Brands = lazy(() => import("./pages/products/Brands"));

// Company pages (lazy loaded)
const Careers = lazy(() => import("./pages/Careers"));
const Press = lazy(() => import("./pages/Press"));
const Sustainability = lazy(() => import("./pages/Sustainability"));
const Investors = lazy(() => import("./pages/Investors"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));

// Admin pages (lazy loaded)
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminMarketplaces = lazy(() => import("./pages/admin/AdminMarketplaces"));
const AdminReturns = lazy(() => import("./pages/admin/AdminReturns"));
const AdminApiIntegrations = lazy(() => import("./pages/admin/AdminApiIntegrations"));
const AdminApiMonitoring = lazy(() => import("./pages/admin/AdminApiMonitoring"));

const App = () => (
  <CacheProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          }>
            <Routes>
              {/* Core routes - loaded immediately */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              
              {/* User routes - lazy loaded */}
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/order-confirmation" element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/addresses" element={
                <ProtectedRoute>
                  <AddressBook />
                </ProtectedRoute>
              } />
              <Route path="/profile/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />
              
              {/* Legal pages - lazy loaded */}
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              
              {/* Info pages - lazy loaded */}
              <Route path="/help" element={<Help />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              
              {/* Product category pages - lazy loaded */}
              <Route path="/products/new-releases" element={<NewReleases />} />
              <Route path="/products/men" element={<Men />} />
              <Route path="/products/women" element={<Women />} />
              <Route path="/products/kids" element={<Kids />} />
              <Route path="/products/outlet" element={<Outlet />} />
              <Route path="/products/brands" element={<Brands />} />
              
              {/* Company pages - lazy loaded */}
              <Route path="/careers" element={<Careers />} />
              <Route path="/press" element={<Press />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/investors" element={<Investors />} />
              <Route path="/cookies-policy" element={<CookiesPolicy />} />
              
              {/* Admin routes - lazy loaded */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute requireAdmin>
                  <AdminProducts />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute requireAdmin>
                  <AdminCategories />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute requireAdmin>
                  <AdminOrders />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute requireAdmin>
                  <AdminAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/admin/inventory" element={
                <ProtectedRoute requireAdmin>
                  <AdminInventory />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requireAdmin>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/marketplaces" element={
                <ProtectedRoute requireAdmin>
                  <AdminMarketplaces />
                </ProtectedRoute>
              } />
              <Route path="/admin/api-integrations" element={
                <ProtectedRoute requireAdmin>
                  <AdminApiIntegrations />
                </ProtectedRoute>
              } />
              <Route path="/admin/api-monitoring" element={
                <ProtectedRoute requireAdmin>
                  <AdminApiMonitoring />
                </ProtectedRoute>
              } />
              <Route path="/admin/returns" element={
                <ProtectedRoute requireAdmin>
                  <AdminReturns />
                </ProtectedRoute>
              } />
              
              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </CacheProvider>
);

export default App;