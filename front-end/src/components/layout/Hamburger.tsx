interface Props {
  setMobileOpen: (open: boolean) => void;
  mobileOpen: boolean;
}

export default function Hamburger({ setMobileOpen, mobileOpen }: Props) {
  return (
    <div
      className={`${mobileOpen ? "fixed" : "absolute"} right-5 z-10 block w-8 cursor-pointer lg:hidden`}
      onClick={() => setMobileOpen(!mobileOpen)}
    >
      <span
        className={`mt-1 block h-1 w-full rounded-lg bg-white transition-all duration-300 ${
          mobileOpen ? "translate-y-2 rotate-45" : ""
        }`}
      ></span>
      <span
        className={`mt-1 block h-1 w-full rounded-lg bg-white transition-all duration-300 ${
          mobileOpen ? "opacity-0" : ""
        }`}
      ></span>
      <span
        className={`mt-1 block h-1 w-full rounded-lg bg-white transition-all duration-300 ${
          mobileOpen ? "-translate-y-2 -rotate-45" : ""
        }`}
      ></span>
    </div>
  );
}
