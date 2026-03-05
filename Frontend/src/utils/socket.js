import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL ); // Dynamically use the backend URL

socket.on("stockUpdate", (data) => {
  console.log("Stock update received:", data);
  // Dispatch an action to update the cart in Redux
  // This will be implemented in the Redux slice
});

export default socket;