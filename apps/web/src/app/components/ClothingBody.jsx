"use client";
import { useState } from 'react';
import styles from './ClothingBody.module.css';

function ProductCard({ front, back, description, price }) {
  const [showBack, setShowBack] = useState(false);

  const handlePrev = () => setShowBack(false); // left arrow = front
  const handleNext = () => setShowBack(true);  // right arrow = back

  return (
    <section className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={showBack ? back : front}
          alt={description}
          className={`${styles.image} ${showBack ? styles.backImage : ''}`}
        />
        <button className={`${styles.arrow} ${styles.left}`} onClick={handlePrev}>‹</button>
        <button className={`${styles.arrow} ${styles.right}`} onClick={handleNext}>›</button>
      </div>
      <h3 className={styles.description}>{description}</h3>
      <h4 className={styles.price}>{price}</h4>
      <div className={styles.sizeOverlay}>S&nbsp;&nbsp;M&nbsp;&nbsp;L&nbsp;&nbsp;XL&nbsp;&nbsp;XXL</div>
    </section>
  );
}

function ClothingBody() {
  return (
    <div className={styles.body}>
      <ProductCard 
        front="/Archive/5_2a992873-e582-45db-98c5-1a6616ecac36.png"
        back="/Archive/Shot_-20.jpg"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />
      <ProductCard 
        front="/Archive/7.png"
        back="/Archive/Shot_-22 copy.jpg"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />
      <ProductCard 
        front="/Archive/1 (1).png"
        back="/Archive/2_d355e303-8d2f-49aa-b204-82df5ddb8e7b.png"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />
      <ProductCard 
        front="/Archive/83E18625-F356-4F61-A2F0-666CB918D569.jpg"
        back="/Archive/42A0CA68-1A00-44FA-BCF1-021AEDBE96AE.jpg"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />

      <ProductCard 
        front="/Archive/1_eecc0c53-b2aa-4b25-aab7-72081eb3c6b1.png"
        back="/Archive/1_eecc0c53-b2aa-4b25-aab7-72081eb3c6b1.png"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />

      <ProductCard 
        front="/Archive/4 (1).png"
        back="/Archive/4 (1).png"
        description="CLASSIC GEAR TEE PIGMENT DYED"
        price="$45"
      />


    </div>
  );
}

export default ClothingBody;
