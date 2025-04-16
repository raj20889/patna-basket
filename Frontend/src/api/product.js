import axios from 'axios';

export const addProduct = async (productData) => {
  const token = localStorage.getItem('token');

  const res = await axios.post(
    'http://localhost:5000/api/products/add',
    productData,
    {
      headers: {
        Authorization: `Bearer ${token}` // ✅ Correct format
      }
    }
  );

  return res.data;
};
