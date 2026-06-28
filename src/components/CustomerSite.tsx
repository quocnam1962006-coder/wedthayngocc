/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  GitCompare,
  User,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  Check,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  Play,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Percent,
  CheckCircle2,
  Calendar,
  BookOpen,
  Info,
  ExternalLink,
  Lock,
  Moon,
  Sun,
  Shield,
  Settings,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, Order, Blog, Review } from '../types';
import { CATEGORIES, BRANDS, VOUCHERS } from '../data';

interface CustomerSiteProps {
  products: Product[];
  blogs: Blog[];
  cartItems: CartItem[];
  wishlist: string[];
  compareList: string[];
  orders: Order[];
  onUpdateCart: (items: CartItem[]) => void;
  onUpdateWishlist: (list: string[]) => void;
  onUpdateCompare: (list: string[]) => void;
  onPlaceOrder: (order: Order) => void;
  onToggleAdmin: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function CustomerSite({
  products,
  blogs,
  cartItems,
  wishlist,
  compareList,
  orders,
  onUpdateCart,
  onUpdateWishlist,
  onUpdateCompare,
  onPlaceOrder,
  onToggleAdmin,
  darkMode,
  onToggleDarkMode
}: CustomerSiteProps) {
  // Navigation tabs: 'home' | 'products' | 'promotions' | 'blogs' | 'guides' | 'contact' | 'profile' | 'cart' | 'checkout' | 'track'
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'promotions' | 'blogs' | 'guides' | 'contact' | 'profile' | 'cart' | 'checkout' | 'track'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedBrand, setSelectedBrand] = useState<string>('Tất cả');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);

  // Flash Sale Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  
  // Checkout States
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Chuyển khoản' | 'QR Code' | 'Ví MoMo' | 'Ví ZaloPay' | 'Visa/Mastercard'>('COD');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; type: string } | null>(null);
  const [voucherInput, setVoucherInput] = useState('');
  const [placedOrderInfo, setPlacedOrderInfo] = useState<Order | null>(null);

  // Review submission
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewImage, setNewReviewImage] = useState<string | null>(null);

  // Order tracking
  const [trackCode, setTrackCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Autocomplete search suggestions handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchSuggestions(filtered.slice(0, 5));
  }, [searchQuery, products]);

  // Flash Sale Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 }; // Loop demo timer
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, showConfirmation = true) => {
    const existing = cartItems.find((item) => item.product.id === product.id);
    if (existing) {
      onUpdateCart(
        cartItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      );
    } else {
      onUpdateCart([...cartItems, { product, quantity }]);
    }
    if (showConfirmation) {
      alert(`Đã thêm ${quantity} kềm "${product.name}" vào giỏ hàng thành công!`);
    }
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.product.id === productId) {
          const newQ = item.quantity + delta;
          return { ...item, quantity: newQ };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    onUpdateCart(updated);
  };

  const handleRemoveFromCart = (productId: string) => {
    onUpdateCart(cartItems.filter((item) => item.product.id !== productId));
  };

  // Voucher validation
  const handleApplyVoucher = () => {
    const found = VOUCHERS.find((v) => v.code.toUpperCase() === voucherInput.trim().toUpperCase());
    if (found) {
      const orderSubtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      if (orderSubtotal < found.minOrder) {
        alert(`Mã này yêu cầu đơn hàng tối thiểu từ ${found.minOrder.toLocaleString()}đ!`);
        return;
      }
      setAppliedVoucher(found);
      alert(`Đã áp dụng Voucher ${found.code} thành công!`);
    } else {
      alert('Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng!');
    }
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      onUpdateWishlist(wishlist.filter((id) => id !== productId));
    } else {
      onUpdateWishlist([...wishlist, productId]);
    }
  };

  // Compare List toggle
  const handleToggleCompare = (productId: string) => {
    if (compareList.includes(productId)) {
      onUpdateCompare(compareList.filter((id) => id !== productId));
    } else {
      if (compareList.length >= 4) {
        alert('Chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc!');
        return;
      }
      onUpdateCompare([...compareList, productId]);
      alert('Đã thêm sản phẩm vào bảng so sánh kỹ thuật!');
    }
  };

  // Place order
  const handlePlaceOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      alert('Vui lòng điền đầy đủ các trường thông tin nhận hàng bắt buộc!');
      return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingFee = subtotal >= 300000 ? 0 : 30000;
    let discount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.type === 'percent') {
        discount = subtotal * (appliedVoucher.discount / 100);
      } else {
        discount = appliedVoucher.discount;
      }
    }
    const total = subtotal + shippingFee - discount;

    const orderId = 'HD' + Math.floor(100000 + Math.random() * 900000);

    const newOrder: Order = {
      id: orderId,
      customerName: checkoutForm.name,
      phone: checkoutForm.phone,
      email: checkoutForm.email,
      address: checkoutForm.address,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productCode: item.product.code,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      })),
      subtotal,
      discount,
      shippingFee,
      total,
      paymentMethod,
      status: 'processing',
      date: new Date().toISOString().split('T')[0]
    };

    // Call server to persist
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    })
      .then((res) => res.json())
      .then((saved) => {
        onPlaceOrder(saved);
        setPlacedOrderInfo(saved);
        onUpdateCart([]);
        setCheckoutForm({ name: '', phone: '', email: '', address: '' });
        setAppliedVoucher(null);
        setVoucherInput('');
      })
      .catch((err) => {
        console.error(err);
        // Local fallback
        onPlaceOrder(newOrder);
        setPlacedOrderInfo(newOrder);
        onUpdateCart([]);
      });
  };

  // Dynamic search tracking
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchSuggestions(false);
    setActiveTab('products');
  };

  // Submit Product Review
  const handleSubmitReview = (productId: string) => {
    if (!newReviewComment.trim()) {
      alert('Vui lòng nhập nội dung nhận xét móng/kềm!');
      return;
    }
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      userName: 'Khách hàng ẩn danh',
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toISOString().split('T')[0],
      images: newReviewImage ? [newReviewImage] : undefined,
      approved: true
    };

    // Inject into selectedProduct state & update parent products list
    if (selectedProduct) {
      const updatedProduct = {
        ...selectedProduct,
        reviews: [newRev, ...selectedProduct.reviews]
      };
      setSelectedProduct(updatedProduct);

      // Find inside original products to update state
      const globalUpdated = products.map((p) => (p.id === productId ? updatedProduct : p));
      // Save globally
      products.forEach((p, idx) => {
        if (p.id === productId) products[idx] = updatedProduct;
      });
    }

    setNewReviewComment('');
    setNewReviewImage(null);
    alert('Cảm ơn bạn đã gửi đánh giá! Bình luận của bạn đã được duyệt xuất bản.');
  };

  // Order tracking search
  const handleTrackOrderSearch = () => {
    if (!trackCode.trim()) return;
    fetch('/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderCode: trackCode })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTrackedOrder(data.order);
        } else {
          alert('Không tìm thấy đơn hàng với mã này!');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Gặp sự cố khi kết nối tra cứu dữ liệu.');
      });
  };

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Tất cả' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'Tất cả' || p.brand === selectedBrand;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesBrand && matchesSearch;
  });

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-gray-950 text-slate-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Top contact bar matching screenshot 1 */}
      <div className="bg-[#2a2a2a] text-gray-300 text-xs py-2 border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-semibold">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center hover:text-white transition-colors">
              <span className="mr-1.5 text-blue-400 font-extrabold">f</span>
              <span>Kềm Bến Thành</span>
            </a>
            <a href="tel:0916188818" className="flex items-center hover:text-white transition-colors">
              <Phone className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
              <span>0916 18 88 18 - 0902 62 62 92</span>
            </a>
            <a href="mailto:KemBenThanh@PhucAnNail.com" className="flex items-center hover:text-white transition-colors">
              <span className="mr-1.5 text-blue-400">✉</span>
              <span>KemBenThanh@PhucAnNail.com</span>
            </a>
          </div>
          <div className="text-[11px] text-yellow-400 font-bold">
            Địa chỉ: 740 QL1A, Long An, Tây Ninh, Việt Nam
          </div>
        </div>
      </div>

      {/* Promotion strip */}
      <div className="bg-amber-600 text-white py-1 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center space-x-2">
        <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
        <span>Miễn phí giao hàng toàn quốc cho đơn hàng từ 300K! Đồng kiểm, thử bén trước khi thanh toán.</span>
      </div>

      {/* Main Top Header Navigation */}
      <header className={`sticky top-0 z-40 shadow-sm border-b transition-colors duration-200 ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md">
              <Star className="h-5 w-5 fill-current text-yellow-300" />
            </div>
            <div>
              <h1 className={`text-xl font-black tracking-tight leading-none ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Kềm <span className="text-amber-500">Bến Thành</span>
              </h1>
              <span className="text-[9px] font-bold text-gray-400 tracking-wider">CHẤT LƯỢNG TIÊU CHUẨN VÀNG</span>
            </div>
          </div>

          {/* Menubar */}
          <nav className="hidden md:flex items-center space-x-1.5 text-xs font-semibold">
            {[
              { id: 'home', label: 'Trang chủ' },
              { id: 'products', label: 'Sản phẩm' },
              { id: 'promotions', label: 'Khuyến mãi' },
              { id: 'blogs', label: 'Tin tức' },
              { id: 'guides', label: 'Hướng dẫn' },
              { id: 'contact', label: 'Liên hệ' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedCategory('Tất cả');
                  setSelectedBrand('Tất cả');
                }}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Search Box & Actions */}
          <div className="flex items-center space-x-4">
            {/* Custom Search Input with Autocomplete */}
            <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-64" id="header-search-form">
              <input
                type="text"
                placeholder="Tìm kềm cắt móng, thương hiệu..."
                value={searchQuery}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs rounded-full border px-4 py-2 pl-9 pr-4 outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-900'
                    : 'bg-slate-50 border-gray-200 text-gray-800 focus:bg-white'
                }`}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

              {/* Suggestions Overlay */}
              <AnimatePresence>
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute left-0 right-0 mt-2 rounded-xl shadow-xl border overflow-hidden text-xs ${
                      darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400">GỢI Ý SẢN PHẨM:</div>
                    {searchSuggestions.map((p) => (
                      <div
                        key={p.id}
                        onMouseDown={() => {
                          setSelectedProduct(p);
                        }}
                        className="p-2.5 flex items-center space-x-3 cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <img src={p.images[0]} alt="" className="h-7 w-7 object-cover rounded" />
                        <div>
                          <p className="font-semibold leading-none">{p.name}</p>
                          <span className="text-[10px] opacity-80">Mã: {p.code} | {p.price.toLocaleString()}đ</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Quick Track Order Action */}
            <button
              onClick={() => setActiveTab('track')}
              className={`hidden sm:flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Theo dõi đơn hàng</span>
            </button>

            {/* Compare Badge */}
            {compareList.length > 0 && (
              <button
                onClick={() => {
                  if (compareList.length < 2) {
                    alert('Vui lòng chọn thêm sản phẩm khác để so sánh kỹ thuật!');
                    return;
                  }
                  setSelectedProduct(null);
                  setActiveTab('products');
                  // Trigger scroll to comparative table
                  setTimeout(() => {
                    document.getElementById('compare-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500"
                title="So sánh kềm"
              >
                <GitCompare className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[9px] text-white flex items-center justify-center font-bold">
                  {compareList.length}
                </span>
              </button>
            )}

            {/* Wishlist Badge */}
            <button
              onClick={() => {
                setActiveTab('profile');
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-rose-500"
              title="Danh sách yêu thích"
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* Cart Badge */}
            <button
              onClick={() => setActiveTab('cart')}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500"
              title="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-[9px] text-white flex items-center justify-center font-bold animate-pulse">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300"
              title="Thay đổi giao diện"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Admin Backoffice switch button */}
            <button
              onClick={onToggleAdmin}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-white"
              title="Giao diện Quản trị viên"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="customer-main-window">
        {/* Selected Product Details Overlay Modal (Fidelity first) */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-4xl rounded-2xl shadow-2xl p-6 overflow-hidden border max-h-[90vh] overflow-y-auto ${
                  darkMode ? 'bg-gray-900 border-gray-800 text-slate-100' : 'bg-white border-gray-100 text-gray-800'
                }`}
                id="product-detail-modal"
              >
                {/* Close and Code */}
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3.5 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded">
                      MÃ SẢN PHẨM: {selectedProduct.code}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded ${selectedProduct.stock > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'}`}>
                      {selectedProduct.stock > 0 ? `Còn hàng (${selectedProduct.stock} chiếc)` : 'Hết hàng'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Product Media Gallery */}
                  <div className="space-y-4">
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                      <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    {selectedProduct.images.length > 1 && (
                      <div className="grid grid-cols-3 gap-2.5">
                        {selectedProduct.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer bg-slate-50 hover:border-blue-500"
                          >
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Embedded Video Demo Section */}
                    {selectedProduct.videoUrl && (
                      <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl space-y-2">
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center">
                          <Play className="h-4 w-4 mr-1.5 fill-current" /> Video Hướng Dẫn Kỹ Thuật Cắt Sát Da
                        </span>
                        <video controls className="w-full rounded-lg" src={selectedProduct.videoUrl} />
                      </div>
                    )}
                  </div>

                  {/* Right: Info and Pricing actions */}
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
                        {selectedProduct.category}
                      </span>
                      <h2 className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {selectedProduct.name}
                      </h2>
                      {/* Rating stars */}
                      <div className="flex items-center space-x-1.5 mt-2">
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(selectedProduct.rating) ? 'fill-current' : ''
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-500">({selectedProduct.rating} / 5.0)</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="p-4 bg-slate-100/60 dark:bg-gray-950 rounded-xl border border-gray-200/50 dark:border-gray-800/80">
                      <div className="flex items-baseline space-x-3">
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                          {selectedProduct.price.toLocaleString()}đ
                        </span>
                        {selectedProduct.originalPrice > selectedProduct.price && (
                          <span className="text-sm line-through text-gray-400">
                            {selectedProduct.originalPrice.toLocaleString()}đ
                          </span>
                        )}
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-extrabold uppercase">
                          TIẾT KIỆM {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Brief desc */}
                    <p className="text-xs text-gray-400 leading-relaxed">{selectedProduct.description}</p>

                    {/* Action buttons */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            handleAddToCart(selectedProduct, 1);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
                        >
                          Thêm giỏ hàng
                        </button>
                        <button
                          onClick={() => {
                            handleAddToCart(selectedProduct, 1, false);
                            setSelectedProduct(null);
                            setActiveTab('cart');
                          }}
                          className="w-full bg-slate-900 border border-slate-700 hover:bg-black text-white rounded-lg py-2.5 text-xs font-bold transition-all active:scale-95"
                        >
                          Mua ngay
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400 font-medium">
                        <button
                          onClick={() => handleToggleWishlist(selectedProduct.id)}
                          className="flex items-center justify-center space-x-1 border border-gray-200 dark:border-gray-800 rounded-lg py-2 hover:bg-slate-50 dark:hover:bg-gray-900"
                        >
                          <Heart className={`h-4 w-4 ${wishlist.includes(selectedProduct.id) ? 'fill-current text-rose-500' : ''}`} />
                          <span>{wishlist.includes(selectedProduct.id) ? 'Đã yêu thích' : 'Yêu thích'}</span>
                        </button>
                        <button
                          onClick={() => handleToggleCompare(selectedProduct.id)}
                          className="flex items-center justify-center space-x-1 border border-gray-200 dark:border-gray-800 rounded-lg py-2 hover:bg-slate-50 dark:hover:bg-gray-900"
                        >
                          <GitCompare className="h-4 w-4 text-blue-500" />
                          <span>So sánh kỹ thuật</span>
                        </button>
                      </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex items-center space-x-3.5 border-t border-gray-100 dark:border-gray-800 pt-4 text-[11px] text-gray-400">
                      <span>Chia sẻ ngay:</span>
                      <button
                        onClick={() => alert('Đã sao chép liên kết chia sẻ Facebook!')}
                        className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-2.5 py-1 rounded font-semibold"
                      >
                        Facebook
                      </button>
                      <button
                        onClick={() => alert('Đã sao chép liên kết chia sẻ Zalo!')}
                        className="bg-sky-600/10 hover:bg-sky-600/20 text-sky-600 px-2.5 py-1 rounded font-semibold"
                      >
                        Zalo
                      </button>
                    </div>

                    {/* Specs Technical Sheet */}
                    <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                      <h4 className="font-bold text-xs">Thông Số Kỹ Thuật Đúc Bản</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                        <div className="p-2.5 bg-slate-100/40 dark:bg-gray-950 rounded border border-gray-200/40 dark:border-gray-800">
                          <span className="block text-[10px] text-gray-400">Chất liệu:</span>
                          <span className="text-white font-semibold">{selectedProduct.specifications.material}</span>
                        </div>
                        <div className="p-2.5 bg-slate-100/40 dark:bg-gray-950 rounded border border-gray-200/40 dark:border-gray-800">
                          <span className="block text-[10px] text-gray-400">Độ sắc bén:</span>
                          <span className="text-white font-semibold">{selectedProduct.specifications.sharpness}</span>
                        </div>
                        <div className="p-2.5 bg-slate-100/40 dark:bg-gray-950 rounded border border-gray-200/40 dark:border-gray-800">
                          <span className="block text-[10px] text-gray-400">Xuất xứ chính gốc:</span>
                          <span className="text-white font-semibold">{selectedProduct.specifications.origin}</span>
                        </div>
                        <div className="p-2.5 bg-slate-100/40 dark:bg-gray-950 rounded border border-gray-200/40 dark:border-gray-800">
                          <span className="block text-[10px] text-gray-400">Kích thước mũi kềm:</span>
                          <span className="text-blue-500 font-bold">{selectedProduct.specifications.jawSize}</span>
                        </div>
                      </div>
                    </div>

                    {/* Usage Guide */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs flex items-center">
                        <Info className="h-4 w-4 mr-1 text-blue-500" /> Hướng Dẫn Sử Dụng & Bảo Quản
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed bg-slate-100/20 dark:bg-gray-950 border border-gray-200/30 p-3 rounded-lg">
                        {selectedProduct.usageGuide}
                      </p>
                    </div>

                    {/* Reviews section (With client-side insert simulation) */}
                    <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                      <h4 className="font-bold text-xs">Đánh Giá Từ Khách Hàng</h4>
                      {/* Review insert form */}
                      <div className="p-3 bg-slate-100/30 dark:bg-gray-950 border border-gray-200/50 rounded-xl space-y-3">
                        <span className="font-semibold text-xs text-slate-300">Viết đánh giá của bạn:</span>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button key={i} onClick={() => setNewReviewRating(i + 1)}>
                              <Star className={`h-4 w-4 ${i < newReviewRating ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={2}
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          placeholder="Kềm bén như thế nào? Cốt kềm chạy êm không..."
                          className="w-full text-xs bg-slate-100 dark:bg-gray-900 rounded p-2 text-white border border-gray-800"
                        />
                        {/* Mock image upload */}
                        <div className="flex justify-between items-center text-[11px]">
                          <button
                            onClick={() => setNewReviewImage('https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=150')}
                            className="text-blue-500 hover:underline"
                          >
                            📎 Thêm ảnh/video review
                          </button>
                          {newReviewImage && <span className="text-emerald-400 font-semibold">Đã tải lên 1 ảnh thành công!</span>}
                          <button
                            onClick={() => handleSubmitReview(selectedProduct.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded"
                          >
                            Gửi đánh giá
                          </button>
                        </div>
                      </div>

                      {/* Render active product reviews */}
                      <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
                        {selectedProduct.reviews.map((rev) => (
                          <div key={rev.id} className="pt-3 flex space-x-3 items-start">
                            <img
                              src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                              className="h-8 w-8 object-cover rounded-full"
                              alt=""
                            />
                            <div className="text-xs space-y-1">
                              <p className="font-bold">{rev.userName}</p>
                              <div className="flex text-yellow-500">
                                {Array.from({ length: rev.rating }).map((_, idx) => (
                                  <Star key={idx} className="h-3 w-3 fill-current" />
                                ))}
                              </div>
                              <p className="text-gray-400">{rev.comment}</p>
                              {rev.images && (
                                <img src={rev.images[0]} className="h-12 w-12 object-cover rounded mt-1.5 border border-gray-800" alt="" />
                              )}
                              <span className="text-[10px] text-gray-500 block">{rev.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab content switching */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Banner block */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white h-[380px] flex items-center p-8 sm:p-12 border border-amber-900/30 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-neutral-900/80 to-transparent z-10" />
              <img
                src="/src/assets/images/banner_kem_benthanh_1782619069684.jpg"
                className="absolute inset-0 h-full w-full object-cover opacity-60"
                alt="Banner Kềm Bến Thành"
              />
              <div className="relative z-20 max-w-lg space-y-4">
                <span className="bg-amber-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white shadow-sm">
                  KỀM BẾN THÀNH - CHẤT LƯỢNG TIÊU CHUẨN VÀNG
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Kềm Bến Thành <br/>
                  <span className="text-amber-400 font-black">Tinh Hoa Mỹ Nghệ Mài Kềm</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Được chế tác tỉ mỉ từ thép cao cấp bởi nghệ nhân lành nghề. Cốt kềm siêu êm, lưỡi mài mâm CNC bén ngọt lướt êm dịu, nâng tầm trải nghiệm làm nail chuyên nghiệp.
                </p>
                <div className="flex items-center space-x-4 pt-2">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    <span>Mua Ngay</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('guides')}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-colors"
                  >
                    Xem cẩm nang tỉ mỉ
                  </button>
                </div>
              </div>
            </div>

            {/* Flash Sale Banner with Countdown */}
            <div className="bg-gradient-to-r from-amber-500 to-rose-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 animate-bounce" />
                  <span className="font-extrabold text-sm tracking-widest uppercase">SIÊU FLASH SALE TRONG NGÀY</span>
                </div>
                <h3 className="text-xl font-bold">Giảm Giá Lên Đến 30% Mọi Dòng Kềm Inox & Cobalt Cao Cấp</h3>
              </div>
              {/* Timer clock */}
              <div className="flex items-center space-x-3 text-center">
                <div className="bg-slate-900/90 rounded-lg px-3.5 py-2">
                  <span className="block font-black text-lg font-mono leading-none text-yellow-300">{timeLeft.hours.toString().padStart(2, '0')}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Giờ</span>
                </div>
                <span className="font-bold text-lg">:</span>
                <div className="bg-slate-900/90 rounded-lg px-3.5 py-2">
                  <span className="block font-black text-lg font-mono leading-none text-yellow-300">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Phút</span>
                </div>
                <span className="font-bold text-lg">:</span>
                <div className="bg-slate-900/90 rounded-lg px-3.5 py-2">
                  <span className="block font-black text-lg font-mono leading-none text-yellow-300">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Giây</span>
                </div>
              </div>
            </div>

            {/* Product Category Filter Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-950'}`}>Danh Mục Kềm Pro</h2>
                  <p className="text-xs text-gray-400 mt-1">Lựa chọn kiểu dáng, chất liệu và thương hiệu chính gốc hàng đầu</p>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Categories Cards Layout Grid */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {CATEGORIES.map((cat, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5 }}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setActiveTab('products');
                    }}
                    className={`p-4 rounded-2xl border text-center cursor-pointer transition-colors ${
                      darkMode
                        ? 'bg-gray-900 border-gray-800 hover:border-blue-700 text-white'
                        : 'bg-white border-gray-200 hover:border-blue-500 text-slate-800'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                      <Star className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold block leading-snug">{cat}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bestselling Products */}
            <div className="space-y-4">
              <h2 className={`text-xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-950'}`}>Sản Phẩm Bán Chạy Nhất</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {products.slice(0, 4).map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -5 }}
                    className={`rounded-2xl border overflow-hidden relative shadow-sm ${
                      darkMode ? 'bg-gray-900 border-gray-800 text-slate-100' : 'bg-white border-gray-200 text-slate-800'
                    }`}
                  >
                    {/* Hot label */}
                    {p.isBestSeller && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10 tracking-widest uppercase">
                        BÁN CHẠY
                      </span>
                    )}

                    {/* Image block with hover zoom */}
                    <div
                      className="aspect-square bg-slate-50 overflow-hidden cursor-pointer relative group"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <img
                        src={p.images[0]}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="p-4 space-y-2">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">{p.category}</span>
                      <h4
                        onClick={() => setSelectedProduct(p)}
                        className={`font-bold text-xs truncate cursor-pointer hover:text-blue-500 transition-colors ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {p.name}
                      </h4>

                      {/* Pricing block */}
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs">
                          {p.price.toLocaleString()}đ
                        </span>
                        {p.originalPrice > p.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {p.originalPrice.toLocaleString()}đ
                          </span>
                        )}
                      </div>

                      {/* Rating summary */}
                      <div className="flex items-center text-[10px] text-yellow-500 space-x-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-gray-500">({p.rating})</span>
                      </div>

                      {/* Quick triggers */}
                      <div className="pt-2.5 grid grid-cols-2 gap-2 text-[10px] font-bold">
                        <button
                          onClick={() => handleAddToCart(p, 1)}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded py-1.5 transition-colors text-center"
                        >
                          Mua ngay
                        </button>
                        <button
                          onClick={() => handleToggleCompare(p.id)}
                          className={`border rounded py-1.5 transition-colors ${
                            compareList.includes(p.id)
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : 'border-gray-200 hover:bg-slate-50 text-gray-500'
                          }`}
                        >
                          {compareList.includes(p.id) ? 'Đang so sánh' : 'So sánh'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Why choose us banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Công nghệ mài mâm CNC siêu sắc bén</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Đảm bảo lưỡi cắt khít hoàn hảo từ mũi tới gót, không tơ da, không đau khóe. Lực cắt nhẹ tênh.
                </p>
              </div>
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Bảo hành chính hãng 12-36 tháng</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Bảo hành kẹt cốt rít, rỉ sét và hỗ trợ đổi mới nhanh chóng. Nhận kềm kiểm tra hài lòng mới trả tiền.
                </p>
              </div>
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Chất liệu Thép Nhật & Đức nhập khẩu</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Sử dụng inox chống gỉ 420 J2 hoặc thép cobalt siêu cứng tôi lạnh gấp 2 lần tăng tuổi thọ kềm chuyên nghiệp.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Catalog Filter Bar */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <div className="flex flex-wrap gap-2 text-xs">
                {['Tất cả', ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Brands select */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-400">Thương hiệu:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-slate-100 dark:bg-gray-800 text-white px-2.5 py-1.5 rounded border border-gray-800"
                >
                  <option value="Tất cả">Tất cả thương hiệu</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      Xuất xứ: {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border overflow-hidden relative shadow-sm ${
                    darkMode ? 'bg-gray-900 border-gray-800 text-slate-100' : 'bg-white border-gray-200'
                  }`}
                >
                  <div
                    className="aspect-square bg-slate-50 overflow-hidden cursor-pointer relative group"
                    onClick={() => setSelectedProduct(p)}
                  >
                    <img src={p.images[0]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">{p.category}</span>
                    <h4
                      onClick={() => setSelectedProduct(p)}
                      className="font-bold text-xs truncate cursor-pointer hover:text-blue-500 text-white"
                    >
                      {p.name}
                    </h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-blue-400">{p.price.toLocaleString()}đ</span>
                      <span className="text-[10px] text-gray-400">Xuất xứ: {p.brand}</span>
                    </div>

                    <div className="pt-2.5 grid grid-cols-2 gap-2 text-[10px] font-bold">
                      <button
                        onClick={() => handleAddToCart(p, 1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded py-1.5"
                      >
                        Thêm giỏ
                      </button>
                      <button
                        onClick={() => handleToggleCompare(p.id)}
                        className={`border rounded py-1.5 ${
                          compareList.includes(p.id)
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'border-gray-800 text-gray-400'
                        }`}
                      >
                        {compareList.includes(p.id) ? 'Bỏ so sánh' : 'So sánh'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparative Tech Table (if compareList has items) */}
            {compareList.length > 1 && (
              <div className="pt-10 border-t border-gray-800 space-y-4" id="compare-section">
                <div>
                  <h3 className="text-lg font-bold text-white">So Sánh Chi Tiết Lưỡi Kềm Kỹ Thuật</h3>
                  <p className="text-xs text-gray-400">Bảng chi tiết các đặc trưng độ bén, chất liệu thép và kích cỡ jaw</p>
                </div>
                <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden shadow-xl text-xs">
                  <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Đặc Tính Kỹ Thuật</th>
                        {compareList.map((id) => {
                          const cp = products.find((p) => p.id === id);
                          return (
                            <th key={id} className="px-4 py-3 font-semibold text-white">
                              {cp?.name} ({cp?.code})
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-400">Giá bán</td>
                        {compareList.map((id) => {
                          const cp = products.find((p) => p.id === id);
                          return (
                            <td key={id} className="px-4 py-3 font-mono text-emerald-400 font-bold">
                              {cp?.price.toLocaleString()}đ
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-400">Chất liệu</td>
                        {compareList.map((id) => {
                          const cp = products.find((p) => p.id === id);
                          return <td key={id} className="px-4 py-3">{cp?.specifications.material}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-400">Độ bén mài mâm</td>
                        {compareList.map((id) => {
                          const cp = products.find((p) => p.id === id);
                          return <td key={id} className="px-4 py-3">{cp?.specifications.sharpness}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-400">Xuất xứ nguyên chiếc</td>
                        {compareList.map((id) => {
                          const cp = products.find((p) => p.id === id);
                          return <td key={id} className="px-4 py-3 text-blue-400 font-semibold">{cp?.specifications.origin}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-400">Bảo hành</td>
                        {compareList.map((id) => {
                          const cp = products.find((p) => p.id === id);
                          return <td key={id} className="px-4 py-3">{cp?.specifications.warranty}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-400">Kích thước mũi jaw</td>
                        {compareList.map((id) => {
                          const cp = products.find((p) => p.id === id);
                          return <td key={id} className="px-4 py-3 font-bold text-yellow-500">{cp?.specifications.jawSize}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-400">Hành động</td>
                        {compareList.map((id) => {
                          const cp = products.find((p) => p.id === id);
                          return (
                            <td key={id} className="px-4 py-3">
                              <button
                                onClick={() => cp && handleAddToCart(cp, 1)}
                                className="bg-blue-600 hover:bg-blue-700 text-[10px] text-white px-3 py-1.5 rounded font-bold"
                              >
                                Thêm giỏ hàng
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Chương Trình Khuyến Mãi Flash Sale & Voucher Mùa Hè</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {VOUCHERS.map((v, i) => (
                <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono bg-blue-600 text-white font-extrabold px-3 py-1 rounded text-sm tracking-wide">
                      {v.code}
                    </span>
                    <span className="text-yellow-400 font-semibold">VOUCHERS</span>
                  </div>
                  <p className="text-slate-300 font-semibold">{v.desc}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(v.code);
                      alert(`Đã sao chép mã ${v.code} vào clipboard!`);
                    }}
                    className="w-full text-center py-2 bg-slate-800 rounded font-bold hover:bg-slate-700"
                  >
                    Sao chép mã
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Cẩm Nang Làm Nail & Bảo Quản Kềm</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogs.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBlog(b)}
                  className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <img src={b.image} className="h-44 w-full object-cover" alt="" />
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] text-gray-500 font-semibold">{b.date}</span>
                    <h3 className="font-bold text-xs text-white leading-snug line-clamp-2">{b.title}</h3>
                    <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed">{b.summary}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Read Blog Article Modal */}
            <AnimatePresence>
              {selectedBlog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-2xl rounded-2xl bg-gray-950 p-6 shadow-2xl border border-gray-800 max-h-[85vh] overflow-y-auto text-xs text-slate-300"
                  >
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
                      <span className="text-[10px] text-blue-500 font-bold uppercase">{selectedBlog.author}</span>
                      <button onClick={() => setSelectedBlog(null)} className="text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <img src={selectedBlog.image} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
                    <h3 className="font-bold text-base text-white mb-2 leading-tight">{selectedBlog.title}</h3>
                    <p className="text-slate-400 italic mb-4">"{selectedBlog.summary}"</p>
                    <div className="leading-relaxed space-y-3 whitespace-pre-line text-[11px]">
                      {selectedBlog.content}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'guides' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Cẩm Nang Sách Hướng Dẫn Sử Dụng & Mài Kềm</h2>
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
              <h3 className="font-bold text-sm text-white">Quy Trình Mài Kềm Mâm Công Nghệ Cao:</h3>
              <p>Tất cả sản phẩm kềm của chúng tôi đều được rèn dập nóng từ thép chống gỉ nguyên khối, sau đó được đưa vào tháp mài mâm CNC cân bằng điện tử. Quy trình mài mâm bảo đảm hai mặt má kềm ôm trọn nhau sát mép, góc hở móng từ 0.02mm, giúp thợ nail bóp cán là đứt da ngọt lịm không xơ xước da khóe.</p>
              <h3 className="font-bold text-sm text-white">Lưu Ý Quan Trọng Cho Thợ Nail Mới:</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Tuyệt đối không dùng kềm cắt da chuyên nghiệp để cắt móng tay chân cứng, kẽm, nhựa đắp móng giả.</li>
                <li>Không ngâm kềm quá lâu trong dung dịch axit hay nước muối sát trùng đậm đặc để bảo vệ lớp mạ tôi luyện.</li>
                <li>Hằng tuần nên vệ sinh sạch mạt móng ở cốt kềm, nhỏ dầu cốt máy may chuyên dụng bôi trơn cốt kềm giúp mở êm ái nhẹ nhàng.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Liên Hệ & Bản Đồ Cửa Hàng Kềm Bến Thành</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4 text-xs">
                <h4 className="font-bold text-sm text-white">CỬA HÀNG KỀM BẾN THÀNH</h4>
                <div className="space-y-2">
                  <p className="text-slate-300 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" /> Địa chỉ: 740 QL1A, Long An, Tây Ninh, Việt Nam
                  </p>
                  <p className="text-slate-300 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" /> Điện thoại: 0916 18 88 18 - 0902 62 62 92
                  </p>
                  <p className="text-slate-300 flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-emerald-400" /> Email: KemBenThanh@PhucAnNail.com
                  </p>
                </div>
                <div className="border-t border-gray-800 pt-4 flex space-x-3.5">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded text-center block">
                    Facebook Kềm Bến Thành
                  </a>
                  <a href="tel:0916188818" className="border border-gray-800 text-slate-300 px-4 py-2 rounded text-center block">
                    Gọi ngay
                  </a>
                </div>
              </div>

              {/* Styled Interactive Simulated Map Canvas */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900 h-64 relative overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 bg-slate-950 opacity-40 z-0" />
                {/* SVG styled grid lines mimicking navigation map coordinates */}
                <svg className="absolute inset-0 h-full w-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                <div className="relative z-10 space-y-3 p-6">
                  <div className="h-10 w-10 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <MapPin className="h-5 w-5 fill-current" />
                  </div>
                  <h5 className="font-bold text-white text-xs">Bản Đồ Kềm Bến Thành</h5>
                  <p className="text-[11px] text-gray-400 leading-snug">Vị trí: 740 QL1A, Long An, Tây Ninh, Việt Nam</p>
                  <button
                    onClick={() => alert('Đang mở vị trí Kềm Bến Thành tại Long An, Tây Ninh trên Google Maps...')}
                    className="text-[10px] text-blue-400 font-bold tracking-wider hover:underline flex items-center justify-center mx-auto"
                  >
                    Mở bằng Google Maps <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Hồ Sơ Thành Viên & Điểm Tích Lũy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Details card */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4 text-xs">
                <div className="flex items-center space-x-3.5">
                  <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    N
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Nguyễn Văn Nam</h4>
                    <span className="text-[10px] text-gray-500">Thành viên Bạc (Silver)</span>
                  </div>
                </div>
                <div className="space-y-2 text-slate-300">
                  <p><strong>Số điện thoại:</strong> 0916 18 88 18</p>
                  <p><strong>Email:</strong> quocnam1962006@gmail.com</p>
                  <p><strong>Địa chỉ lưu kho:</strong> 740 QL1A, Long An, Tây Ninh, Việt Nam</p>
                </div>
              </div>

              {/* Loyalty stats card */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4 text-xs text-center">
                <h4 className="font-bold text-white text-left">Quỹ Điểm Thưởng & Hạng Thẻ</h4>
                <div className="py-2">
                  <span className="block text-4xl font-black text-emerald-400 font-mono">1,250</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mt-1">Điểm tích lũy hiện có</span>
                </div>
                <p className="text-[10px] text-gray-400">Tích lũy thêm 250 điểm để nâng cấp lên hạng thẻ Vàng (Gold) nhận voucher giảm 20% tự động!</p>
              </div>

              {/* Wishlist item rendering */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4 text-xs">
                <h4 className="font-bold text-white flex items-center">
                  <Heart className="h-4 w-4 mr-1 text-rose-500 fill-current" /> Sản Phẩm Yêu Thích Của Bạn
                </h4>
                <div className="space-y-3 overflow-y-auto max-h-40">
                  {wishlist.length === 0 ? (
                    <p className="text-gray-500 italic">Chưa có sản phẩm yêu thích.</p>
                  ) : (
                    wishlist.map((id) => {
                      const wp = products.find((p) => p.id === id);
                      if (!wp) return null;
                      return (
                        <div key={id} className="flex justify-between items-center bg-gray-950 p-2 rounded">
                          <span className="font-semibold text-white truncate max-w-[60%]">{wp.name}</span>
                          <button
                            onClick={() => {
                              setSelectedProduct(wp);
                            }}
                            className="text-blue-400 hover:underline text-[10px] font-bold"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Placed orders list */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4 text-xs">
              <h4 className="font-bold text-white">Lịch Sử Đơn Hàng Gần Đây</h4>
              <div className="divide-y divide-gray-800">
                {orders.map((o) => (
                  <div key={o.id} className="flex justify-between items-center py-3.5">
                    <div>
                      <p className="font-semibold text-white">Đơn hàng # {o.id}</p>
                      <span className="text-[10px] text-slate-500">Đặt ngày: {o.date} | Thanh toán: {o.paymentMethod}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-emerald-400">{o.total.toLocaleString()}đ</span>
                      <span className="text-[10px] font-bold text-blue-400">{o.status === 'processing' ? 'Đang xử lý' : o.status === 'delivering' ? 'Đang giao' : 'Đã nhận'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Giỏ Hàng Của Bạn</h2>
            {cartItems.length === 0 ? (
              <div className="text-center p-12 bg-gray-900 border border-gray-800 rounded-2xl space-y-4">
                <p className="text-gray-500 italic">Giỏ hàng của bạn đang trống!</p>
                <button onClick={() => setActiveTab('products')} className="bg-blue-600 text-white font-bold px-4 py-2 rounded">
                  Tiếp Tục Mua Sắm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart items list table */}
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-2xl gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <img src={item.product.images[0]} className="h-16 w-16 object-cover rounded-xl" alt="" />
                        <div className="text-xs">
                          <h4 className="font-bold text-white leading-snug">{item.product.name}</h4>
                          <span className="text-[10px] text-gray-500">Mã: {item.product.code}</span>
                          <p className="font-mono text-emerald-400 font-bold mt-1">
                            {item.product.price.toLocaleString()}đ
                          </p>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center space-x-3 text-xs">
                        <button
                          onClick={() => handleUpdateCartQuantity(item.product.id, -1)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-bold text-sm w-4 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateCartQuantity(item.product.id, 1)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="p-1.5 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600/20 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Calculator & Voucher Summary */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4 text-xs">
                  <h4 className="font-bold text-white border-b border-gray-800 pb-2">Tóm Tắt Đơn Hàng</h4>
                  
                  {/* Voucher Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-gray-400">Mã giảm giá Voucher:</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. GIAM10"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        className="flex-1 bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-white"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {appliedVoucher && (
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        Đã áp dụng mã: {appliedVoucher.code} ({appliedVoucher.desc})
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-gray-800 pt-3 text-slate-300">
                    <div className="flex justify-between">
                      <span>Tạm tính hàng:</span>
                      <span className="font-mono text-white">
                        {cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString()}đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí giao hàng:</span>
                      <span className="font-mono text-white">
                        {cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) >= 300000 ? 'Miễn phí' : '30.000đ'}
                      </span>
                    </div>
                    {appliedVoucher && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Voucher giảm giá:</span>
                        <span className="font-mono">
                          -
                          {appliedVoucher.type === 'percent'
                            ? (
                                cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) *
                                (appliedVoucher.discount / 100)
                              ).toLocaleString()
                            : appliedVoucher.discount.toLocaleString()}
                          đ
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-sm text-blue-400 pt-2 border-t border-gray-800">
                      <span>Tổng thanh toán:</span>
                      <span className="font-mono">
                        {(
                          cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) +
                          (cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) >= 300000 ? 0 : 30000) -
                          (appliedVoucher
                            ? appliedVoucher.type === 'percent'
                              ? cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) *
                                (appliedVoucher.discount / 100)
                              : appliedVoucher.discount
                            : 0)
                        ).toLocaleString()}
                        đ
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('checkout')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-2.5 text-center transition-all"
                    >
                      Tiến Hành Thanh Toán
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="w-full text-center text-gray-400 hover:underline mt-2 text-[11px]"
                    >
                      Tiếp tục mua hàng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'checkout' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Thông Tin Giao Hàng & Thanh Toán</h2>
            
            {placedOrderInfo ? (
              <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-2xl space-y-4 max-w-lg mx-auto text-xs">
                <div className="h-12 w-12 bg-emerald-600/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">Đặt Hàng Thành Công!</h3>
                <p className="text-slate-300">
                  Cảm ơn anh/chị **{placedOrderInfo.customerName}**, đơn hàng **{placedOrderInfo.id}** của anh/chị đã được chuyển đến bộ phận kho đóng gói hỏa tốc.
                </p>
                <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl space-y-1.5 text-left text-[11px] leading-relaxed">
                  <p><strong>Mã tra cứu đơn:</strong> <span className="text-blue-400 font-bold">{placedOrderInfo.id}</span></p>
                  <p><strong>Địa chỉ nhận:</strong> {placedOrderInfo.address}</p>
                  <p><strong>Tổng thanh toán:</strong> {placedOrderInfo.total.toLocaleString()}đ (Vận chuyển: {placedOrderInfo.shippingFee > 0 ? '30k' : 'Miễn phí'})</p>
                  <p><strong>Hình thức:</strong> {placedOrderInfo.paymentMethod}</p>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button onClick={() => { setPlacedOrderInfo(null); setActiveTab('products'); }} className="w-full bg-blue-600 text-white rounded font-bold py-2">
                    Tiếp Tục Mua Kềm
                  </button>
                  <button onClick={() => { setPlacedOrderInfo(null); setTrackCode(placedOrderInfo.id); setActiveTab('track'); handleTrackOrderSearch(); }} className="w-full bg-slate-800 text-slate-300 rounded font-bold py-2">
                    Theo Dõi Đơn Hàng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrderSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs text-slate-300">
                {/* Form fields */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4">
                  <h4 className="font-bold text-sm text-white">Địa Chỉ Nhận Hàng</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Họ Tên Khách Hàng *</label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.name}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                        placeholder="Nhập tên người nhận kềm..."
                        className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Số Điện Thoại *</label>
                        <input
                          type="tel"
                          required
                          value={checkoutForm.phone}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                          placeholder="SĐT liên hệ giao..."
                          className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Địa chỉ Email</label>
                        <input
                          type="email"
                          value={checkoutForm.email}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                          placeholder="email@gmail.com"
                          className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Địa Chỉ Nhận Hàng Chi Tiết *</label>
                      <textarea
                        required
                        rows={2}
                        value={checkoutForm.address}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                        className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Gateway choice */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4">
                  <h4 className="font-bold text-sm text-white">Phương Thức Thanh Toán</h4>
                  <div className="space-y-2.5">
                    {[
                      { id: 'COD', label: 'Thanh toán khi nhận kềm (Ship COD)' },
                      { id: 'Chuyển khoản', label: 'Chuyển khoản ngân hàng trực tiếp' },
                      { id: 'QR Code', label: 'Quét QR Code ngân hàng (VietQR hỏa tốc)' },
                      { id: 'Ví MoMo', label: 'Ví điện tử MoMo' },
                      { id: 'Ví ZaloPay', label: 'Ví điện tử ZaloPay' },
                      { id: 'Visa/Mastercard', label: 'Thẻ Quốc tế Visa, Mastercard' }
                    ].map((gate) => (
                      <label
                        key={gate.id}
                        onClick={() => setPaymentMethod(gate.id as any)}
                        className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                          paymentMethod === gate.id
                            ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                            : 'bg-gray-950 border-gray-800 hover:bg-gray-900 text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === gate.id}
                          onChange={() => {}}
                          className="text-blue-600"
                        />
                        <span className="font-semibold text-xs text-white">{gate.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg py-3 text-center text-xs"
                    >
                      Xác Nhận Đặt Mua Kềm Ngay
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'track' && (
          <div className="space-y-6 max-w-xl mx-auto text-xs text-slate-300">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4">
              <h4 className="font-bold text-sm text-white text-center">Theo Dõi Trạng Thái Đơn Hàng Hỏa Tốc</h4>
              <p className="text-slate-400 leading-relaxed text-center">
                Nhập mã hóa đơn mua hàng của bạn (ví dụ: **HD8899**) để tra cứu vị trí vận chuyển và quá trình đóng gói kỹ thuật.
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Mã đơn hàng e.g. HD8899"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 font-mono text-center font-bold"
                />
                <button
                  onClick={handleTrackOrderSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Tra cứu
                </button>
              </div>
            </div>

            {/* Tracking Progression bar visualization */}
            {trackedOrder && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-6"
              >
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span>Khách hàng: <strong>{trackedOrder.customerName}</strong></span>
                  <span className="text-blue-400 font-mono">Đơn: <strong>{trackedOrder.id}</strong></span>
                </div>

                {/* Vertical progression timeline */}
                <div className="space-y-6 relative pl-6">
                  {/* Vertical bar line */}
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-800" />

                  {[
                    { key: 'processing', label: 'Đang xử lý', desc: 'Shop đang liên hệ xác minh thông tin đơn và gọi điện xác nhận' },
                    { key: 'packaging', label: 'Đang đóng gói', desc: 'Kềm đang được thợ lành nghề tra dầu bảo dưỡng, đóng nắp silicone bảo vệ' },
                    { key: 'delivering', label: 'Đang giao hàng', desc: 'Đơn hàng đã được bàn giao cho đối tác vận chuyển hỏa tốc GHTK' },
                    { key: 'received', label: 'Đã nhận', desc: 'Khách đã kiểm tra kềm ưng ý và thanh toán thành công đơn hàng' }
                  ].map((step, idx) => {
                    const statusIndex = ['processing', 'packaging', 'delivering', 'received'].indexOf(trackedOrder.status);
                    const isPassed = idx <= statusIndex;
                    return (
                      <div key={step.key} className="relative">
                        <div className={`absolute -left-[21px] h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${
                          isPassed
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-gray-950 border-gray-800 text-gray-500'
                        }`}>
                          {isPassed && <Check className="h-2.5 w-2.5" />}
                        </div>
                        <div className="pl-2">
                          <h5 className={`font-bold ${isPassed ? 'text-white' : 'text-gray-500'}`}>{step.label}</h5>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Footer Area */}
      <footer className={`border-t py-10 mt-16 transition-colors duration-200 ${
        darkMode ? 'bg-gray-950 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-3">
          <p className="font-bold text-slate-300 text-sm">© 2026 Kềm Bến Thành - Kềm Cắt Móng & Cắt Da Chuyên Nghiệp Hàng Đầu Việt Nam</p>
          <p className="text-gray-400">Địa chỉ cửa hàng: 740 QL1A, Long An, Tây Ninh, Việt Nam</p>
          <p className="text-gray-500 text-[11px]">Mỹ nghệ mài kềm bằng mâm CNC hoàn mỹ • Giữ nguyên độ sắc sảo từ bàn tay tinh hoa nghệ nhân</p>
        </div>
      </footer>
    </div>
  );
}
