import { useEffect } from "react";
import { AuthModal } from "./components/AuthModal";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { QuickViewModal } from "./components/QuickViewModal";
import { btn } from "./components/ui";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import { Link, useRoute } from "./lib/router";
import { Admin } from "./pages/Admin";
import { Checkout } from "./pages/Checkout";
import { CourseDetails } from "./pages/CourseDetails";
import { Home } from "./pages/Home";
import { Instructor } from "./pages/Instructor";
import { Store } from "./pages/Store";

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-28 text-center">
      <p className="font-display text-7xl font-black text-brand">404</p>
      <h1 className="mt-4 font-display text-2xl font-extrabold">الصفحة غير موجودة</h1>
      <Link to="/" className={btn("primary", "lg", "mt-8")}>
        العودة للرئيسية
      </Link>
    </div>
  );
}

function Routes({ path }: { path: string }) {
  const [pathname, search = ""] = path.split("?");

  if (pathname === "/") return <Home />;
  if (pathname === "/instructor") return <Instructor />;
  if (pathname === "/checkout") return <Checkout />;
  if (pathname === "/admin") return <Admin />;
  if (pathname === "/courses") {
    const category = new URLSearchParams(search).get("cat") ?? "all";
    return <Store initialCategory={category} />;
  }
  if (pathname.startsWith("/courses/")) {
    return <CourseDetails slug={decodeURIComponent(pathname.slice("/courses/".length))} />;
  }
  return <NotFound />;
}

export default function App() {
  const path = useRoute();

  // العودة لأعلى الصفحة عند تغيير الصفحة
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [path]);

  return (
    <AuthProvider>
      <StoreProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes key={path} path={path} />
          </main>
          <Footer />
          <CartDrawer />
          <QuickViewModal />
          <AuthModal />
        </div>
      </StoreProvider>
    </AuthProvider>
  );
}
