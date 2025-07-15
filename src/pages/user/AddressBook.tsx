import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { AddressManager } from "@/components/user/addresses/AddressManager";

export default function AddressBook() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Meus Endereços</h1>
            <p className="text-muted-foreground">
              Gerencie seus endereços de entrega para facilitar suas compras.
            </p>
          </div>

          <AddressManager />
        </div>
      </main>

      <Footer />
    </div>
  );
}