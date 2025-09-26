"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiFetch } from "@/lib/http.client";
import { addItem } from "@/lib/cart";

function ProductDetails() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [myProduct, setMyProduct] = useState(null);

  const params = useParams();
  const router = useRouter();

  async function getProduct(id) {
    const res = await apiFetch(`/api/products/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const data = await getProduct(params.id);
        console.log(data);
        setMyProduct(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [params.id]);

  console.log(myProduct);

  if (myProduct === null) return null;
  const selectedCount =
  selectedSize ? (myProduct.sizes?.[selectedSize] ?? 0) : 0;
  const canBuy = Boolean(selectedColor) && Boolean(selectedSize) && selectedCount > 0;

  const cartItem = {
    id: myProduct.id ?? params.id,
    name: myProduct.productName ?? myProduct.name ?? "Product",
    unitAmountCents:
      myProduct.unitAmountCents ??
      myProduct.priceCents ??
      (typeof myProduct.price === "number"
        ? Math.round(myProduct.price * 100)
        : undefined),
    currency: (myProduct.currency ?? "usd").toLowerCase(),
    imageUrl: myProduct.imageUrls[0] ?? "",
  };

  const handleBuyNow = () => {
    addItem(cartItem, quantity);
    alert(`Added ${quantity} × ${cartItem.name} to cart.`);
    router.push("/checkout");
  };

  return (
    <>
      {/* left product image*/}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="space-y-4">
          <div className="relative w-full bg-white aspect-square overflow-hidden rounded-xl">
            <img
              src={myProduct.imageUrls[selectedImage]}
              alt={myProduct.productName}
              className="w-full h-full object-contain"
            />

            {/* Left Arrow */}
            {/* Left Arrow */}
            <button
              type="button"
              onClick={() =>
                setSelectedImage(
                  (prev) =>
                    (prev - 1 + myProduct.imageUrls.length) % myProduct.imageUrls.length
                )
              }
              className="absolute top-1/2 left-3 -translate-y-1/2 text-3xl text-gray-700 hover:text-black"
            >
              ‹
            </button>

            {/* Right Arrow */}
            <button
              type="button"
              onClick={() =>
                setSelectedImage((prev) => (prev + 1) % myProduct.imageUrls.length)
              }
              className="absolute top-1/2 right-3 -translate-y-1/2 text-3xl text-gray-700 hover:text-black"
            >
              ›
            </button>

          </div>
        </section>

        {/* right product details */}
        <section className="flex flex-col justify-center">
          {/* name & price */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {myProduct.productName}
            </h1>
            <p className="mt-2 text-base">${myProduct.price}</p>
          </div>

          {/* color */}
          <div className="mb-6">
            <p className="text-xs uppercase text-gray-500 mb-2">Color</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedColor(myProduct.color)}
                className={`w-8 h-8 rounded-md border ${
                  selectedColor === myProduct.color
                    ? "border-black"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: myProduct.color }}
                title={myProduct.color}
              >
                <span className="sr-only">{myProduct.color}</span>
              </button>
              <span className="text-sm text-gray-700">
                {selectedColor || "Select color"}
              </span>
            </div>
          </div>

          {/* sizes (static demo for now) */}
          {/* sizes from API */}
          <div className="mb-6">
            <p className="text-xs uppercase text-gray-500 mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(myProduct.sizes ?? {}).map(([size, count]) => {
                const isOutOfStock = (count ?? 0) <= 0;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => !isOutOfStock && setSelectedSize(size)}
                    className={`px-3 py-2 text-sm border rounded-md relative
                      ${selectedSize === size ? "border-black" : "border-gray-300"}
                      ${isOutOfStock ? "bg-gray-200 text-gray-400 cursor-not-allowed line-through" : ""}
                    `}
                    title={isOutOfStock ? `${size} - Out of stock` : `${size} - In stock`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>


          <div className="flex flex-col">
            <p className="text-xs uppercase text-gray-500 mb-2">Quantity</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>


          {/* add to bag */}
          <div className="mt-8">
            <button
              onClick={handleBuyNow}
              disabled={!canBuy}
              className={`w-full h-14 text-white font-medium rounded-none ${
                !canBuy ? "bg-black/60 cursor-not-allowed" : "bg-black hover:opacity-90"
              }`}
            >
              ADD TO BAG
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

export default ProductDetails;
