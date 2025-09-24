"use client";
import { useState } from "react";
import Header from "../../components/Header";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { apiFetch } from "@/lib/http.client";

function ProductDetails() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [myProduct, setMyProduct] = useState();
  // Mock product data - would come from API/props in real implementation
  const product = {
    id: 1,
    name: "CLASSIC GEAR TEE PIGMENT DYED",
    price: 45,
    images: [
      "/Archive/5_2a992873-e582-45db-98c5-1a6616ecac36.png",
      "/Archive/Shot_-20.jpg",
      "/Archive/7.png",
      "/Archive/Shot_-22 copy.jpg",
    ],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "White", value: "#FFFFFF" },
      { name: "Grey", value: "#808080" },
      { name: "Navy", value: "#1E3A8A" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Premium quality pigment dyed tee with classic gear design. Made from 100% organic cotton for ultimate comfort and durability.",
    inStock: true,
    sku: "STY-001-BLK",
  };

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

  async function getProduct(id) {
    const res = await apiFetch(`/api/products/${id}`); // no body on GET
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const data = await getProduct(params.id);
        setMyProduct(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [params.id]);

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery - Left Side */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-50 overflow-hidden">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-50 overflow-hidden border ${
                      selectedImage === index
                        ? "border-black border-2"
                        : "border-gray-200"
                    } hover:border-gray-400 transition-colors`}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Information - Right Side */}
            <div className="space-y-8">
              {/* Product Name and Price */}
              <div className="space-y-2">
                <h1 className="text-2xl lg:text-3xl font-light tracking-wide uppercase">
                  {product.name}
                </h1>
                <p className="text-xl font-medium">${product.price}</p>
                <p className="text-sm text-gray-600">SKU: {product.sku}</p>
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium uppercase tracking-wide">
                  Color:{" "}
                  {selectedColor && (
                    <span className="font-normal">{selectedColor}</span>
                  )}
                </h3>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 border-2 ${
                        selectedColor === color.name
                          ? "border-black"
                          : "border-gray-300"
                      } hover:border-gray-400 transition-colors`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {color.value === "#FFFFFF" && (
                        <div className="w-full h-full border border-gray-200"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium uppercase tracking-wide">
                  Size:{" "}
                  {selectedSize && (
                    <span className="font-normal">{selectedSize}</span>
                  )}
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 border text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium uppercase tracking-wide">
                  Quantity
                </h3>
                <div className="flex items-center space-x-4 max-w-32">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="text-lg font-medium min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 font-medium text-sm uppercase tracking-wider transition-colors ${
                  product.inStock
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!product.inStock}
              >
                {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
              </button>

              {/* Stock Status */}
              <div className="text-sm">
                {product.inStock ? (
                  <p className="text-green-600">✓ In Stock</p>
                ) : (
                  <p className="text-red-600">Out of Stock</p>
                )}
              </div>

              {/* Product Description */}
              <div className="space-y-3 border-t pt-8">
                <h3 className="text-sm font-medium uppercase tracking-wide">
                  Details
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Additional Info */}
              <div className="space-y-4 text-xs text-gray-600 border-t pt-8">
                <div>
                  <p className="font-medium">SHIPPING & RETURNS</p>
                  <p>
                    Free shipping on orders over $100. Returns accepted within
                    30 days.
                  </p>
                </div>
                <div>
                  <p className="font-medium">SIZE GUIDE</p>
                  <button className="underline hover:no-underline">
                    View size chart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetails;
