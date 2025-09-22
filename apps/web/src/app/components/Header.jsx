"use client";
import styles from "./Header.module.css";
import { useState } from "react";

function Header() {
  const [logoSrc, setLogoSrc] = useState("/aroundthewayLogoA.png");

  return (
    <div className={styles.container}>
      <img
        className={styles.image}
        src={logoSrc}
        alt="Aroundtheway Logo"
        onMouseEnter={() => setLogoSrc("/aroundthewayLogo.png")}
        onMouseLeave={() => setLogoSrc("/aroundthewayLogoA.png")}
      />

      <nav className={styles.navBarContainer}>
        <ul className={styles.navBar}>
          <li className={styles.hasDropdown}>
            <a href="#">SHOP</a>
            <ul className={styles.dropdown} aria-label="Market submenu">
              <li>
                <a href="/clothing">CLOTHING</a>
              </li>
              <li>
                <a href="#">ACCESSORIES</a>
              </li>
            </ul>
          </li>

          <li className={styles.hasDropdown}>
            <a href="#">COMMUNITY</a>
            <ul className={styles.dropdown} aria-label="Market submenu">
              <li>
                <a href="#">EVENTS</a>
              </li>
              <li>
                <a href="#">BARBERSHOP</a>
              </li>
            </ul>
          </li>

          <li className={styles.hasDropdown}>
            <a href="#">CONTACT</a>
            <ul className={styles.dropdown} aria-label="Market submenu">
              <li>
                <a href="#">INQUIRE</a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <section className={styles.navFooterContainer}>
        <ul className={styles.navFooter}>
          <li>
            <a href="#">ACCOUNT</a>
          </li>
          <li>
            <a href="#">BAG</a>
          </li>
          {/* <a className={styles.numItemsInBag}><span>4</span></a> */}
        </ul>
      </section>
    </div>
  );
}
export default Header;
