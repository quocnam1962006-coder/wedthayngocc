/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import CustomerSite from './components/CustomerSite';
import AdminDashboard from './components/AdminDashboard';
import AiChatbot from './components/AiChatbot';
import { INITIAL_PRODUCTS, INITIAL_BLOGS } from './data';
import { Product, Blog, Order, CartItem } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<'customer' | 'admin'>('customer');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [blogs, setBlogs] = useState<Blog[]>(INITIAL_BLOGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Sync orders from backend on mount
  useEffect(() => {
    fetch('/api/orders')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch initial orders');
      })
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.error(err);
        // Local state fallback if backend isn't ready
        setOrders([
          {
            id: 'HD8899',
            customerName: 'Nguyễn Văn Anh',
            phone: '0901234567',
            email: 'vananh@gmail.com',
            address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
            items: [
              {
                productId: 'prod-1',
                productName: 'Kềm Cắt Móng Cao Cấp K-18 Pro',
                productCode: 'K-18',
                price: 350000,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1607006342411-1a90d6e5a4a6?auto=format&fit=crop&q=80&w=800'
              }
            ],
            subtotal: 350000,
            discount: 0,
            shippingFee: 0,
            total: 350000,
            paymentMethod: 'COD',
            status: 'delivering',
            date: '2026-06-27'
          }
        ]);
      });
  }, []);

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const handleUpdateOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
  };

  const handleUpdateBlogs = (updatedBlogs: Blog[]) => {
    setBlogs(updatedBlogs);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      {activeView === 'customer' ? (
        <CustomerSite
          products={products}
          blogs={blogs}
          cartItems={cartItems}
          wishlist={wishlist}
          compareList={compareList}
          orders={orders}
          onUpdateCart={setCartItems}
          onUpdateWishlist={setWishlist}
          onUpdateCompare={setCompareList}
          onPlaceOrder={handlePlaceOrder}
          onToggleAdmin={() => setActiveView('admin')}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      ) : (
        <AdminDashboard
          products={products}
          orders={orders}
          blogs={blogs}
          onUpdateProducts={handleUpdateProducts}
          onUpdateOrders={handleUpdateOrders}
          onUpdateBlogs={handleUpdateBlogs}
          onClose={() => setActiveView('customer')}
          darkMode={darkMode}
        />
      )}

      {/* Floating ChatGPT-like Consultant Chatbot */}
      <AiChatbot
        darkMode={darkMode}
        onViewProduct={(productId) => {
          const matched = products.find((p) => p.id === productId);
          if (matched && activeView === 'customer') {
            // Trigger detailed view on the client site if desired
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      {/* Fast View-Switcher Overlay in margins to allow operators to quickly jump back and forth */}
      <div className="fixed bottom-6 left-6 z-40" id="global-view-switcher">
        <button
          onClick={() => setActiveView(activeView === 'customer' ? 'admin' : 'customer')}
          className="flex items-center space-x-1 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white px-3.5 py-2 rounded-full text-xs font-semibold shadow-xl transition-all hover:scale-105"
        >
          <span>Chuyển sang:</span>
          <strong className="text-blue-400 uppercase tracking-wider">
            {activeView === 'customer' ? 'Hệ thống Admin ⚙️' : 'Trang mua sắm 🛍️'}
          </strong>
        </button>
      </div>
    </div>
  );
}
