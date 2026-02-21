import Image from "next/image";
import { useRouter } from "next/router";

import beImg from "@/images/flags/belgium.svg";
import enImg from "@/images/flags/usa.svg";
import { useState } from "react";

const Language: React.FC = () => {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setIsDropdownOpen(false);
    const newLocale = lang === "en" ? "en" : "nl";
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <div>
      <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        {locale === "en" ? (
          <Image src={enImg} alt="English" width={30} height={30} />
        ) : (
          <Image src={beImg} alt="Dutch" width={30} height={30} />
        )}
      </button>
      {isDropdownOpen && (
        <div className="absolute top-14 right-2 bg-white p-2 border border-gray-300 rounded-md flex flex-col gap-2">
          <button className="flex items-center justify-between w-full gap-2 px-2 py-0.5 rounded hover:bg-slate-300" title="Change language to English" onClick={() => handleLanguageChange("en")}>
            <p className="">English</p>
            <Image src={enImg} alt="English" width={30} height={30} />
          </button>
          <button className="flex items-center justify-between w-full gap-2 px-2 py-0.5 rounded hover:bg-slate-300" title="Change language to Dutch" onClick={() => handleLanguageChange("nl")}>
            <p className="">Vlaams</p>
            <Image src={beImg} alt="Dutch" width={30} height={30} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Language;
