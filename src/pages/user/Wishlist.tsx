import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { WishlistManager } from "@/components/user/wishlist/WishlistManager";

export default function Wishlist() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Lista de Favoritos</h1>
            <p className="text-muted-foreground">
              Produtos que você salvou para comprar mais tarde.
            </p>
          </div>

          <WishlistManager />
        </div>
      </main>

      <Footer />
    </div>
  );
}