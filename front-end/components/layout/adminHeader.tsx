"use client";

import Link from "next/link";
import styles from "@styles/header.module.css";
import Image from "next/image";
import { AuthContext } from "@context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Language } from "@components/language/languageSelector";
import { useTranslations } from "use-intl";
import { ThemeSelector } from "@components/theme/themeSelector";
import UserService from "@services/UserService";

export default function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const router = useRouter();
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("Header must be used within an AuthProvider");
  }
  const { user, logout } = context;
  const t = useTranslations();
  const avatarSrc = user ? UserService.getAvatarUrl(user.username) : undefined;

  useEffect(() => {
    setImageError(false);
  }, [avatarSrc]);

  const handleLogout = (event: React.MouseEvent) => {
    event.preventDefault();
    logout();
    router.push("/");
  };

  return (
    <header className={styles.header}>
      <div className={`${styles.pillContainer} !top-[1.8rem]`}>
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
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={styles.sidebarLink}
              >
                {t("header.account-navigation.leave-admin-panel")}
              </Link>

              {!user && (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={styles.sidebarLink}
                >
                  {t("header.account-navigation.login")}
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

      <nav className="bg-gradient-to-r from-[#133688] to-[#163086] rounded-none shadow-[1px_1px_3px_rgba(0,0,0,0.1)]">
        <div className={styles.navImageContainer}>
          <Image
            src="/RideLogix.svg"
            alt="RideLogix Logo"
            width={110}
            height={110}
            priority
          />
        </div>
        <h1 className="text-white font font-semibold text-center">
          {t("header.admin-panel.admin-panel")}
        </h1>
        <ul className={styles.navList}>
          <li className={styles.navElement}>
            <Link href="/admin" className={styles.navLink}>
              {t("header.admin-panel.home")}
            </Link>
          </li>
          <li className={styles.navElement}>
            <Link href="/admin/attractions-manager" className={styles.navLink}>
              {t("header.admin-panel.attraction-manager")}
            </Link>
          </li>
          <li className={styles.navElement}>
            <Link href="/admin/attraction-creation" className={styles.navLink}>
              {t("header.admin-panel.attraction-creation")}
            </Link>
          </li>
          <li className={styles.navElement}>
            <Link href="/admin/spare-parts-manager" className={styles.navLink}>
              {t("header.admin-panel.spare-part-manager")}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
