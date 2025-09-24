"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/http.client";

function ProductCard({ front, back, description, price, productId = 1 }) {
  const [showBack, setShowBack] = useState(false);

  const handlePrev = () => setShowBack(false); // left arrow = front
  const handleNext = () => setShowBack(true); // right arrow = back

  const handleCardClick = () => {
    window.location.href = `/product/${productId}`;
  };
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
    }
    loadData();
  },[])

  return (
    <section className="cursor-pointer group" onClick={handleCardClick}>
      <div className="relative w-full aspect-square overflow-hidden bg-white">
        <img
          src={showBack ? back : front}
          alt={description}
          className="w-full h-full object-cover"
        />
        <button
          className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-white text-black text-sm w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handlePrev}
        >
          ‹
        </button>
        <button
          className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-white text-black text-sm w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleNext}
        >
          ›
        </button>
      </div>
      <div className="pt-3">
        <p className="text-xs uppercase font-medium text-black">
          {description}
        </p>
        <p className="text-xs text-black mt-1">{price}</p>
      </div>
    </section>
  );
}

function ClothingBody() {
  return (
    

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 py-8 max-w-7xl mx-auto">
      <ProductCard
        productId={1}
        front="/Archive/5_2a992873-e582-45db-98c5-1a6616ecac36.png"
        back="/Archive/Shot_-20.jpg"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />
      <ProductCard
        productId={2}
        front="/Archive/7.png"
        back="/Archive/Shot_-22 copy.jpg"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />
      <ProductCard
        productId={3}
        front="/Archive/1 (1).png"
        back="/Archive/2_d355e303-8d2f-49aa-b204-82df5ddb8e7b.png"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />
      <ProductCard
        productId={4}
        front="/Archive/83E18625-F356-4F61-A2F0-666CB918D569.jpg"
        back="/Archive/42A0CA68-1A00-44FA-BCF1-021AEDBE96AE.jpg"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />

      <ProductCard
        productId={5}
        front="/Archive/1_eecc0c53-b2aa-4b25-aab7-72081eb3c6b1.png"
        back="/Archive/1_eecc0c53-b2aa-4b25-aab7-72081eb3c6b1.png"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />

      <ProductCard
        productId={6}
        front="/Archive/4 (1).png"
        back="/Archive/4 (1).png"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />
    </div>
  );
}

export default ClothingBody;
