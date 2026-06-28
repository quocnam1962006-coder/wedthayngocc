/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { INITIAL_PRODUCTS } from './src/data';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// In-memory store for backend states
let chatbotRules = 'Tập trung tư vấn Kềm cắt da KD-501 mạ vàng cao cấp khi khách hỏi về kềm cắt da tốt nhất, và Kềm cắt móng KM-506 hoặc KM-501 khi hỏi về kềm cắt móng.';
const activeOrders: any[] = [
  {
    id: 'HD8899',
    customerName: 'Nguyễn Văn Nam',
    phone: '0916188818',
    email: 'quocnam1962006@gmail.com',
    address: '740 QL1A, Long An, Tây Ninh, Việt Nam',
    items: [
      {
        productId: 'prod-1',
        productName: 'Kềm cắt móng KM-506',
        productCode: 'KM-506',
        price: 150000,
        quantity: 1,
        image: '/src/assets/images/kem_km506_1782618608126.jpg'
      }
    ],
    subtotal: 150000,
    discount: 0,
    shippingFee: 30000,
    total: 180000,
    paymentMethod: 'COD',
    status: 'delivering',
    date: '2026-06-27'
  }
];

// Lazy initialize Gemini API client to prevent startup crash if missing API key
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('CẢNH BÁO: Không tìm thấy GEMINI_API_KEY trong biến môi trường. Chatbot sẽ chạy ở chế độ phản hồi tự động ngoại tuyến.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Format products for prompt injection
const productsPromptInfo = INITIAL_PRODUCTS.map(p => ({
  id: p.id,
  code: p.code,
  name: p.name,
  category: p.category,
  brand: p.brand,
  price: p.price,
  originalPrice: p.originalPrice,
  stock: p.stock,
  rating: p.rating,
  description: p.description,
  material: p.specifications.material,
  sharpness: p.specifications.sharpness,
  origin: p.specifications.origin,
  warranty: p.specifications.warranty,
  jawSize: p.specifications.jawSize
}));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Get orders
app.get('/api/orders', (req, res) => {
  res.json(activeOrders);
});

// Create new order
app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder.id) {
    newOrder.id = 'HD' + Math.floor(100000 + Math.random() * 900000);
  }
  if (!newOrder.date) {
    newOrder.date = new Date().toISOString().split('T')[0];
  }
  activeOrders.push(newOrder);
  res.status(201).json(newOrder);
});

// Update order status
app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const orderIndex = activeOrders.findIndex(o => o.id === id);
  if (orderIndex > -1) {
    activeOrders[orderIndex].status = status;
    res.json(activeOrders[orderIndex]);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Track Order
app.post('/api/orders/track', (req, res) => {
  const { orderCode } = req.body;
  const order = activeOrders.find(o => o.id.toLowerCase() === orderCode.toString().trim().toLowerCase());
  if (order) {
    res.json({ success: true, order });
  } else {
    // Generate a default mock order progression for demo purposes if code is random
    res.json({
      success: true,
      order: {
        id: orderCode,
        customerName: 'Khách hàng Demo',
        phone: '09xxxxxx',
        email: 'demo@gmail.com',
        address: '740 QL1A, Long An, Tây Ninh, Việt Nam',
        items: [
          {
            productName: 'Kềm cắt da KD-06',
            productCode: 'KD-06',
            price: 160000,
            quantity: 1,
            image: '/src/assets/images/kem_kd06_1782618637192.jpg'
          }
        ],
        subtotal: 160000,
        discount: 0,
        shippingFee: 30000,
        total: 190000,
        paymentMethod: 'COD',
        status: 'processing', // Default status for generated ones
        date: new Date().toISOString().split('T')[0]
      }
    });
  }
});

// Get Chatbot Config/Rules
app.get('/api/chatbot-config', (req, res) => {
  res.json({ rules: chatbotRules });
});

// Update Chatbot Config/Rules
app.post('/api/chatbot-config', (req, res) => {
  const { rules } = req.body;
  if (typeof rules === 'string') {
    chatbotRules = rules;
    res.json({ success: true, rules: chatbotRules });
  } else {
    res.status(400).json({ error: 'Rules must be a string' });
  }
});

// Helper function to generate rich offline responses when Gemini is offline or fails
function generateOfflineResponse(message: string): string {
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes('tốt nhất') || msgLower.includes('loại nào tốt') || msgLower.includes('khuyên dùng') || msgLower.includes('recommend') || msgLower.includes('recommed')) {
    return `Dạ, để trả lời câu hỏi của anh/chị, dòng sản phẩm tốt nhất và được ưa chuộng hàng đầu của **Kềm Bến Thành** là:
- **Kềm Cắt Da Cao Cấp KD-501** (Giá: **190.000đ**): Sở hữu lớp mạ vàng hoàng gia 24k siêu sang, cốt kềm êm phẳng lỳ trợ lực tốt và lưỡi cắt mài vi điểm CNC siêu bén, chuyên nhặt da thừa sạch sẽ, lách khóe êm ái không đau rát.
- **Kềm Cắt Móng Chuyên Nghiệp KM-501** (Giá: **180.000đ**): Luyện từ hợp kim thép tôi đặc biệt chống mài mòn, mạ vàng sang trọng, chuyên trị các loại móng tay móng chân dày cứng một cách ngọt ngào nhất.

Quý khách mua đơn từ 300.000đ được **miễn phí giao hàng toàn quốc**, nhận hàng được thử kềm bén ngọt mới thanh toán ạ!`;
  }

  if (msgLower.includes('cắt da') || msgLower.includes('da thừa') || msgLower.includes('khóe') || msgLower.includes('kd06') || msgLower.includes('kd501') || msgLower.includes('kd-06') || msgLower.includes('kd-501') || msgLower.includes('nhặt da') || msgLower.includes('lấy khóe')) {
    return `Dạ, đối với nhu cầu **cắt tỉa da thừa và lấy khóe móng**, Kềm Bến Thành có 2 dòng sản phẩm chuyên dụng xuất sắc:
1. **Kềm Cắt Da KD-06** (Giá: **160.000đ**): Chế tác từ thép không gỉ Inox cao cấp, công nghệ mài mâm CNC siêu mỏng cực bén giúp đi sâu lách khóe êm ái, rất hợp thợ nail/salon.
2. **Kềm Cắt Da Cao Cấp KD-501** (Giá: **190.000đ**): Bản mạ vàng hoàng gia chống xỉn màu cực tốt, lực cắt vô cùng nhẹ nhàng, cốt phẳng chạy êm trợ lực tuyệt hảo. Lưỡi kềm siêu mảnh lấy khóe vi điểm cực sạch.

Anh/chị muốn đặt mẫu nào để shop đóng gói giao hỏa tốc hoặc gửi tư vấn thêm ạ?`;
  }

  if (msgLower.includes('cắt móng') || msgLower.includes('móng dày') || msgLower.includes('móng chân') || msgLower.includes('km506') || msgLower.includes('km501') || msgLower.includes('km-506') || msgLower.includes('km-501') || msgLower.includes('cắt móng dày')) {
    return `Dạ, đối với nhu cầu **cắt tỉa móng tay, móng chân dày gọn gàng**, Kềm Bến Thành có 2 dòng sản phẩm lực cắt cực đầm và bén:
1. **Kềm Cắt Móng KM-506** (Giá: **150.000đ**): Chế tác từ thép không gỉ sáng bóng, lưỡi kềm được mài tay thủ công bởi nghệ nhân tay nghề cao, cốt kềm lách mượt cắt dứt khoát không xơ móng.
2. **Kềm Cắt Móng Cao Cấp KM-501** (Giá: **180.000đ**): Nước mạ vàng sang trọng cùng chất liệu thép tôi đặc biệt chống mài mòn cao, thiết kế công thái học hoàn mĩ giúp người thợ thao tác cả ngày không mỏi tay.

Cả 2 dòng đều cực kỳ bén ngọt, anh/chị chọn dòng mạ vàng sang chảnh hay dòng inox sáng bóng ạ?`;
  }

  if (msgLower.includes('giá bao nhiêu') || msgLower.includes('bao nhiêu tiền') || msgLower.includes('báo giá') || msgLower.includes('giá cả') || msgLower.includes('bảng giá') || msgLower.includes('nhiêu một') || msgLower.includes('báo giá kềm')) {
    return `Dạ, Kềm Bến Thành xin gửi bảng báo giá xưởng chính thức cho 4 sản phẩm chính:
1. **Kềm cắt móng KM-506**: **150.000đ** (Thép inox sáng bóng)
2. **Kềm cắt móng KM-501**: **180.000đ** (Mạ vàng cao cấp, chống mài mòn)
3. **Kềm cắt da KD-06**: **160.000đ** (Thép inox nhặt da lách khóe)
4. **Kềm cắt da KD-501**: **190.000đ** (Mạ vàng hoàng gia nhặt da siêu mịn)

🎁 **Ưu đãi cực lớn hôm nay**:
- Đồng giá phí vận chuyển toàn quốc chỉ 30.000đ.
- **MIỄN PHÍ SHIP** cho mọi đơn hàng từ **300.000đ** trở lên (Mua từ 2 cây bất kỳ là được freeship ạ).
- Quý khách nhận hàng được mở hộp đồng kiểm tra, **thử kềm trực tiếp lên móng/da** bén ngọt mới cần thanh toán!`;
  }

  if (msgLower.includes('địa chỉ') || msgLower.includes('ở đâu') || msgLower.includes('showroom') || msgLower.includes('cửa hàng') || msgLower.includes('vị trí') || msgLower.includes('bản đồ') || msgLower.includes('tây ninh') || msgLower.includes('long an') || msgLower.includes('trụ sở')) {
    return `Dạ, cửa hàng chính thức của thương hiệu **Kềm Bến Thành** tọa lạc tại:
📍 **Địa chỉ**: 740 QL1A, Long An, Tây Ninh, Việt Nam.
📞 **Hotline hỗ trợ**: 0916 18 88 18 - 0902 62 62 92.
📧 **Email**: KemBenThanh@PhucAnNail.com

Quý khách có thể ghé trực tiếp cửa hàng để tự tay trải nghiệm và thử các mẫu kềm bén ngọt từ nghệ nhân rèn cốt cán của chúng tôi, hoặc đặt hàng trực tuyến trên website để được giao tận nơi hỏa tốc toàn quốc!`;
  }

  if (msgLower.includes('bảo hành') || msgLower.includes('đổi trả') || msgLower.includes('chế độ') || msgLower.includes('lỗi') || msgLower.includes('mẻ kềm') || msgLower.includes('rơ cốt')) {
    return `Dạ, tất cả sản phẩm của **Kềm Bến Thành** đều đi kèm chính sách bảo hành vàng cực kỳ uy tín:
- **Thời gian bảo hành**: Từ **12 đến 24 tháng** chính hãng tùy sản phẩm.
- **Phạm vi bảo hành**: Bảo hành kỹ thuật lỗi cốt rít, rơ cốt kềm, lỗi sứt mẻ tự nhiên do nhà sản xuất. Hỗ trợ mài bén và bảo dưỡng cốt kềm trọn đời.
- **Chính sách đổi trả**: Hỗ trợ 1 đổi 1 trong vòng 7 ngày đầu tiên nếu quý khách phát hiện lỗi cốt rơ hoặc kẹt rít không êm từ xưởng sản xuất.

Chúng tôi cam kết luôn đặt sự hài lòng của quý khách lên hàng đầu!`;
  }

  if (msgLower.includes('ship') || msgLower.includes('vận chuyển') || msgLower.includes('giao hàng') || msgLower.includes('gửi hàng') || msgLower.includes('cod') || msgLower.includes('phí ship') || msgLower.includes('free ship') || msgLower.includes('freeship')) {
    return `Dạ, chính sách giao nhận của **Kềm Bến Thành** cực kỳ an tâm cho khách hàng:
- **Giao hàng toàn quốc**: Nhận giao nhanh đến tất cả 63 tỉnh thành Việt Nam.
- **Phí giao hàng**: Đồng giá 30.000đ cho đơn dưới 300k.
- **MIỄN PHÍ VẬN CHUYỂN**: Cho mọi đơn hàng có giá trị từ **300.000đ** trở lên (tương đương mua từ 2 sản phẩm kềm trở lên).
- **Quyền lợi Đồng Kiểm**: Khi nhận hàng, quý khách được mở hộp kiểm tra mẫu mã và **thử cắt thử độ bén bén ngọt** của kềm trước khi thanh toán cho shipper (Ship COD).`;
  }

  if (msgLower.includes('đơn hàng') || msgLower.includes('tra cứu') || msgLower.includes('mã đơn') || msgLower.includes('hóa đơn') || msgLower.includes('trạng thái') || msgLower.includes('kiểm tra đơn') || msgLower.startsWith('hd') || msgLower.includes('hd8899')) {
    // Look for a code like HD1234
    const codeMatch = message.match(/HD\d+/i);
    if (codeMatch) {
      const oCode = codeMatch[0].toUpperCase();
      const foundOrder = activeOrders.find(o => o.id === oCode);
      if (foundOrder) {
        const statusMap: Record<string, string> = {
          processing: 'Đang xử lý ⏳ (Cửa hàng đang liên hệ để xác minh thông tin đơn và gọi điện xác nhận)',
          packaging: 'Đang đóng gói 📦',
          delivering: 'Đang giao hàng hỏa tốc 🚚',
          received: 'Đã nhận thành công ✅'
        };
        return `Dạ shop đã tìm thấy thông tin đơn hàng **${foundOrder.id}** của quý khách **${foundOrder.customerName}**:
- **Trạng thái**: ${statusMap[foundOrder.status] || foundOrder.status}
- **Số điện thoại**: ${foundOrder.phone}
- **Địa chỉ giao hàng**: ${foundOrder.address}
- **Sản phẩm đã mua**: ${foundOrder.items.map((i: any) => `${i.productName} (x${i.quantity})`).join(', ')}
- **Tổng thanh toán**: **${foundOrder.total.toLocaleString()}đ** (${foundOrder.paymentMethod})

Quý khách an tâm đơn hàng đang đi đúng lộ trình và sẽ sớm giao tận tay quý khách ạ!`;
      } else {
        return `Dạ shop chưa tìm thấy mã đơn hàng **${oCode}** trong hệ thống. Bạn vui lòng kiểm tra lại mã hoặc thử tra cứu mã đơn hàng mặc định của hệ thống là **HD8899** để thử nghiệm nhé!`;
      }
    } else {
      return `Để tra cứu trạng thái đơn hàng của mình, quý khách vui lòng nhập chính xác **mã hóa đơn** kèm theo chữ HD (ví dụ: **HD8899** hoặc mã đơn nhận được sau khi đặt hàng) để shop kiểm tra hành trình giao hàng nhanh nhất cho bạn nhé!`;
    }
  }

  if (msgLower.includes('chào') || msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('alo') || msgLower.includes('ai') || msgLower.includes('xin chào') || msgLower.includes('ở đó')) {
    return `Dạ xin kính chào quý khách! Em là **Trợ lý AI tư vấn trực tuyến** của thương hiệu **Kềm Bến Thành** 24/7.

Em có thể hỗ trợ quý khách các thông tin sau:
- ✂️ **Tư vấn loại kềm phù hợp** (nhặt da thừa, lấy khóe sâu, cắt móng dày...).
- 💰 **Báo giá chính xác** từng mẫu kềm & các chương trình khuyến mãi hiện có.
- 🚚 **Chính sách giao hàng toàn quốc & freeship** đơn từ 300k.
- 🛡️ **Chế độ bảo hành vàng** 12 - 24 tháng và bảo dưỡng mài bén trọn đời.
- 📦 **Tra cứu hành trình đơn hàng** nhanh chóng (nhập mã đơn dạng **HD8899**).

Anh/chị cần em hỗ trợ giải đáp thắc mắc nào trước ạ?`;
  }

  // General catch-all fallback
  return `Dạ, cảm ơn quý khách đã gửi tin nhắn đến **Kềm Bến Thành**!
Hiện tại em chưa hiểu hết câu hỏi của anh/chị, nhưng anh/chị có thể hỏi em các câu như:
- *"Kềm nào nhặt da và lấy khóe tốt nhất?"*
- *"Tư vấn kềm cắt móng chân dày"*
- *"Báo giá kềm KM-506"*
- *"Bảo hành kềm như thế nào?"*
- *"Phí ship và ưu đãi giao hàng thế nào?"*
- *"Địa chỉ cửa hàng ở đâu?"*
- *"Tra cứu trạng thái đơn hàng HD8899"*

Hoặc quý khách cũng có thể liên hệ trực tiếp số hotline **0916 18 88 18** để gặp nhân viên hỗ trợ trực tiếp nhanh nhất ạ!`;
}

// AI Chatbot Consultant Route (Generates professional replies with Gemini)
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Check if we can run Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('Using offline mock response engine for Gemini...');
    const reply = generateOfflineResponse(message);
    return res.json({ text: reply });
  }

  try {
    const ai = getAiClient();

    const systemInstruction = `Bạn là chuyên gia tư vấn bán hàng 24/7 của thương hiệu "Kềm Bến Thành" - địa chỉ uy tín tại: 740 QL1A, Long An, Tây Ninh, Việt Nam. Phân phối sỉ lẻ kềm cắt móng, kềm cắt da cao cấp sản xuất tinh hoa nghệ nhân Việt.

Nhiệm vụ của bạn:
1. Chào đón khách hàng niềm nở, thân thiện, lịch sự và chuyên nghiệp dưới thương hiệu Kềm Bến Thành.
2. Trả lời các câu hỏi về sản phẩm dựa trên thông tin chính xác được cung cấp dưới đây.
3. Tư vấn chọn loại kềm phù hợp theo nhu cầu (cắt da, cắt móng, móng dày móng mỏng, mạ vàng gold sang trọng, chất liệu thép inox chống gỉ...).
4. Địa chỉ chính thức: 740 QL1A, Long An, Tây Ninh, Việt Nam. Số điện thoại: 0916 18 88 18 - 0902 62 62 92.
5. Hỗ trợ tra cứu thông tin đơn hàng nếu khách hỏi. (Mã đơn hàng có dạng HD8899). Sử dụng danh sách đơn hàng được cung cấp để phản hồi chính xác trạng thái nếu khách cung cấp mã khớp.
6. Giải đáp thắc mắc về chính sách bảo hành, giao hàng toàn quốc (đồng giá 30k, miễn phí ship đơn hàng từ 300k, ship COD được kiểm tra và thử độ bén ngọt của kềm trước khi thanh toán).

Danh sách đơn hàng hiện có để tra cứu:
${JSON.stringify(activeOrders, null, 2)}

Thông tin Sản phẩm tại shop (Chỉ có duy nhất 4 sản phẩm này):
${JSON.stringify(productsPromptInfo, null, 2)}

Chính sách bảo hành & Giao hàng:
- Kềm bảo hành kỹ thuật 12-24 tháng lỗi sứt mẻ cốt, lỗi cốt rít, rơ cốt kềm. Hỗ trợ mài bén trọn đời.
- Giao hàng toàn quốc đồng giá 30.000đ. Đơn hàng từ 300.000đ được miễn phí vận chuyển. Ship COD cho kiểm tra hàng thử bén trước khi trả tiền.

Dữ liệu huấn luyện bổ sung từ quản trị viên:
${chatbotRules}

Lưu ý quan trọng:
- Luôn trả lời bằng Tiếng Việt thân thiện, nhiệt tình, xưng hô "dạ" lễ phép.
- Không bịa đặt thông tin sản phẩm không có trong danh sách. Nếu khách hỏi sản phẩm khác, hãy giới thiệu lịch sự 1 trong 4 mẫu hiện có của shop.
- Gợi ý mã sản phẩm cụ thể (ví dụ: KM-506, KM-501, KD-06, KD-501) khi tư vấn để khách dễ chọn mua.
- Định dạng câu trả lời đẹp mắt bằng Markdown, xuống dòng rõ ràng, bôi đậm các từ khóa quan trọng để khách tiện theo dõi.`;

    // Process chat request using ai.models.generateContent
    // Build conversation history format for contents
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role,
          parts: [{ text: h.parts[0].text }]
        });
      });
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text || generateOfflineResponse(message);
    res.json({ text });
  } catch (error: any) {
    console.error('Error with Gemini API:', error);
    // Graceful fallback to offline keyword matching if live Gemini fails
    const fallbackText = generateOfflineResponse(message);
    res.json({ text: fallbackText });
  }
});

// Setup Vite Dev Server / Static Asset Handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
