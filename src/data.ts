/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Blog, FAQ } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'KM-506',
    name: 'Kềm cắt móng KM-506',
    category: 'Kềm cắt móng',
    brand: 'Kềm Bến Thành',
    price: 150000,
    originalPrice: 195000,
    stock: 50,
    images: [
      '/src/assets/images/kem_km506_1782618608126.jpg'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    rating: 4.8,
    description: 'Kềm cắt móng chuyên nghiệp KM-506 được chế tác tỉ mỉ từ thép không gỉ cao cấp sáng bóng. Lưỡi cắt mài bén thủ công cực tinh xảo, cốt kềm siêu êm lách mượt giúp tạo đường cắt chuẩn xác tuyệt đối mà không cần dùng nhiều lực.',
    specifications: {
      material: 'Thép không gỉ cao cấp (Inox cao cấp)',
      sharpness: 'Bén ngọt vượt trội, mài tay tinh xảo bởi nghệ nhân lành nghề',
      origin: 'Kềm Bến Thành - Việt Nam',
      warranty: '12 tháng chính hãng (Hỗ trợ đổi mới cốt kềm trong 7 ngày)',
      size: 'Dài 11.2 cm, Rộng 4.8 cm',
      jawSize: 'Mũi 16 (6.5mm)'
    },
    usageGuide: 'Sử dụng chuyên để cắt tỉa móng tay, móng chân dày gọn gàng. Sau khi dùng, lau sạch bụi bẩn bằng cồn sát khuẩn, bôi mỡ cốt kềm định kỳ và bảo quản nơi khô ráo thoáng mát.',
    reviews: [
      {
        id: 'rev-1',
        userName: 'Hồng Hạnh (Nail Salon)',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        comment: 'Kềm KM-506 bén vô cùng, cốt chạy cực kỳ mượt và êm ái. Rất thích hợp làm dịch vụ.',
        date: '2026-06-25',
        approved: true
      }
    ],
    isBestSeller: true,
    isNew: true
  },
  {
    id: 'prod-2',
    code: 'KM-501',
    name: 'Kềm cắt móng KM-501',
    category: 'Kềm cắt móng',
    brand: 'Kềm Bến Thành',
    price: 180000,
    originalPrice: 240000,
    stock: 45,
    images: [
      '/src/assets/images/kem_km501_1782618622726.jpg'
    ],
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    rating: 4.9,
    description: 'Phiên bản Kềm cắt móng KM-501 cao cấp sở hữu nước mạ vàng sang trọng cùng chất liệu thép tôi đặc biệt chống mài mòn cao. Thiết kế công thái học hoàn mĩ giúp người thợ nail thao tác dễ dàng mà không mỏi tay.',
    specifications: {
      material: 'Hợp kim thép tôi luyện phủ mạ vàng gold cao cấp',
      sharpness: 'Lưỡi cắt khít hoàn hảo từ mũi tới gót, sắc bén lâu dài',
      origin: 'Kềm Bến Thành - Việt Nam',
      warranty: '18 tháng bảo hành kỹ thuật chính hãng',
      size: 'Dài 11.4 cm, Rộng 5.0 cm',
      jawSize: 'Mũi 14 (5.5mm)'
    },
    usageGuide: 'Dành cho thợ nail chuyên nghiệp cắt tỉa móng dứt khoát. Tránh rơi kềm hoặc tác động lực mạnh vào bề mặt gạch đá gây mẻ lưỡi.',
    reviews: [
      {
        id: 'rev-2',
        userName: 'Lê Thảo Vy',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        comment: 'Nhìn bên ngoài siêu sang xịn luôn ạ. Lưỡi kềm bén ngọt lách móng cực chuẩn.',
        date: '2026-06-26',
        approved: true
      }
    ],
    isBestSeller: true,
    isNew: false
  },
  {
    id: 'prod-3',
    code: 'KD-06',
    name: 'Kềm cắt da KD-06',
    category: 'Kềm cắt da',
    brand: 'Kềm Bến Thành',
    price: 160000,
    originalPrice: 210000,
    stock: 35,
    images: [
      '/src/assets/images/kem_kd06_1782618637192.jpg'
    ],
    rating: 4.7,
    description: 'Dòng Kềm cắt da KD-06 huyền thoại chuyên dụng cho thao tác lấy khóe móng và cắt bỏ biểu bì thừa quanh móng tay móng chân. Lưỡi kềm siêu mảnh và sắc sảo, giúp thợ nail đi sâu lách khóe êm ái không đau rát.',
    specifications: {
      material: 'Thép không gỉ Inox chất lượng cao chuyên nghiệp',
      sharpness: 'Công nghệ mài mâm CNC siêu mỏng cực sắc bén',
      origin: 'Kềm Bến Thành - Việt Nam',
      warranty: '12 tháng chống rỉ sét chính hãng',
      size: 'Dài 11.0 cm, Rộng 4.7 cm',
      jawSize: 'Mũi 14 (5.5mm)'
    },
    usageGuide: 'Sử dụng để làm sạch da quanh viền móng. Nên ngâm tay chân trong nước ấm làm mềm da trước khi cắt da thừa.',
    reviews: [
      {
        id: 'rev-3',
        userName: 'Minh Thư (Nail Artist)',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        comment: 'Bén lắm nha, đi khóe sâu cực ngọt, lưỡi mảnh vừa vặn dễ nhặt da chết cực kỳ.',
        date: '2026-06-24',
        approved: true
      }
    ],
    isBestSeller: false,
    isNew: true
  },
  {
    id: 'prod-4',
    code: 'KD-501',
    name: 'Kềm cắt da KD-501',
    category: 'Kềm cắt da',
    brand: 'Kềm Bến Thành',
    price: 190000,
    originalPrice: 260000,
    stock: 40,
    images: [
      '/src/assets/images/kem_kd501_1782618650453.jpg'
    ],
    rating: 5.0,
    description: 'Siêu phẩm Kềm cắt da KD-501 mạ vàng hoàng gia cao cấp. Lực cắt vô cùng nhẹ nhàng, cốt phẳng chạy êm trợ lực tuyệt hảo. Lưỡi kềm được chế tạo tinh xảo đạt độ bền sắc bén dài lâu lý tưởng cho các salon sang trọng bậc nhất.',
    specifications: {
      material: 'Thép carbon siêu cứng phủ mạ vàng cao cấp chống xỉn màu',
      sharpness: 'Bén ngọt vĩnh viễn, mài lưỡi vi điểm CNC chính xác',
      origin: 'Kềm Bến Thành - Việt Nam',
      warranty: '24 tháng bảo hành kỹ thuật vàng',
      size: 'Dài 11.1 cm, Rộng 4.8 cm',
      jawSize: 'Mũi 12 (4.5mm) siêu mảnh lấy khóe'
    },
    usageGuide: 'Sử dụng để tỉa da khóe chuyên sâu. Lau sạch và bôi dầu bảo quản cốt sau mỗi lần tiệt trùng nhiệt độ cao.',
    reviews: [
      {
        id: 'rev-4',
        userName: 'Mỹ Linh',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        comment: 'Đỉnh cao kềm cắt da! Vừa bén vừa sang chảnh, cầm lên tay là thích liền, làm cho khách rất an tâm.',
        date: '2026-06-27',
        approved: true
      }
    ],
    isBestSeller: true,
    isNew: false
  }
];

export const INITIAL_BLOGS: Blog[] = [
  {
    id: 'blog-1',
    title: 'Cách chọn kềm cắt móng chuyên nghiệp cho thợ mới bắt đầu',
    summary: 'Làm thế nào để chọn được một cây kềm vừa vặn, bén ngọt, bền bỉ mà không làm mỏi cổ tay khi thao tác hàng giờ liền? Hãy cùng Kềm Bến Thành xem ngay 5 tiêu chí vàng sau đây.',
    content: `Việc lựa chọn một cây kềm cắt móng hay kềm cắt da phù hợp chính là "vũ khí" quyết định chất lượng dịch vụ của một thợ làm nail. Dưới đây là những chia sẻ chi tiết từ Kềm Bến Thành để giúp các bạn mới vào nghề lựa chọn đúng chiếc kềm ưng ý nhất:

1. **Chất liệu thép (Thép thường, Inox hay Cobalt?):**
   - **Thép Carbon thường:** Dễ gỉ sét nếu dính nước, nhưng lưỡi cắt mài lại rất sắc bén và giá thành rẻ.
   - **Thép Inox không gỉ (Stainless Steel - SUS304/420):** Chống gỉ tốt, tiệt trùng lò hấp thoải mái, cực bền như trên cây kềm KM-506.
   - **Thép Carbon siêu cứng mạ vàng:** Độ cứng tối ưu, lưỡi cắt bền bỉ cực lâu như dòng kềm KD-501 mạ vàng cao cấp.

2. **Kích thước lưỡi kềm (Mũi kềm):**
   - **Mũi 14 (5.5mm):** Thích hợp cắt da những góc nhỏ hẹp, lách da khóe móng chuẩn xác. Như dòng kềm KD-06.
   - **Mũi 16 (6.5mm):** Bản lưỡi rộng, cắt nhanh hơn ở các diện tích móng dày, điển hình như KM-506.

3. **Kiểm tra độ bén ngọt của kềm:**
   - Đặt nhẹ lưỡi kềm lên một miếng nilon mỏng và bóp nhẹ, nếu vết đứt phẳng lỳ không có xơ nilon chứng tỏ kềm cực kỳ bén khít.`,
    image: 'https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&q=80&w=800',
    author: 'Kềm Bến Thành - Tư vấn viên',
    date: '2026-06-25',
    slug: 'cach-chon-kem-cat-mong-chuyen-nghiep',
    views: 1250
  },
  {
    id: 'blog-2',
    title: 'Tại sao kềm mạ vàng Kềm Bến Thành lại được các Salon ưa chuộng?',
    summary: 'Nước mạ vàng sang trọng cùng chất liệu thép được tôi luyện gia cường giúp các sản phẩm kềm KM-501 và KD-501 khẳng định đẳng cấp chuyên nghiệp.',
    content: `Các salon nail cao cấp không chỉ quan tâm đến độ bén mà còn cực kỳ chú ý đến hình ảnh chuyên nghiệp trong mắt khách hàng.

Vì sao dòng kềm mạ vàng KM-501 và KD-501 của Kềm Bến Thành lại dẫn đầu xu hướng?

- **Hợp kim gia cường chịu lực:** Được luyện từ dòng thép carbon chất lượng kết hợp mạ vàng nano, mang tới tính thẩm mỹ vượt trội, chống xỉn màu hiệu quả khi hấp khử trùng liên tục.
- **Sự hoàn thiện thủ công:** Mỗi sản phẩm được mài dũa dưới kính hiển vi bởi các nghệ nhân rèn cốt cán của Kềm Bến Thành, đảm bảo độ êm dịu cực đỉnh của cốt trục, không gây rung lắc hay rít kẹt khi làm da cho khách.`,
    image: 'https://images.unsplash.com/photo-1607006342411-1a90d6e5a4a6?auto=format&fit=crop&q=80&w=800',
    author: 'Kềm Bến Thành - Kỹ thuật viên',
    date: '2026-06-26',
    slug: 'kem-ma-vang-ben-thanh',
    views: 890
  }
];

export const FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'Sản phẩm kềm nào tốt nhất cho việc cắt móng dày cứng?',
    answer: 'Dòng kềm cắt móng KM-501 mạ vàng cao cấp hoặc kềm KM-506 với lưỡi cắt đầm chắc, mũi rộng và lực cắt tối ưu là giải pháp hoàn hảo để xử lý các bộ móng chân dày cứng một cách êm ái nhất.'
  },
  {
    id: 'faq-2',
    question: 'Nên dùng loại kềm nào để cắt da thừa, lấy khóe móng?',
    answer: 'Bạn nên chọn dòng Kềm cắt da KD-501 mạ vàng hoặc KD-06. Hai dòng này có lưỡi mỏng tinh tế, mũi kềm nhỏ gọn lách sâu vào da chết cực ngọt, không gây trầy xước đau rát khóe da.'
  },
  {
    id: 'faq-3',
    question: 'Cửa hàng Kềm Bến Thành nằm ở đâu?',
    answer: 'Cửa hàng chính thức của Kềm Bến Thành tọa lạc tại địa chỉ: 740 QL1A, Long An, Tây Ninh, Việt Nam. Quý khách có thể ghé trực tiếp trải nghiệm thử kềm hoặc đặt giao hàng hỏa tốc.'
  },
  {
    id: 'faq-4',
    question: 'Kềm Bến Thành có giao hàng toàn quốc (ship COD) không?',
    answer: 'Có, chúng tôi giao hàng tận nơi trên toàn quốc (63 tỉnh thành). Quý khách nhận kềm được đồng kiểm tra thử độ sắc bén, cốt êm trước khi thanh toán. Miễn phí vận chuyển cho đơn hàng từ 300.000đ trở lên!'
  }
];

export const BRANDS = ['Kềm Bến Thành'];
export const CATEGORIES = [
  'Kềm cắt móng',
  'Kềm cắt da'
];
export const VOUCHERS = [
  { code: 'BENTHANH10', discount: 10, type: 'percent', minOrder: 200000, desc: 'Giảm 10% cho đơn từ 200k' },
  { code: 'BENTHANHFREE', discount: 30000, type: 'amount', minOrder: 300000, desc: 'Miễn phí vận chuyển đơn từ 300k' }
];
