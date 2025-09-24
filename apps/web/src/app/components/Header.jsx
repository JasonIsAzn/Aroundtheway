"use client";
import { getMe } from "@/lib/auth.client";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";

function Header() {
  const [logoSrc, setLogoSrc] = useState("/aroundthewayLogoA.png");

  const [me, setMe] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await getMe();
        if (!isMounted) return;

        setMe(data);
        setIsLoggedIn(!!data);
      } catch (err) {
        if (!isMounted) return;
        setMe(null);
        setIsLoggedIn(false);
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const loggedIn = !isLoadingUser && isLoggedIn;

  return (
    <div className={styles.container}>
      <a href="/">
        <img
          className={styles.image}
          src={logoSrc}
          alt="Aroundtheway Logo"
          onMouseEnter={() => setLogoSrc("/aroundthewayLogo.png")}
          onMouseLeave={() => setLogoSrc("/aroundthewayLogoA.png")}
        />
      </a>

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

          <li>
            <a href="/chat">CHAT</a>
          </li>
        </ul>
      </nav>

      {loggedIn ? (
        <section className={styles.navFooterContainer}>
          <ul className={styles.navFooter}>
            <li>
              <a href="/profile">ACCOUNT</a>
            </li>
            <li>
              <a href="/checkout">BAG</a>
            </li>
          </ul>
        </section>
      ) : (
        <section className={styles.navFooterContainer}>
          <ul className={styles.navFooter}>
            <li>
              <a href="/login">Login</a>
            </li>
            <li>
              <a href="/register">Register</a>
            </li>
            <li>
              <a href="/checkout">BAG</a>
            </li>
          </ul>
        </section>
      )}
    </div>
  );
}
export default Header;
