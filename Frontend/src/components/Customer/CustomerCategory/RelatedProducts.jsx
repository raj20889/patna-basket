// RelatedProducts.jsx
import React from "react";
import SubcategorySection from "./SubcategorySection";

const RelatedProducts = ({ products }) => {
  // Show Dairy & Bread section by filtering milk, bread, egg
  return (
    <SubcategorySection
      products={products}
      sectionTitle="Dairy & Bread"
      subcategoryFilter="milk|bread|egg"
      navigatePath="dairy"
    />
  );
};

export default RelatedProducts;
