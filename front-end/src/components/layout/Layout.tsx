import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* -- MAIN CONTENT -- */}
      <main className="flex-1">{children}</main>
      {/* -- END CONTENT -- */}
      <Footer />
    </div>
  );
}
