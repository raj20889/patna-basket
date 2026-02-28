import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { useProducts } from "../../contexts/ProductsContext"; // Import useProducts

const WebSocketListener = () => {
  const { setProducts } = useProducts(); // Access setProducts from context

  useEffect(() => {
    if (!setProducts) {
      console.error("[Deployed] setProducts function is not available in ProductsContext");
      return;
    }

    const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");

    socket.on("connect", () => {
      console.log("[Deployed] WebSocket connected:", socket.id); // Debugging: Log WebSocket connection
    });

    // Update event name to match the backend
    socket.on("stockUpdate", (updatedProduct) => {
      console.log("[Deployed] Stock update event received:", updatedProduct); // Debugging: Log the received event
      setProducts((prevProducts) => {
        return prevProducts.map((product) =>
          product._id === updatedProduct.productId ? { ...product, stock: updatedProduct.stock } : product
        );
      });
    });

    return () => {
      console.log("[Deployed] WebSocket disconnected");
      socket.disconnect();
    };
  }, [setProducts]);

  return null;
};

export default WebSocketListener;