"use client";

import React, { useState, useContext, useEffect } from "react";
import Link from "next/link";
import styles from "@styles/header.module.css";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "@context/AuthContext";
import { Role } from "@types";
import { Language } from "@components/language/languageSelector";
import { useTranslations } from "use-intl";
import { ThemeSelector } from "@components/theme/themeSelector";
import UserService from "@services/UserService";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const context = useContext(AuthContext);
  if (!context) throw new Error("Header must be used within an AuthProvider");
  const { user, logout } = context;
  const t = useTranslations();
  const avatarSrc = user ? UserService.getAvatarUrl(user.username) : undefined;

  useEffect(() => {
    setImageError(false);
  }, [avatarSrc]);

  if (pathname.match(/^\/(.*\/)?admin/)) return null;

  const handleLogout = (event: React.MouseEvent) => {
    event.preventDefault();
    logout();
    setIsMenuOpen(false);
    router.push("/");
  };

  return (
    <header className={`${styles.header} relative`}>
      <div className={styles.pillContainer}>
        <Language />
        <ThemeSelector />
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={styles.pill}
        >

          {avatarSrc && !imageError ? (
            <img 
              src={avatarSrc} 
              alt='' 
              className="size-8 rounded-full" 
              onError={() => setImageError(true)} 
            />
          ) : (
            <div className={styles.userIconContainer}>
              <div className={styles.userHead}></div>
              <div className={styles.userBody}></div>
            </div>
          )}

          <span
            className={`${styles.pillText} ${
              user ? styles.userActive : styles.userInactive
            }`}
          >
            {user ? user.username : "---"}
          </span>
        </button>

        <div
          className={`${styles.sidebar} ${
            isMenuOpen ? styles.sidebarOpen : ""
          }`}
        >
          <div className={styles.sidebarContent}>
            <p className={styles.sidebarTitle}>
              {t("header.account-navigation.account-navigation")}
            </p>

            <div className={styles.linkGroup}>
              {(user?.role === Role.ADMIN || user?.role === Role.STAFF) && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={styles.sidebarLink}
                >
                  {t("header.account-navigation.admin-panel")}
                </Link>
              )}
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={styles.sidebarLink}
                >
                  {t("header.account-navigation.login")}
                </Link>
              )}
              {!user && (
                <Link
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className={styles.sidebarLink}
                >
                  {t("header.account-navigation.signup")}
                </Link>
              )}
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={styles.sidebarLink}
                >
                  My Profile
                </Link>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className={`${styles.sidebarLink} ${styles.logoutButton}`}
                >
                  {/* \u00A0 is an unbreakable space, because using a regular the browser automatically trims down double spaces */}
                  {`[→\u00A0\u00A0${t("header.account-navigation.logout")}`}
                </button>
              )}
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className={styles.overlay}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>

      <nav className={styles.nav}>
        <div className={styles.navImageContainer}>
          <Image
            src="/RideLogix.svg"
            alt="RideLogix Logo"
            width={160}
            height={160}
            priority
          />
        </div>
        <ul className={styles.navList}>
          <li className={styles.navElement}>
            <Link href="/" className={styles.navLink}>
              {t("header.default.home")}
            </Link>
          </li>
          <li className={styles.navElement}>
            <Link href="/attractions" className={styles.navLink}>
              {t("header.default.attractions")}
            </Link>
          </li>
          <li className={styles.navElement}>
            <Link href="/wait-times" className={styles.navLink}>
              {t("header.default.wait-times")}
            </Link>
          </li>
          <li className={styles.navElement}>
            <Link href="/vuln" className={styles.navLink}>
              Check User Information
            </Link>
          </li>
          <li className={styles.navElement}>
            <Link href="/vuln/url-validate" className={styles.navLink}>
              URL Validate
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
