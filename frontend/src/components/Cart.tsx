import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/config';

interface Product {
  productId: number;
  name: string;
  price: number;
  imgName: string;
  unit: string;
}

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { darkMode } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);

  const hasItems = cartItems.length > 0;

  useEffect(() => {
    if (!hasItems) {
      setProducts([]);
      return;
    }
    axios
      .get<Product[]>(`${api.baseURL}${api.endpoints.products}`)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, [hasItems]);

  const getProduct = (productId: number) => products.find((p) => p.productId === productId);

  const subtotal = cartItems.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const shipping = cartItems.length > 0 ? 10 : 0;
  const grandTotal = subtotal + shipping;

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-5xl mx-auto">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-8 transition-colors duration-300`}
        >
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center py-24 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-16 w-16 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className={`text-xl font-medium ${darkMode ? 'text-light' : 'text-gray-700'} mb-4`}>
              Your cart is empty
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items Table */}
            <div className="flex-1">
              <div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}
              >
                <table className="w-full">
                  <thead>
                    <tr
                      className={`${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'} border-b text-sm uppercase`}
                    >
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => {
                      const product = getProduct(item.productId);
                      const lineTotal = product ? product.price * item.quantity : 0;
                      return (
                        <tr
                          key={item.productId}
                          className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b last:border-0`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {product && (
                                <img
                                  src={`/${product.imgName}`}
                                  alt={product.name}
                                  className={`w-14 h-14 object-contain rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-1`}
                                />
                              )}
                              <span
                                className={`font-medium ${darkMode ? 'text-light' : 'text-gray-800'}`}
                              >
                                {product ? product.name : `Product #${item.productId}`}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`px-4 py-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {product ? `$${product.price.toFixed(2)}` : '—'}
                          </td>
                          <td className="px-4 py-4">
                            <div
                              className={`flex items-center justify-center space-x-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1 w-28 mx-auto`}
                            >
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className={`w-7 h-7 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span
                                className={`min-w-[1.5rem] text-center ${darkMode ? 'text-light' : 'text-gray-800'}`}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className={`w-7 h-7 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-primary font-semibold">
                            ${lineTotal.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                              aria-label="Remove item"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-80">
              <div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 sticky top-24`}
              >
                <h2
                  className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-6`}
                >
                  Order Summary
                </h2>
                <div className="space-y-3">
                  <div
                    className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div
                    className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div
                    className={`flex justify-between font-bold text-lg pt-3 border-t ${darkMode ? 'border-gray-700 text-light' : 'border-gray-200 text-gray-800'}`}
                  >
                    <span>Grand Total</span>
                    <span className="text-primary">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  disabled
                  className="mt-6 w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed opacity-70"
                >
                  Proceed To Checkout (coming soon)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
