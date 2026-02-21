import { Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import i18next from "i18next";

interface LanguageSwitcherProps {
  setMobileOpen?: (open: boolean) => void;
}

export default function LanguageSwitcher({
  setMobileOpen,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const changeLanguage = (lng: string) => {
    i18next.changeLanguage(lng);
    setIsOpen(false);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const currentLangCode = (i18next.language || "nl").toUpperCase();

  return (
    <li className="relative">
      <button
        id="lang-menu"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center gap-1 text-white/90"
      >
        <Globe size={20} /> {currentLangCode}
        <ChevronDown size={16} strokeWidth={3} />
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-md bg-white py-1 text-base text-black shadow-md"
          aria-labelledby="lang-menu"
        >
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                changeLanguage("en");
              }}
              className="block px-4 py-1 underline transition-all hover:bg-blue-100"
            >
              English
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                changeLanguage("nl");
              }}
              className="block px-4 py-1 underline transition-all hover:bg-blue-100"
            >
              Nederlands
            </a>
          </li>
        </ul>
      )}
    </li>
  );
}
