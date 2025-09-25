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

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    if (!selectedColor) {
      alert("Please select a color");
      return;
    }

    console.log("Adding to cart:", {
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    alert("Added to cart!");
  };

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
  };

  const handleBuyNow = () => {
    addItem(cartItem, quantity);
    alert(`Added ${quantity} × ${cartItem.name} to cart.`);
    router.push("/checkout");
  };

  return (
    <>
      <div>
        <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
          −
        </button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity((q) => q + 1)}>+</button>
      </div>

      <button onClick={handleBuyNow}>Buy Now</button>
    </>
  );
}

export default ProductDetails;
