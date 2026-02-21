import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/types";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { mutate } from "swr";
import LanguageSwitcher from "./LanguageSwitch";
import { useTranslation } from "react-i18next";

interface Props {
  mobile: boolean;
  closeMenu?: () => void;
}

export default function Navigation({ mobile, closeMenu }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const logout = () => {
    sessionStorage.removeItem("loggedInUser");
    mutate("ping", null, false);
    router.push("/");

    if (mobile && closeMenu) {
      closeMenu();
    }
  };

  return (
    <nav>
      <ul
        className={`flex justify-center text-xl text-white ${mobile ? "flex-col gap-2" : "hidden gap-8 lg:flex"}`}
      >
        {!user && (
          <li>
            <Link href="/" onClick={mobile ? closeMenu : undefined}>
              {t("navigation.home")}
            </Link>
          </li>
        )}

        {user && user.role === Role.ADMIN && (
          <li>
            <Link href="/admin/parser" onClick={mobile ? closeMenu : undefined}>
              {t("navigation.parser")}
            </Link>
          </li>
        )}

        {user && user.role === Role.ADMIN && (
          <li>
            <Link href="/attendance" onClick={mobile ? closeMenu : undefined}>
              {t("navigation.attendance")}
            </Link>
          </li>
        )}

        {user && user.role === Role.ADMIN && (
          <li>
            <Link
              href={{
                pathname: "/admin/events",
                query: { type: "Verderstudeerbeurs" },
              }}
              onClick={mobile ? closeMenu : undefined}
            >
              {t("navigation.verderstudeerbeurs")}
            </Link>
          </li>
        )}

        {user && user.role === Role.ADMIN && (
          <li>
            <Link
              href={{
                pathname: "/admin/events",
                query: { type: "Openlesdagen" },
              }}
              onClick={mobile ? closeMenu : undefined}
            >
              {t("navigation.openlesdagen")}
            </Link>
          </li>
        )}

        <LanguageSwitcher />

        {user && (
          <li>
            {mobile ? (
              <span
                className="cursor-pointer font-bold text-red-500 transition-all"
                onClick={logout}
              >
                {t("navigation.logout")}
              </span>
            ) : (
              <LogOut
                className="cursor-pointer transition-all hover:text-red-500"
                onClick={logout}
              />
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}
