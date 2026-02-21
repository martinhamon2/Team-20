import Image from "next/image";
import { useRouter } from "next/router";

import beImg from "@/images/flags/belgium.svg";
import enImg from "@/images/flags/usa.svg";
import { useState } from "react";

const LanguageSide: React.FC = () => {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;

  const handleLanguageChange = (lang: string) => {
    const newLocale = lang === "en" ? "en" : "nl";
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <div className="w-full grid grid-cols-2 gap-0">
      <button className="flex items-center justify-center w-full gap-2 px-2 py-0.5 rounded-l border border-gray-200 hover:bg-slate-100" title="Change language to English" onClick={() => handleLanguageChange("en")}>
        <Image src={enImg} alt="English" width={25} height={25} className="rounded-sm" />
      </button>
      <button className="flex items-center justify-center w-full gap-2 px-2 py-0.5 rounded-r border border-gray-200 hover:bg-slate-100" title="Change language to Dutch" onClick={() => handleLanguageChange("nl")}>
        <Image src={beImg} alt="Dutch" width={25} height={25} className="rounded-sm" />
      </button>
    </div>
  );
};

export default LanguageSide;
