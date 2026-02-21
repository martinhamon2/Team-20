"use client";

import styles from "@styles/header.module.css";
import { useRouter, usePathname } from 'next/navigation'; 
import { useLocale } from 'next-intl';

// had to change this a bit from the pwp version because next.js 15 useRouter doesnt support locale anymore
export const Language: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = event.target.value;
        router.replace(`/${newLocale}${pathname.replace(`/${locale}`, '') || '/'}`);
    };
    return (
        <select value={locale} onChange={handleLanguageChange} className={`${styles.pill} ${styles.pillText} ${styles.languagePill}`}>
          <option value="nl">NL</option>
          <option value="en">EN</option>
        </select>
    );
};