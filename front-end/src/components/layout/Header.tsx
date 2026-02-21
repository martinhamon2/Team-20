import { source_sans_3 } from "@/fonts";
import { Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Hamburger from "./Hamburger";
import Navigation from "./Navigation";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header
      className={`mb-8 bg-linear-to-b from-[#00407a] to-[rgb(0,25,70)] px-4 py-3 text-white ${source_sans_3.className}`}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-2.5">
        <div className="flex items-center gap-3">
          <a href="https://www.kuleuven.be/english/">
            <Image
              alt="logo-kuleuven"
              src="https://stijl.kuleuven.be/releases/latest/img/svg/logo.svg"
              width="120"
              height="120"
            />
          </a>
          <a href="https://www.kuleuven.be/600years/?lang=en">
            <Image
              alt="logo-600"
              src="https://stijl.kuleuven.be/releases/600a/img/600/logo-600-white.png"
              width="80"
              height="80"
            />
          </a>
        </div>

        <Navigation mobile={false} />

        <Hamburger setMobileOpen={setMobileOpen} mobileOpen={mobileOpen} />

        <aside
          className={`bg-primary fixed top-0 right-0 z-10 flex h-full w-96 transform flex-col justify-center gap-6 overflow-y-auto px-8 py-6 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Search Form */}
          <form
            role="search"
            action="https://icts.kuleuven.be/apps/searchredirector"
            method="get"
            name="kuleuven-searchform"
            className="flex w-full items-center rounded bg-white/10"
          >
            <input
              type="text"
              placeholder="Search"
              name="k"
              id="words"
              className="w-full bg-transparent px-4 py-2 text-sm text-white/95 placeholder-white/85 outline-none"
            />
            <button type="submit" className="p-1">
              <Search />
            </button>
          </form>

          {/* Main Navigation */}
          <Navigation mobile closeMenu={closeMobileMenu} />

          {/* Social Links */}
          <div>
            <p className="mb-2 text-sm text-white/70">
              Follow KU&nbsp;Leuven on
            </p>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="https://www.facebook.com/KULeuven/">
                <svg
                  role="img"
                  width="30"
                  height="30"
                  viewBox="0 0 1792 1792"
                  fill="white"
                >
                  <title>facebook</title>
                  <path d="M1376 128q119 0 203.5 84.5T1664 416v960q0 119-84.5 203.5T1376 1664h-188v-595h199l30-232h-229V689q0-56 23.5-84t91.5-28l122-1V369q-63-9-178-9-136 0-217.5 80T948 666v171H748v232h200v595H416q-119 0-203.5-84.5T128 1376V416q0-119 84.5-203.5T416 128h960z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/kuleuven/">
                <svg
                  role="img"
                  width="30"
                  height="30"
                  viewBox="0 0 1792 1792"
                  fill="white"
                >
                  <title>instagram</title>
                  <path d="M1490 1426V778h-135q20 63 20 131 0 126-64 232.5T1137 1310t-240 62q-197 0-337-135.5T420 909q0-68 20-131H299v648q0 26 17.5 43.5T360 1487h1069q25 0 43-17.5t18-43.5zm-284-533q0-124-90.5-211.5T897 594q-127 0-217.5 87.5T589 893t90.5 211.5T897 1192q128 0 218.5-87.5T1206 893zm284-360V368q0-28-20-48.5t-49-20.5h-174q-29 0-49 20.5t-20 48.5v165q0 29 20 49t49 20h174q29 0 49-20t20-49zm174-208v1142q0 81-58 139t-139 58H325q-81 0-139-58t-58-139V325q0-81 58-139t139-58h1142q81 0 139 58t58 139z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/school/ku_leuven/">
                <svg
                  role="img"
                  width="30"
                  height="30"
                  viewBox="0 0 1792 1792"
                  fill="white"
                >
                  <title>linkedin</title>
                  <path d="M365 1414h231V720H365v694zm246-908q-1-52-36-86t-93-34-94.5 34-36.5 86q0 51 35.5 85.5T479 626h1q59 0 95-34.5t36-85.5zm585 908h231v-398q0-154-73-233t-193-79q-136 0-209 117h2V720H723q3 66 0 694h231v-388q0-38 7-56 15-35 45-59.5t74-24.5q116 0 116 157v371zm468-998v960q0 119-84.5 203.5T1376 1664H416q-119 0-203.5-84.5T128 1376V416q0-119 84.5-203.5T416 128h960q119 0 203.5 84.5T1664 416z" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/user/kuleuven/">
                <svg
                  role="img"
                  width="30"
                  height="30"
                  viewBox="0 0 1792 1792"
                  fill="white"
                >
                  <title>youtube</title>
                  <path d="M1047 1303v-157q0-50-29-50-17 0-33 16v224q16 16 33 16 29 0 29-49zm184-122h66v-34q0-51-33-51t-33 51v34zM660 915v70h-80v423h-74V985h-78v-70h232zm201 126v367h-67v-40q-39 45-76 45-33 0-42-28-6-16-6-54v-290h66v270q0 24 1 26 1 15 15 15 20 0 42-31v-280h67zm252 111v146q0 52-7 73-12 42-53 42-35 0-68-41v36h-67V915h67v161q32-40 68-40 41 0 53 42 7 21 7 74zm251 129v9q0 29-2 43-3 22-15 40-27 40-80 40-52 0-81-38-21-27-21-86v-129q0-59 20-86 29-38 80-38t78 38q21 28 21 86v76h-133v65q0 51 34 51 24 0 30-26 0-1 .5-7t.5-16.5V1281h68zM913 457v156q0 51-32 51t-32-51V457q0-52 32-52t32 52zm533 713q0-177-19-260-10-44-43-73.5t-76-34.5q-136-15-412-15-275 0-411 15-44 5-76.5 34.5T366 910q-20 87-20 260 0 176 20 260 10 43 42.5 73t75.5 35q137 15 412 15t412-15q43-5 75.5-35t42.5-73q20-84 20-260zM691 519l90-296h-75l-51 195-53-195h-78l24 69 23 69q35 103 46 158v201h74V519zm289 81V470q0-58-21-87-29-38-78-38-51 0-78 38-21 29-21 87v130q0 58 21 87 27 38 78 38 49 0 78-38 21-27 21-87zm181 120h67V350h-67v283q-22 31-42 31-15 0-16-16-1-2-1-26V350h-67v293q0 37 6 55 11 27 43 27 36 0 77-45v40zm503-304v960q0 119-84.5 203.5T1376 1664H416q-119 0-203.5-84.5T128 1376V416q0-119 84.5-203.5T416 128h960q119 0 203.5 84.5T1664 416z" />
                </svg>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
