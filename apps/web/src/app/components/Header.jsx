"use client";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";



function Header() {
  const [logoSrc, setLogoSrc] = useState("/aroundthewayLogoA.png");
  const [me, setMe] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // initial load
    const user = loadUserFromStorage();
    setMe(user);
    setIsLoggedIn(!!user);
    setIsLoadingUser(false);

    // sync across tabs
    const onStorage = (e) => {
      if (e.key === "user") {
        const next = loadUserFromStorage();
        setMe(next);
        setIsLoggedIn(!!next);
      }
    };
    window.addEventListener("storage", onStorage);

    const onAuthChanged = () => {
      const next = loadUserFromStorage();
      setMe(next);
      setIsLoggedIn(!!next);
    };
    window.addEventListener("auth-changed", onAuthChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-changed", onAuthChanged);
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
              <a href="/login">LOGIN</a>
            </li>
            <li>
              <a href="/register">REGISTER</a>
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
