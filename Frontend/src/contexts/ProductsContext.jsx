import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import axios from "axios";

const ProductsContext = createContext();
const HOME_SECTIONS_CACHE_TIME = 5 * 60 * 1000;
const PRODUCT_PAGE_SIZE = 20;

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [homeSections, setHomeSections] = useState([]);
  const [homeSectionsFetchedAt, setHomeSectionsFetchedAt] = useState(0);
  const productsRequest = useRef(null);
  const homeSectionsRequest = useRef(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchProducts = useCallback(async () => {
    if (products.length > 0) return products;
    if (productsRequest.current) return productsRequest.current;

    productsRequest.current = (async () => {
      try {
        const firstResponse = await axios.get(`${API_URL}/products`, {
          params: { page: 1, limit: PRODUCT_PAGE_SIZE },
        });

        if (Array.isArray(firstResponse.data)) {
          setProducts(firstResponse.data);
          return firstResponse.data;
        }

        const firstPage = firstResponse.data.products || [];
        setProducts(firstPage);
        const totalPages = firstResponse.data.totalPages || 1;
        let allProducts = firstPage;

        for (let page = 2; page <= totalPages; page += 1) {
          const response = await axios.get(`${API_URL}/products`, {
            params: { page, limit: PRODUCT_PAGE_SIZE },
          });
          allProducts = [...allProducts, ...(response.data.products || [])];
          setProducts(allProducts);
        }

        return allProducts;
      } catch (error) {
        console.error("Products fetch error:", error);
        return [];
      } finally {
        productsRequest.current = null;
      }
    })();

    return productsRequest.current;
  }, [API_URL, products]);

  const fetchHomeSections = useCallback(async () => {
    const isFresh = Date.now() - homeSectionsFetchedAt < HOME_SECTIONS_CACHE_TIME;
    if (homeSectionsFetchedAt > 0 && isFresh) return homeSections;
    if (homeSectionsRequest.current) return homeSectionsRequest.current;

    homeSectionsRequest.current = axios
      .get(`${API_URL}/home-sections`)
      .then((response) => {
        setHomeSections(response.data || []);
        setHomeSectionsFetchedAt(Date.now());
        return response.data || [];
      })
      .catch((error) => {
        console.error("Home sections fetch error:", error);
        return homeSections;
      })
      .finally(() => {
        homeSectionsRequest.current = null;
      });

    return homeSectionsRequest.current;
  }, [API_URL, homeSections, homeSectionsFetchedAt]);

  return (
    <ProductsContext.Provider value={{ products, setProducts, homeSections, fetchProducts, fetchHomeSections }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);