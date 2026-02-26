import t1 from "../assets/images/t1.jpg";
import t2 from "../assets/images/t2.jpg.webp";
import t3 from "../assets/images/t3.jpg.webp";
import t4 from "../assets/images/t4.jpg.webp";
import t5 from "../assets/images/t5.jpg";

import ProductCart from "../component/ProductCart";

function Shop() {
  const products = [
    { id: 1, name: "T-shirt", price: 29, image: t1 },
    { id: 2, name: "Cotton-shirt", price: 21, image: t2 },
    { id: 3, name: "Blue-shirt", price: 45, image: t3 },
    { id: 4, name: "Green-shirt", price: 45, image: t4 },
    { id: 5, name: "Red-shirt", price: 45, image: t5 },
  ];
  return (
    <section className="flex grow">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-3 mt-8">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCart {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Shop;
