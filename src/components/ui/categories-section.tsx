import { CategoryCard } from "./category-card";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
const categories = [{
  title: "Running",
  description: "Tênis para corrida e performance",
  image: product1,
  itemCount: 156,
  gradient: "from-blue-600/80 to-blue-800/90"
}, {
  title: "Basketball",
  description: "Calçados para quadra",
  image: product2,
  itemCount: 89,
  gradient: "from-red-600/80 to-red-800/90"
}, {
  title: "Lifestyle",
  description: "Estilo casual para o dia a dia",
  image: product3,
  itemCount: 234,
  gradient: "from-green-600/80 to-green-800/90"
}];
export function CategoriesSection() {
  return <section className="py-20 bg-gradient-to-b from-surface/30 to-background">
      
    </section>;
}