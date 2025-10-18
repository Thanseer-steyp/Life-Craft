"use client";

import { usePathname } from "next/navigation";
import Header from "../screens/general/Header";
import Footer from "../screens/general/Footer";

export default function HeaderFooterWrapper({ children }) {
  const pathname = usePathname();

  // Routes where Header/Footer should be hidden
  const hiddenRoutes = ["/authentication", "/advisor-dashboard"];

  // Hide for exact matches + dynamic booking/[id]
  const shouldHide =
    hiddenRoutes.includes(pathname) || pathname.startsWith("/booking/");

  return (
    <>
      {!shouldHide && <Header />}
      {children}
      {!shouldHide && <Footer />}
    </>
  );
}
