import axios from 'axios';

export const addProduct = async (productData) => {
  const token = localStorage.getItem('token');

  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/products/add`,
    productData,
    {
      headers: {
        Authorization: `Bearer ${token}` // ✅ Correct format
      }
    }
  );

  return res.data;
};
