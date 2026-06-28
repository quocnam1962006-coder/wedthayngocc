/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  video?: string;
  approved: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  stock: number;
  images: string[];
  videoUrl?: string;
  rating: number;
  description: string;
  specifications: {
    material: string; // Chất liệu: Inox, Thép carbon, Cobalt...
    sharpness: string; // Độ bén: Siêu bén, bén lâu
    origin: string; // Xuất xứ: Nhật Bản, Đức, Hàn Quốc, Việt Nam
    warranty: string; // Bảo hành: 12 tháng, 24 tháng, trọn đời
    size: string; // Kích thước
    jawSize: string; // Kích thước mũi kềm (e.g. 14, 16)
  };
  usageGuide: string;
  reviews: Review[];
  isBestSeller?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  items: {
    productId: string;
    productName: string;
    productCode: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'COD' | 'Chuyển khoản' | 'QR Code' | 'Ví MoMo' | 'Ví ZaloPay' | 'Visa/Mastercard';
  status: 'processing' | 'packaging' | 'delivering' | 'received'; // Đang xử lý -> Đang đóng gói -> Đang giao -> Đã nhận
  date: string;
}

export interface Blog {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  date: string;
  slug: string;
  views: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedProducts?: { id: string; name: string; price: number; image: string }[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}
