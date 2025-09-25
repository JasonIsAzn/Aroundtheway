"use client";
import { useState } from 'react';
import Header from '../../components/Header';
import { useParams } from "next/navigation";
import { useEffect } from 'react';
import { apiFetch } from '@/lib/http.client';

function ProductDetails() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [myProduct, setMyProduct] = useState(null);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    if (!selectedColor) {
      alert('Please select a color');
      return;
    }

    console.log('Adding to cart:', {
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity
    });
    alert('Added to cart!');
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
      console.log(data);
      setMyProduct(data);
    } catch (err) {
      console.error(err);
    }
  })();
}, [params.id]);

console.log(myProduct);


if (myProduct === null) return null;  
  return (
    <>
      {myProduct.productName}
    </>
  );
}

export default ProductDetails;