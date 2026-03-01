import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { useProducts } from "../../contexts/ProductsContext";

const WebSocketListener = () => {
  const { setProducts } = useProducts();

  useEffect(() => {
    console.log("WebSocketListener Mounted");

    if (!setProducts) {
      console.error("setProducts not available");
      return;
    }

    console.log("ENV VALUE:", import.meta.env.VITE_API_BASE_URL);

    const socket = io(import.meta.env.VITE_API_BASE_URL);

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
    });

    socket.on("stockUpdate", (updatedProduct) => {
      console.log("Stock update received:", updatedProduct);

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === updatedProduct.productId
            ? { ...product, stock: updatedProduct.stock }
            : product
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [setProducts]);

  return null;
};

export default WebSocketListener;