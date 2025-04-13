// src/components/ProductComponent.jsx
import React from 'react';

const ProductComponent = ({ products, onAddToCart }) => {
    return (
        <div className="grid grid-cols-3 gap-4 p-4">
            {products.map(product => (
                <div key={product._id} className="border p-4 rounded shadow-lg">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover mb-2" />
                    <h2 className="font-bold text-xl">{product.name}</h2>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <p className="text-lg font-semibold mt-2">₹{product.price}</p>
                 
                </div>
            ))}
        </div>
    );
};

export default ProductComponent;
