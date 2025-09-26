"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/http.client";
import Footer from "./Footer";


function ProductCard({ front, back, description, price, productId = 1 }) {
  const [showBack, setShowBack] = useState(false);

  const handlePrev = (e) => {
    e.stopPropagation();           // <— prevent parent navigation
    setShowBack(false);
  };
  const handleNext = (e) => {
    e.stopPropagation();           // <— prevent parent navigation
    setShowBack(true);
  };

  const handleCardClick = () => {
    window.location.href = `/product/${productId}`;
  };

  const imgSrc = showBack && back ? back : front;

  return (
    <section className="cursor-pointer group" onClick={handleCardClick}>
      <div className="relative w-full aspect-square overflow-hidden bg-white">
        <img
          src={imgSrc}
          alt={description}
          className="w-full h-full object-cover"
        />
        <button
  type="button"
  className="absolute top-1/2 left-3 transform -translate-y-1/2 
             text-black text-lg w-6 h-6 flex items-center justify-center 
             opacity-0 group-hover:opacity-100 transition-opacity"
  onClick={handlePrev}
  aria-label="Show front"
>
  ‹
</button>
<button
  type="button"
  className="absolute top-1/2 right-3 transform -translate-y-1/2 
             text-black text-lg w-6 h-6 flex items-center justify-center 
             opacity-0 group-hover:opacity-100 transition-opacity"
  onClick={handleNext}
  aria-label="Show back"
>
  ›
</button>

      </div>
      <div className="pt-3">
        <p className="text-xs uppercase text-black text-[13px]">{description}</p>
        <p className="text-xs text-black mt-1 text-[13px]">${price}</p>
      </div>
    </section>
  );
}


function ClothingBody() {
  const [products, setProducts] = useState(null);

  async function getProducts() {
    const res = await apiFetch("/api/products", {
      method: "GET",
    });
    return res.json();
  }

  useEffect(() => {
    const loadData = async () => {
      const data = await getProducts();
      console.log(data);
      setProducts(data);
    }
    loadData();
  },[])

  console.log(products);
  if (products === null)
  {
    return null;
  }  
  return (
    <>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 py-8 max-w-7xl mx-auto">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          productId={product.id}
          front={product.thumbnailUrl[0]}
          back={product.thumbnailUrl[1]}
          description={product.productName}
          price={product.price}
        />

      ))}
    </div>

    </>
  );
}

export default ClothingBody;
