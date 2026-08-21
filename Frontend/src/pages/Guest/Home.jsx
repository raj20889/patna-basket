// Home.jsx
import React, { useState, useEffect, Suspense } from "react";
import { useProducts } from "../../contexts/ProductsContext";
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import CustomerNavbar from "../../components/Navbar/CustomerNavbar";
import BannerComponent from "../../components/Shared/BannerComponent";
import QuickSearchChips from "../../components/Shared/QuickSearchChips";
import VirtualStoresSection from "../../components/Shared/VirtualStoresSection";
import CategoryGrid from "../../components/Shared/CategoryGrid";
import SplashScreen from "../../components/Shared/SplashScreen";
import Footer from "../../components/Shared/Footer";

// Lazy load heavy sections
const SubcategorySection = React.lazy(() => import("../../components/Customer/CustomerCategory/SubcategorySection"));
const Home = () => {
  const { products, homeSections, fetchProducts, fetchHomeSections } = useProducts();
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role") || "guest");
  const [showSplash, setShowSplash] = useState(
    () => sessionStorage.getItem("homeSplashShown") !== "true"
  );

  // Check auth status on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role") || "guest";
    setUserIsLoggedIn(!!token);
    setRole(userRole);
  }, []);

  // Load shared data without blocking the rest of the Home page.
  useEffect(() => {
    if (role !== "admin") {
      fetchProducts();
      fetchHomeSections();
    }
  }, [fetchHomeSections, fetchProducts, role]);

  useEffect(() => {
    if (!showSplash) return undefined;

    sessionStorage.setItem("homeSplashShown", "true");
    const timeoutId = window.setTimeout(() => setShowSplash(false), 800);
    return () => window.clearTimeout(timeoutId);
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div>
      {userIsLoggedIn ? (
        <CustomerNavbar />
      ) : (
        <PublicNavbar />
      )}
      {role !== "admin" && (
        <>
          <QuickSearchChips />
          <BannerComponent />
          <CategoryGrid />
          <VirtualStoresSection />

          <Suspense fallback={<div>Loading...</div>}>
            <SubcategorySection 
              products={products}
              sectionTitle="Dairy & Bread"
              subcategoryFilter="milk|bread|egg"
              navigatePath="dairy"
            />
            {homeSections.map((section) => (
              <SubcategorySection 
                key={section._id}
                products={products} 
                sectionTitle={section.title}
                subcategoryFilter={section.subcategoryFilter}
                navigatePath={section.categoryPath}
              />
            ))}
          </Suspense>
          <Footer />
        </>
      )}
    </div>
  );
};

export default Home;
