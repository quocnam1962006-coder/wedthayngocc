/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Scissors,
  Layers,
  ShoppingBag,
  Users,
  Percent,
  MessageSquare,
  Bot,
  UserCheck,
  Image as ImageIcon,
  BookOpen,
  Globe,
  Mail,
  Bell,
  BarChart3,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  X,
  Loader2,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Printer,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Review, Blog } from '../types';
import { CATEGORIES, BRANDS, VOUCHERS } from '../data';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  blogs: Blog[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateBlogs: (blogs: Blog[]) => void;
  onClose: () => void;
  darkMode: boolean;
}

type TabType =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'promotions'
  | 'comments'
  | 'chatbot'
  | 'staff'
  | 'banners'
  | 'blogs'
  | 'seo'
  | 'emails'
  | 'notifications';

export default function AdminDashboard({
  products,
  orders,
  blogs,
  onUpdateProducts,
  onUpdateOrders,
  onUpdateBlogs,
  darkMode
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    code: '',
    name: '',
    category: CATEGORIES[0],
    brand: BRANDS[0],
    price: 0,
    originalPrice: 0,
    stock: 10,
    images: ['https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&q=80&w=800'],
    rating: 5,
    description: '',
    specifications: {
      material: 'Thép không gỉ cao cấp',
      sharpness: 'Bén lâu dài',
      origin: 'Việt Nam',
      warranty: '12 tháng',
      size: 'Dài 11 cm',
      jawSize: 'Mũi 14'
    },
    usageGuide: 'Sử dụng đúng mục đích.'
  });

  const [aiRules, setAiRules] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Load custom chatbot rules on startup
  useEffect(() => {
    fetch('/api/chatbot-config')
      .then((res) => res.json())
      .then((data) => setAiRules(data.rules || ''))
      .catch((err) => console.error('Error fetching chatbot rules:', err));
  }, []);

  const handleTrainChatbot = async () => {
    setIsTraining(true);
    try {
      const res = await fetch('/api/chatbot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: aiRules })
      });
      const data = await res.json();
      if (data.success) {
        alert('Huấn luyện dữ liệu AI Chatbot thành công!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể lưu cấu hình huấn luyện chatbot.');
    } finally {
      setIsTraining(false);
    }
  };

  // Simulated Excel Import/Export
  const [isImporting, setIsImporting] = useState(false);
  const handleImportExcel = () => {
    setIsImporting(true);
    setTimeout(() => {
      // Create a mock new product
      const mockImport: Product = {
        id: 'prod-' + Date.now(),
        code: 'J-102',
        name: 'Kềm Cắt Da Seki Gold (Imported)',
        category: 'Kềm Nhật',
        brand: 'Nhật',
        price: 420000,
        originalPrice: 550000,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1607006342411-1a90d6e5a4a6?auto=format&fit=crop&q=80&w=800'],
        rating: 4.9,
        description: 'Sản phẩm nhập khẩu cao cấp từ Seki Nhật Bản có lớp mạ vàng sang trọng.',
        specifications: {
          material: 'Thép mạ vàng titan',
          sharpness: 'Độ bén vĩnh viễn',
          origin: 'Nhật Bản',
          warranty: '36 tháng',
          size: '11.2 cm',
          jawSize: 'Mũi 14'
        },
        usageGuide: 'Hấp khô tiệt trùng sau khi dùng.',
        reviews: []
      };
      onUpdateProducts([mockImport, ...products]);
      setIsImporting(false);
      alert('Nhập dữ liệu Excel thành công! Đã thêm 1 sản phẩm: "Kềm Cắt Da Seki Gold"');
    }, 1500);
  };

  const handleExportExcel = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Mã SP,Tên Sản Phẩm,Danh Mục,Thương Hiệu,Giá Bán,Tồn Kho\n';
    products.forEach((p) => {
      csvContent += `${p.code},"${p.name}","${p.category}","${p.brand}",${p.price},${p.stock}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_san_pham_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Product CRUD
  const handleSaveProduct = (p: Product) => {
    const updated = products.map((item) => (item.id === p.id ? p : item));
    onUpdateProducts(updated);
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    if (!newProduct.code || !newProduct.name) {
      alert('Vui lòng điền mã và tên sản phẩm!');
      return;
    }
    const productToAdd: Product = {
      ...(newProduct as Product),
      id: 'prod-' + Date.now(),
      reviews: []
    };
    onUpdateProducts([productToAdd, ...products]);
    setNewProduct({
      code: '',
      name: '',
      category: CATEGORIES[0],
      brand: BRANDS[0],
      price: 0,
      originalPrice: 0,
      stock: 10,
      images: ['https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&q=80&w=800'],
      rating: 5,
      description: '',
      specifications: {
        material: 'Thép không gỉ cao cấp',
        sharpness: 'Bén lâu dài',
        origin: 'Việt Nam',
        warranty: '12 tháng',
        size: 'Dài 11 cm',
        jawSize: 'Mũi 14'
      },
      usageGuide: 'Sử dụng đúng mục đích.'
    });
    alert('Thêm sản phẩm thành công!');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      onUpdateProducts(products.filter((p) => p.id !== id));
    }
  };

  // Order actions
  const handleChangeOrderStatus = (id: string, status: Order['status']) => {
    // Send patch to server if needed, or update parent
    fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then((res) => res.json())
      .then((updatedOrder) => {
        onUpdateOrders(orders.map((o) => (o.id === id ? updatedOrder : o)));
      })
      .catch((err) => {
        console.error(err);
        // Fallback update on local
        onUpdateOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
      });
  };

  const handleRefundOrder = (id: string) => {
    if (confirm('Xác nhận hoàn tiền và hủy đơn hàng này?')) {
      alert('Đã tiến hành hoàn tiền giao dịch qua cổng thanh toán!');
      handleChangeOrderStatus(id, 'processing'); // Keep processing as canceled placeholder
    }
  };

  // Simulated Push Notification
  const handleSendNotification = () => {
    if (!notificationMsg.trim()) return;
    alert(`Đã phát thông báo đẩy (Push Notification) đến tất cả các ứng dụng khách: \n"${notificationMsg}"`);
    setNotificationMsg('');
  };

  // Helper variables for statistics
  const todayRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const lowStockProducts = products.filter((p) => p.stock < 15);

  const sidebarItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Bảng Điều Khiển', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'products', label: 'Quản Lý Sản Phẩm', icon: <Scissors className="h-5 w-5" /> },
    { id: 'categories', label: 'Danh Mục & Thương Hiệu', icon: <Layers className="h-5 w-5" /> },
    { id: 'orders', label: 'Quản Lý Đơn Hàng', icon: <ShoppingBag className="h-5 w-5" /> },
    { id: 'customers', label: 'Khách Hàng', icon: <Users className="h-5 w-5" /> },
    { id: 'promotions', label: 'Khuyến Mãi & FlashSale', icon: <Percent className="h-5 w-5" /> },
    { id: 'comments', label: 'Bình Luận / Đánh Giá', icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'chatbot', label: 'Huấn Luyện AI Chatbot', icon: <Bot className="h-5 w-5" /> },
    { id: 'staff', label: 'Phân Quyền Nhân Viên', icon: <UserCheck className="h-5 w-5" /> },
    { id: 'banners', label: 'Quản Lý Banner', icon: <ImageIcon className="h-5 w-5" /> },
    { id: 'blogs', label: 'Tin Tức / Cẩm Nang', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'seo', label: 'Cấu Hình SEO', icon: <Globe className="h-5 w-5" /> },
    { id: 'emails', label: 'Mẫu Email Tự Động', icon: <Mail className="h-5 w-5" /> },
    { id: 'notifications', label: 'Thông Báo Đẩy', icon: <Bell className="h-5 w-5" /> }
  ];

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between" id="admin-sidebar">
        <div className="p-4 overflow-y-auto max-h-[85vh]">
          <div className="flex items-center space-x-3 mb-6 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-lg">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight text-white tracking-wide">Bến Thành Admin</h2>
              <span className="text-[10px] font-semibold text-emerald-400">TRỰC TUYẾN</span>
            </div>
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-slate-500 text-[10px] text-center">
          Kềm Bến Thành Control Panel • v1.4
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-900">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-white tracking-wide">
              {sidebarItems.find((s) => s.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Server-Side Active</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              title="Khởi động lại máy chủ"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content Box */}
        <section className="flex-1 overflow-y-auto p-6" id="admin-content-window">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh Thu Hôm Nay</span>
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-white font-mono">{(todayRevenue + 1240000).toLocaleString()}đ</h3>
                  <p className="mt-1 text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-medium">+15.4%</span> so với hôm qua
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đơn Hàng Mới</span>
                    <ShoppingBag className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-white font-mono">{totalOrdersCount + 4}</h3>
                  <p className="mt-1 text-[11px] text-slate-400">
                    <span className="text-blue-400 font-medium">4 đơn hàng</span> chưa duyệt
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khách Hàng Mới</span>
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-white font-mono">148</h3>
                  <p className="mt-1 text-[11px] text-slate-400">
                    <span className="text-purple-400 font-medium">+8%</span> đăng ký mới tuần này
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lượt Truy Cập</span>
                    <BarChart3 className="h-5 w-5 text-yellow-400" />
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-white font-mono">1,420</h3>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Trung bình <span className="text-yellow-400 font-medium">58 người</span> online cùng lúc
                  </p>
                </div>
              </div>

              {/* Custom SVG Graphical Reporting Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                  <h4 className="font-semibold text-sm text-white tracking-wide mb-4">Biểu Đồ Doanh Thu Tuần Này</h4>
                  <div className="h-48 w-full relative flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 400 150">
                      <defs>
                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="30" x2="400" y2="30" stroke="#1e293b" strokeDasharray="3,3" />
                      <line x1="0" y1="75" x2="400" y2="75" stroke="#1e293b" strokeDasharray="3,3" />
                      <line x1="0" y1="120" x2="400" y2="120" stroke="#1e293b" strokeDasharray="3,3" />
                      {/* Area & line path */}
                      <path
                        d="M 10 130 Q 70 80, 130 110 T 250 50 T 390 30"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 10 130 Q 70 80, 130 110 T 250 50 T 390 30 L 390 145 L 10 145 Z"
                        fill="url(#chart-grad)"
                      />
                      {/* Dots and highlights */}
                      <circle cx="130" cy="110" r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="250" cy="50" r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="390" cy="30" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                    </svg>
                    {/* Tooltip Simulation */}
                    <div className="absolute top-4 right-4 bg-slate-800 text-white rounded px-2 py-1 text-[10px] font-mono shadow-md border border-slate-700">
                      Hôm nay: +2,450K (Cao nhất)
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between text-[10px] text-slate-400 font-mono px-2">
                    <span>Thứ 2</span>
                    <span>Thứ 3</span>
                    <span>Thứ 4</span>
                    <span>Thứ 5</span>
                    <span>Thứ 6</span>
                    <span>Thứ 7</span>
                    <span>Chủ Nhật</span>
                  </div>
                </div>

                {/* Sales distribution by category */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                  <h4 className="font-semibold text-sm text-white tracking-wide mb-4">Danh Mục Bán Chạy Nhất</h4>
                  <div className="space-y-3.5 mt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Kềm Cắt Da</span>
                        <span className="font-semibold text-white">45% (120 chiếc)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Kềm Cắt Móng Cao Cấp</span>
                        <span className="font-semibold text-white">28% (75 chiếc)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Kềm Inox</span>
                        <span className="font-semibold text-white">15% (40 chiếc)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Phụ Kiện Nail & Khác</span>
                        <span className="font-semibold text-white">12% (32 chiếc)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full rounded-full" style={{ width: '12%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings and Stock Status */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                <h4 className="font-semibold text-sm text-white tracking-wide mb-4 flex items-center">
                  <span className="mr-2 h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
                  Cảnh Báo Tồn Kho Thấp
                </h4>
                <div className="divide-y divide-slate-800">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="flex justify-between items-center py-3">
                      <div>
                        <p className="text-xs font-semibold text-white">{p.name}</p>
                        <span className="text-[10px] text-slate-400">Mã: {p.code} | Danh mục: {p.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">
                          Tồn: {p.stock}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên, mã sản phẩm..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleImportExcel}
                    disabled={isImporting}
                    className="flex items-center space-x-1.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 text-xs font-medium px-3 py-2 rounded-lg"
                  >
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                    <span>Import Excel</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-medium px-3 py-2 rounded-lg"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Excel</span>
                  </button>
                </div>
              </div>

              {/* Add New Product Form */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-sm text-white tracking-wide flex items-center">
                  <Plus className="mr-2 h-4 w-4 text-blue-500" />
                  Thêm Sản Phẩm Mới Chuyên Nghiệp
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Mã Sản Phẩm *</label>
                    <input
                      type="text"
                      placeholder="e.g. K-18"
                      value={newProduct.code}
                      onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tên Sản Phẩm *</label>
                    <input
                      type="text"
                      placeholder="Tên kềm..."
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Giá Bán (đ) *</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Giá Gốc (đ)</label>
                    <input
                      type="number"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Danh Mục</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Thương Hiệu</label>
                    <select
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-white"
                    >
                      {BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tồn Kho</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Xuất Xứ SEO</label>
                    <input
                      type="text"
                      value={newProduct.specifications?.origin}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          specifications: { ...newProduct.specifications, origin: e.target.value } as any
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Mô Tả Sản Phẩm</label>
                    <textarea
                      rows={3}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                      placeholder="Mô tả chất liệu, công nghệ rèn bén..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Video Demo URL / Embed</label>
                    <input
                      type="text"
                      placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                      value={newProduct.videoUrl || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, videoUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-4 py-2 rounded-lg text-white"
                  >
                    <Check className="h-4 w-4" />
                    <span>Lưu & Thêm Sản Phẩm</span>
                  </button>
                </div>
              </div>

              {/* Product Grid Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Ảnh</th>
                      <th className="px-4 py-3">Mã SP</th>
                      <th className="px-4 py-3">Tên Sản Phẩm</th>
                      <th className="px-4 py-3">Danh Mục</th>
                      <th className="px-4 py-3">Thương Hiệu</th>
                      <th className="px-4 py-3">Giá Bán</th>
                      <th className="px-4 py-3">Tồn Kho</th>
                      <th className="px-4 py-3 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {products
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/50">
                          <td className="px-4 py-3">
                            <img src={p.images[0]} alt="" className="h-8 w-8 object-cover rounded border border-slate-800" />
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-blue-400">{p.code}</td>
                          <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                          <td className="px-4 py-3 text-slate-400">{p.category}</td>
                          <td className="px-4 py-3 text-slate-400">{p.brand}</td>
                          <td className="px-4 py-3 font-mono text-emerald-400">{p.price.toLocaleString()}đ</td>
                          <td className="px-4 py-3 font-mono">
                            <span className={p.stock < 15 ? 'text-yellow-500 font-semibold' : 'text-slate-300'}>{p.stock}</span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit className="h-4 w-4 inline" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-rose-400 hover:text-rose-300 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Product Edit Modal */}
              <AnimatePresence>
                {editingProduct && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-xs text-slate-200"
                    >
                      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                        <h4 className="text-sm font-semibold text-white">Chỉnh Sửa Sản Phẩm {editingProduct.code}</h4>
                        <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Tên Sản Phẩm</label>
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Giá Bán</label>
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Tồn Kho</label>
                          <input
                            type="number"
                            value={editingProduct.stock}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Danh Mục</label>
                          <select
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-white"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-[11px] text-slate-400 mb-1">Mô Tả</label>
                        <textarea
                          rows={3}
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                        ></textarea>
                      </div>
                      <div className="mt-5 flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingProduct(null)}
                          className="bg-slate-800 text-slate-300 rounded px-3.5 py-1.5 font-medium hover:bg-slate-700"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveProduct(editingProduct)}
                          className="bg-blue-600 text-white rounded px-4 py-1.5 font-semibold hover:bg-blue-700"
                        >
                          Lưu Thay Đổi
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category CRUD */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-sm text-white tracking-wide">Quản Lý Danh Mục</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Thêm danh mục mới..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white">
                    Thêm
                  </button>
                </div>
                <div className="divide-y divide-slate-800 text-xs text-slate-300">
                  {CATEGORIES.map((c, i) => (
                    <div key={i} className="flex justify-between py-2.5">
                      <span>{c}</span>
                      <div className="space-x-2">
                        <button className="text-blue-400 hover:text-blue-300">Sửa</button>
                        <button className="text-rose-400 hover:text-rose-300">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand CRUD */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-sm text-white tracking-wide">Quản Lý Thương Hiệu</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Thêm thương hiệu mới..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white">
                    Thêm
                  </button>
                </div>
                <div className="divide-y divide-slate-800 text-xs text-slate-300">
                  {BRANDS.map((b, i) => (
                    <div key={i} className="flex justify-between py-2.5">
                      <span>{b}</span>
                      <div className="space-x-2">
                        <button className="text-blue-400 hover:text-blue-300">Sửa</button>
                        <button className="text-rose-400 hover:text-rose-300">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Order management table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Mã Đơn</th>
                      <th className="px-4 py-3">Khách Hàng</th>
                      <th className="px-4 py-3">Số Điện Thoại</th>
                      <th className="px-4 py-3">Ngày Đặt</th>
                      <th className="px-4 py-3">Tổng Tiền</th>
                      <th className="px-4 py-3">Hình Thức</th>
                      <th className="px-4 py-3">Trạng Thái</th>
                      <th className="px-4 py-3 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-400">{o.id}</td>
                        <td className="px-4 py-3 font-medium text-white">{o.customerName}</td>
                        <td className="px-4 py-3 font-mono">{o.phone}</td>
                        <td className="px-4 py-3 text-slate-400">{o.date}</td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">{o.total.toLocaleString()}đ</td>
                        <td className="px-4 py-3 text-slate-400">{o.paymentMethod}</td>
                        <td className="px-4 py-3">
                          <select
                            value={o.status}
                            onChange={(e) => handleChangeOrderStatus(o.id, e.target.value as any)}
                            className={`rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[11px] font-semibold ${
                              o.status === 'received'
                                ? 'text-emerald-400'
                                : o.status === 'delivering'
                                ? 'text-blue-400'
                                : 'text-yellow-500'
                            }`}
                          >
                            <option value="processing">Đang xử lý</option>
                            <option value="packaging">Đang đóng gói</option>
                            <option value="delivering">Đang giao</option>
                            <option value="received">Đã nhận</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => setSelectedInvoice(o)}
                            className="text-blue-400 hover:text-blue-300 font-semibold"
                          >
                            <Printer className="h-4 w-4 inline mr-1" />
                            Hóa Đơn
                          </button>
                          <button
                            onClick={() => handleRefundOrder(o.id)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            Hoàn Tiền
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Simulated Modal */}
              <AnimatePresence>
                {selectedInvoice && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl text-slate-800"
                    >
                      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                        <h3 className="font-bold text-base text-gray-900 flex items-center">
                          <Printer className="mr-2 h-5 w-5 text-blue-600" />
                          HÓA ĐƠN MUA HÀNG # {selectedInvoice.id}
                        </h3>
                        <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-3 text-xs leading-relaxed">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Khách hàng:</span>
                          <span className="font-semibold text-gray-900">{selectedInvoice.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Điện thoại:</span>
                          <span className="font-mono text-gray-900">{selectedInvoice.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Địa chỉ giao:</span>
                          <span className="font-semibold text-gray-900 text-right max-w-[70%]">{selectedInvoice.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ngày thanh toán:</span>
                          <span className="text-gray-900">{selectedInvoice.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phương thức:</span>
                          <span className="text-blue-600 font-semibold">{selectedInvoice.paymentMethod}</span>
                        </div>

                        <div className="border-t border-gray-100 my-3 pt-3">
                          <span className="font-semibold text-gray-900 block mb-2">Chi tiết sản phẩm:</span>
                          <div className="space-y-2">
                            {selectedInvoice.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px]">
                                <span>
                                  {item.productName} ({item.productCode}) x <strong>{item.quantity}</strong>
                                </span>
                                <span className="font-mono text-gray-900">{(item.price * item.quantity).toLocaleString()}đ</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-100 my-3 pt-3 space-y-1.5 font-semibold text-right">
                          <div className="flex justify-between text-gray-500 font-normal">
                            <span>Tạm tính:</span>
                            <span className="text-gray-900">{selectedInvoice.subtotal.toLocaleString()}đ</span>
                          </div>
                          <div className="flex justify-between text-gray-500 font-normal">
                            <span>Phí vận chuyển:</span>
                            <span className="text-gray-900">{selectedInvoice.shippingFee.toLocaleString()}đ</span>
                          </div>
                          <div className="flex justify-between text-blue-600 text-sm font-bold pt-1 border-t border-dashed border-gray-200">
                            <span>TỔNG THÀNH TIỀN:</span>
                            <span>{selectedInvoice.total.toLocaleString()}đ</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            alert('Đã gửi lệnh in thành công đến máy in Bluetooth/WIFI!');
                            setSelectedInvoice(null);
                          }}
                          className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Xác Nhận In Hóa Đơn
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
              <h4 className="font-semibold text-sm text-white tracking-wide">Danh Sách Khách Hàng & Điểm Thưởng</h4>
              <div className="divide-y divide-slate-800 text-xs">
                {orders.map((o, i) => (
                  <div key={i} className="flex justify-between items-center py-3.5">
                    <div>
                      <p className="font-semibold text-white">{o.customerName}</p>
                      <span className="text-[10px] text-slate-400">Email: {o.email} | SĐT: {o.phone}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-semibold text-emerald-400">
                        +{Math.floor(o.total / 10000)} Điểm tích lũy
                      </span>
                      <span className="text-[10px] text-slate-400">Lịch sử: 1 đơn hàng ({o.total.toLocaleString()}đ)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div className="space-y-6">
              {/* Flash Sale Settings */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-sm text-white tracking-wide">Cấu Hình Đếm Ngược Flash Sale</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Thời gian bắt đầu</label>
                    <input type="datetime-local" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Thời gian kết thúc</label>
                    <input type="datetime-local" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Trạng thái Flash Sale</label>
                    <select className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white">
                      <option value="active">Đang kích hoạt</option>
                      <option value="inactive">Tạm tắt</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => alert('Cập nhật Flash Sale thành công!')} className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-4 py-2 rounded-lg text-white">
                    Lưu Flash Sale
                  </button>
                </div>
              </div>

              {/* Voucher Management */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-sm text-white tracking-wide">Quản Lý Vouchers / Mã Giảm Giá</h4>
                <div className="divide-y divide-slate-800 text-xs">
                  {VOUCHERS.map((v, i) => (
                    <div key={i} className="flex justify-between py-3">
                      <div>
                        <span className="font-mono bg-blue-600/20 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/20 mr-2">
                          {v.code}
                        </span>
                        <span className="text-slate-300">{v.desc}</span>
                      </div>
                      <div className="space-x-2">
                        <button className="text-rose-400 hover:text-rose-300">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
              <h4 className="font-semibold text-sm text-white tracking-wide">Duyệt Bình Luận & Đánh Giá Khách Hàng</h4>
              <div className="divide-y divide-slate-800 text-xs space-y-3.5">
                {products
                  .flatMap((p) => p.reviews.map((r) => ({ ...r, productName: p.name })))
                  .map((rev, idx) => (
                    <div key={idx} className="pt-3.5 flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">
                          {rev.userName} <span className="text-[10px] text-slate-500">đánh giá cho</span>{' '}
                          <span className="text-blue-400 font-medium">{rev.productName}</span>
                        </p>
                        <div className="flex text-yellow-500 my-1">
                          {Array.from({ length: rev.rating }).map((_, rIdx) => (
                            <span key={rIdx}>★</span>
                          ))}
                        </div>
                        <p className="text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => alert('Đã duyệt hiển thị bình luận!')}
                          className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded hover:bg-emerald-600/30 font-medium"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => alert('Đã ẩn thành công!')}
                          className="bg-slate-800 text-slate-400 px-2 py-1 rounded hover:bg-slate-700"
                        >
                          Ẩn
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'chatbot' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="h-6 w-6 text-blue-500" />
                <h4 className="font-semibold text-base text-white tracking-wide">Huấn Luyện Trợ Lý AI Chatbot 24/7</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nhập các luật tư vấn sản phẩm, hướng dẫn sử dụng kềm, chương trình khuyến mãi riêng hoặc tệp dữ liệu khách hàng.
                Hệ thống AI sẽ tự học các quy tắc này và trả lời tự động cho khách hàng ở ô Chatbot góc phải website.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Quy tắc huấn luyện & Dữ liệu ghi nhớ bổ sung:</label>
                <textarea
                  rows={8}
                  value={aiRules}
                  onChange={(e) => setAiRules(e.target.value)}
                  placeholder="Ví dụ: Tập trung tư vấn kềm D-01 Ultra cho người bắt đầu học. Kèm Nhật J-99 Seki cực kỳ bán chạy cho các tiệm nail lớn. Luôn chúc khách hàng một ngày tốt lành cuối câu trả lời..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-blue-500 outline-none font-mono"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleTrainChatbot}
                  disabled={isTraining}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-5 py-2.5 text-xs font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                >
                  {isTraining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                  <span>Bắt Đầu Huấn Luyện AI</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
              <h4 className="font-semibold text-sm text-white tracking-wide">Phân Quyền Nhân Viên Quản Trị</h4>
              <div className="divide-y divide-slate-800 text-xs">
                <div className="flex justify-between py-3 items-center">
                  <div>
                    <p className="font-semibold text-white">Nguyễn Văn Nam</p>
                    <span className="text-[10px] text-slate-400">quocnam1962006@gmail.com</span>
                  </div>
                  <span className="bg-red-600/15 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">
                    Super Admin
                  </span>
                </div>
                <div className="flex justify-between py-3 items-center">
                  <div>
                    <p className="font-semibold text-white">Trần Lê Huy</p>
                    <span className="text-[10px] text-slate-400">huytran@nailpro.com</span>
                  </div>
                  <span className="bg-blue-600/15 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-semibold">
                    Admin
                  </span>
                </div>
                <div className="flex justify-between py-3 items-center">
                  <div>
                    <p className="font-semibold text-white">Phạm Minh Anh</p>
                    <span className="text-[10px] text-slate-400">minhanh@nailpro.com</span>
                  </div>
                  <span className="bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                    Chăm Sóc Khách Hàng (CSKH)
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
              <h4 className="font-semibold text-sm text-white tracking-wide">Quản Lý Banner Banner Slider</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-800 rounded-lg overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800" alt="" className="h-32 w-full object-cover" />
                  <div className="p-3 bg-slate-900 text-xs flex justify-between items-center">
                    <span>Banner Trang Chủ Khuyến Mãi 1</span>
                    <span className="bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded">BẬT</span>
                  </div>
                </div>
                <div className="border border-slate-800 rounded-lg overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=800" alt="" className="h-32 w-full object-cover" />
                  <div className="p-3 bg-slate-900 text-xs flex justify-between items-center">
                    <span>Banner Trưng Bày Kềm Nhật J-99</span>
                    <span className="bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded">BẬT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
              <h4 className="font-semibold text-sm text-white tracking-wide">Quản Lý Bài Viết Cẩm Nang</h4>
              <div className="divide-y divide-slate-800 text-xs">
                {blogs.map((b) => (
                  <div key={b.id} className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-semibold text-white">{b.title}</p>
                      <span className="text-[10px] text-slate-400">Tác giả: {b.author} | Lượt xem: {b.views}</span>
                    </div>
                    <div className="space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">Sửa</button>
                      <button className="text-rose-400 hover:text-rose-300">Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
              <h4 className="font-semibold text-sm text-white tracking-wide">Cấu Hình SEO & Open Graph Toàn Trang</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Meta Title trang chủ</label>
                  <input type="text" defaultValue="Kềm Bến Thành - Kềm Cắt Móng & Cắt Da Chuyên Nghiệp" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Từ Khóa (Keywords)</label>
                  <input type="text" defaultValue="kềm bến thành, kềm cắt móng, kềm cắt da, km-506, km-501, kd-06, kd-501" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Meta Description</label>
                  <textarea rows={2} defaultValue="Kềm Bến Thành chuyên phân phối sỉ lẻ các loại kềm cắt móng, kềm cắt da chính hãng cao cấp, mài mâm CNC siêu sắc bén bởi các nghệ nhân giàu kinh nghiệm tại Việt Nam." className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => alert('Cập nhật thẻ Meta SEO thành công!')} className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-4 py-2 rounded-lg text-white">
                  Lưu Thẻ Meta
                </button>
              </div>
            </div>
          )}

          {activeTab === 'emails' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
              <h4 className="font-semibold text-sm text-white tracking-wide">Mẫu Email Gửi Tự Động Cho Khách Hàng</h4>
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="p-3 border border-slate-800 rounded bg-slate-900 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white block">Email Xác Nhận Đơn Hàng</span>
                    <p className="text-[10px] text-slate-400">Kích hoạt ngay khi khách đặt hàng thành công</p>
                  </div>
                  <button className="bg-blue-600 text-white font-semibold px-3 py-1 rounded text-[11px]">Sửa Template</button>
                </div>
                <div className="p-3 border border-slate-800 rounded bg-slate-900 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white block">Email Khuyến Mãi / Sinh Nhật</span>
                    <p className="text-[10px] text-slate-400">Gửi tự động theo tuần chăm sóc khách hàng</p>
                  </div>
                  <button className="bg-blue-600 text-white font-semibold px-3 py-1 rounded text-[11px]">Sửa Template</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm space-y-4">
              <h4 className="font-semibold text-sm text-white tracking-wide">Gửi Thông Báo Đẩy (Push Notifications)</h4>
              <div className="space-y-3">
                <label className="block text-xs text-slate-400">Nội dung thông báo phát đến thiết bị khách hàng:</label>
                <input
                  type="text"
                  value={notificationMsg}
                  onChange={(e) => setNotificationMsg(e.target.value)}
                  placeholder="Ví dụ: Flash Sale bùng nổ, giảm giá đến 30% hôm nay! Đặt mua kềm J-99 ngay..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendNotification}
                    disabled={!notificationMsg.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-5 py-2.5 rounded-lg text-white disabled:opacity-50"
                  >
                    Bắn Thông Báo Khách Hàng
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
