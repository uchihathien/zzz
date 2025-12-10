"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getProducts } from "@/lib/products-api";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

// Quick action buttons for common questions
const quickActions = [
    { label: "🔧 Sản phẩm bán chạy", prompt: "Cho tôi xem các sản phẩm bán chạy nhất" },
    { label: "💰 Sản phẩm giá rẻ", prompt: "Tìm sản phẩm có giá dưới 100.000đ" },
    { label: "📦 Cách đặt hàng", prompt: "Hướng dẫn tôi cách đặt hàng" },
    { label: "🛠️ Dịch vụ sửa chữa", prompt: "Các dịch vụ sửa chữa có những gì?" },
];

// System prompt for the AI
const SYSTEM_PROMPT = `Bạn là trợ lý AI của Getabec - công ty chuyên cung cấp linh kiện cơ khí và dịch vụ sửa chữa.

Nhiệm vụ của bạn:
- Tư vấn sản phẩm cơ khí (bulong, ốc vít, van, phụ kiện...)
- Hướng dẫn đặt hàng, thanh toán
- Giới thiệu dịch vụ sửa chữa và đặt lịch hẹn
- Trả lời câu hỏi về công ty

Phong cách:
- Thân thiện, chuyên nghiệp
- Trả lời ngắn gọn, súc tích
- Sử dụng emoji phù hợp
- Luôn đề xuất hành động cụ thể

Website: getabec.vn
Hotline: 0123.456.789`;

export function AIChatbox() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Xin chào! 👋 Tôi là trợ lý AI của Getabec. Tôi có thể giúp bạn:\n\n• Tìm kiếm sản phẩm cơ khí\n• Hướng dẫn đặt hàng\n• Tư vấn dịch vụ sửa chữa\n\nBạn cần hỗ trợ gì ạ?",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [productContext, setProductContext] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load product context for AI
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const products = await getProducts();
                const topProducts = products.slice(0, 20);
                const context = topProducts.map(p =>
                    `- ${p.name}: ${p.basePrice?.toLocaleString("vi-VN")}đ${p.stockQuantity === 0 ? " (Hết hàng)" : ""}`
                ).join("\n");
                setProductContext(context);
            } catch (error) {
                console.error("Failed to load products for AI context:", error);
            }
        };
        loadProducts();
    }, []);

    // Generate AI response - Enhanced version
    const generateResponse = useCallback(async (userMessage: string): Promise<string> => {
        const lowerMsg = userMessage.toLowerCase();

        // Greeting responses
        if (/^(xin chào|hello|hi|chào|hey|alo)/i.test(lowerMsg)) {
            return `Xin chào! 👋 Rất vui được hỗ trợ bạn!

Tôi là trợ lý AI của **Getabec** - chuyên cung cấp linh kiện cơ khí và dịch vụ sửa chữa.

Bạn có thể hỏi tôi về:
• 🔧 Sản phẩm, linh kiện cơ khí
• 💰 Giá cả, khuyến mãi
• 📦 Cách đặt hàng, thanh toán
• 🛠️ Dịch vụ sửa chữa, bảo trì
• 📞 Thông tin liên hệ

Bạn cần hỗ trợ gì ạ?`;
        }

        // Thank you responses
        if (/cảm ơn|thank|thanks|cám ơn/i.test(lowerMsg)) {
            return `Không có gì ạ! 😊 

Rất vui được hỗ trợ bạn. Nếu cần thêm thông tin, đừng ngại hỏi nhé!

📞 Hotline: **0123.456.789** (hỗ trợ 24/7)`;
        }

        // Product search - Enhanced
        if (lowerMsg.includes("sản phẩm") || lowerMsg.includes("tìm") || lowerMsg.includes("có") ||
            lowerMsg.includes("bán") || lowerMsg.includes("mua") && !lowerMsg.includes("cách mua")) {
            try {
                const products = await getProducts();
                let filtered = products;
                let searchDesc = "";

                // Filter by category keywords
                if (lowerMsg.includes("bulong") || lowerMsg.includes("bu lông")) {
                    filtered = products.filter(p => p.name.toLowerCase().includes("bulong") || p.name.toLowerCase().includes("bu lông"));
                    searchDesc = "bulong";
                } else if (lowerMsg.includes("ốc") || lowerMsg.includes("vít")) {
                    filtered = products.filter(p => p.name.toLowerCase().includes("ốc") || p.name.toLowerCase().includes("vít"));
                    searchDesc = "ốc vít";
                } else if (lowerMsg.includes("van")) {
                    filtered = products.filter(p => p.name.toLowerCase().includes("van"));
                    searchDesc = "van";
                } else if (lowerMsg.includes("máy")) {
                    filtered = products.filter(p => p.name.toLowerCase().includes("máy"));
                    searchDesc = "máy móc";
                } else if (lowerMsg.includes("dụng cụ") || lowerMsg.includes("công cụ")) {
                    filtered = products.filter(p => p.categoryName?.toLowerCase().includes("dụng cụ") || p.categoryName?.toLowerCase().includes("công cụ"));
                    searchDesc = "dụng cụ";
                }

                // Filter by price
                const priceMatch = userMessage.match(/(\d+)/);
                if (priceMatch) {
                    const price = parseInt(priceMatch[1]);
                    if (lowerMsg.includes("dưới") || lowerMsg.includes("rẻ") || lowerMsg.includes("<")) {
                        const maxPrice = price * (lowerMsg.includes("triệu") ? 1000000 : lowerMsg.includes("nghìn") || lowerMsg.includes("k") ? 1000 : 1);
                        filtered = filtered.filter(p => (p.basePrice || 0) <= maxPrice);
                        searchDesc += searchDesc ? ` giá dưới ${maxPrice.toLocaleString("vi-VN")}đ` : `giá dưới ${maxPrice.toLocaleString("vi-VN")}đ`;
                    } else if (lowerMsg.includes("trên") || lowerMsg.includes(">")) {
                        const minPrice = price * (lowerMsg.includes("triệu") ? 1000000 : lowerMsg.includes("nghìn") || lowerMsg.includes("k") ? 1000 : 1);
                        filtered = filtered.filter(p => (p.basePrice || 0) >= minPrice);
                        searchDesc += searchDesc ? ` giá trên ${minPrice.toLocaleString("vi-VN")}đ` : `giá trên ${minPrice.toLocaleString("vi-VN")}đ`;
                    }
                }

                // Get results
                const topProducts = filtered.slice(0, 5);

                if (topProducts.length > 0) {
                    const productList = topProducts.map((p, i) =>
                        `${i + 1}. **${p.name}**\n   💰 ${p.basePrice?.toLocaleString("vi-VN")}đ ${p.stockQuantity === 0 ? "❌ Hết hàng" : "✅ Còn hàng"}`
                    ).join("\n\n");

                    return `🔍 ${searchDesc ? `Kết quả tìm kiếm "${searchDesc}":` : "Một số sản phẩm nổi bật:"}\n\n${productList}\n\n📦 Tổng cộng có **${filtered.length}** sản phẩm\n\n👉 [Xem tất cả sản phẩm](/products)`;
                } else {
                    return `😅 Xin lỗi, không tìm thấy sản phẩm phù hợp với yêu cầu của bạn.

Bạn có thể:
• Thử từ khóa khác
• Xem [Tất cả sản phẩm](/products)
• Liên hệ hotline **0123.456.789** để được tư vấn`;
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        }

        // Order/Purchase guidance
        if (lowerMsg.includes("đặt hàng") || lowerMsg.includes("cách mua") || lowerMsg.includes("order") || lowerMsg.includes("thanh toán")) {
            return `📦 **Hướng dẫn đặt hàng tại Getabec:**

**Bước 1:** Chọn sản phẩm
→ Duyệt [Danh sách sản phẩm](/products), nhấn "Thêm vào giỏ"

**Bước 2:** Xem giỏ hàng
→ Kiểm tra số lượng, điều chỉnh nếu cần

**Bước 3:** Nhập thông tin giao hàng
→ Họ tên, SĐT, địa chỉ chi tiết

**Bước 4:** Chọn thanh toán
→ **COD** (trả khi nhận) hoặc **Chuyển khoản**

**Bước 5:** Xác nhận đơn hàng
→ Kiểm tra lại và hoàn tất!

💡 **Ưu đãi:**
• Miễn phí vận chuyển đơn từ 500K
• Giá sỉ khi mua số lượng lớn

👉 [Xem giỏ hàng](/cart) | [Mua ngay](/products)`;
        }

        // Service queries - Enhanced
        if (lowerMsg.includes("dịch vụ") || lowerMsg.includes("sửa chữa") || lowerMsg.includes("bảo trì") || lowerMsg.includes("gia công")) {
            return `🛠️ **Dịch vụ của Getabec:**

**1. Sửa chữa cơ khí** 🔧
   Bảo trì, sửa chữa máy móc công nghiệp

**2. Gia công CNC** ⚙️
   Tiện, phay, khoan chính xác cao

**3. Lắp đặt thiết bị** 🏗️
   Thi công, lắp ráp tại chỗ

**4. Tư vấn kỹ thuật** 💡
   Giải pháp cơ khí tối ưu

⏰ **Giờ làm việc:** T2-T7, 8:00-17:00
📍 **Địa điểm:** TP.HCM và các tỉnh lân cận
💰 **Báo giá:** Miễn phí!

👉 [Xem dịch vụ](/services) | [Đặt lịch ngay](/bookings/create)`;
        }

        // Contact info - Enhanced
        if (lowerMsg.includes("liên hệ") || lowerMsg.includes("hotline") || lowerMsg.includes("địa chỉ") || lowerMsg.includes("email") || lowerMsg.includes("số điện thoại")) {
            return `📞 **Thông tin liên hệ Getabec:**

🏢 **Công ty TNHH Getabec Việt Nam**

📱 **Hotline:** 0123.456.789 (hỗ trợ 24/7)
📧 **Email:** info@getabec.vn
🌐 **Website:** getabec.vn
📍 **Địa chỉ:** 123 Đường ABC, Quận XYZ, TP.HCM

⏰ **Giờ làm việc:**
• Thứ 2 - Thứ 7: 8:00 - 17:00
• Chủ nhật: Nghỉ

🚗 Có bãi đậu xe miễn phí!`;
        }

        // Shipping/Delivery queries
        if (lowerMsg.includes("giao hàng") || lowerMsg.includes("vận chuyển") || lowerMsg.includes("ship")) {
            return `🚚 **Chính sách giao hàng:**

**Phí vận chuyển:**
• Nội thành TP.HCM: **30.000đ**
• Tỉnh thành khác: **40.000-60.000đ**
• **MIỄN PHÍ** đơn từ 500.000đ!

**Thời gian giao:**
• Nội thành: 1-2 ngày
• Tỉnh thành: 2-5 ngày

**Đơn vị vận chuyển:**
• GHN, GHTK, Viettel Post

💡 Bạn có thể theo dõi đơn hàng tại [Đơn hàng của tôi](/orders/my)`;
        }

        // Return/Warranty queries
        if (lowerMsg.includes("đổi trả") || lowerMsg.includes("bảo hành") || lowerMsg.includes("hoàn tiền")) {
            return `🔄 **Chính sách đổi trả & Bảo hành:**

**Đổi trả:**
• ✅ Đổi trả trong **7 ngày** nếu lỗi sản xuất
• ✅ Hoàn tiền 100% nếu giao sai hàng
• ❌ Không đổi trả hàng đã qua sử dụng

**Bảo hành:**
• Sản phẩm: 6-12 tháng tùy loại
• Dịch vụ sửa chữa: 3-6 tháng

**Liên hệ đổi trả:**
📞 Hotline: **0123.456.789**
📧 Email: support@getabec.vn`;
        }

        // Promotion/Discount queries
        if (lowerMsg.includes("khuyến mãi") || lowerMsg.includes("giảm giá") || lowerMsg.includes("ưu đãi") || lowerMsg.includes("sale")) {
            return `🎉 **Ưu đãi đang có tại Getabec:**

💥 **Khuyến mãi hiện tại:**
• Giảm **10%** đơn hàng đầu tiên
• Miễn phí ship đơn từ **500K**
• Mua 5 tặng 1 một số sản phẩm

💰 **Giá sỉ:**
• Mua từ 10 sản phẩm: Giảm **5%**
• Mua từ 50 sản phẩm: Giảm **10%**
• Mua từ 100 sản phẩm: **Liên hệ** báo giá

👉 [Xem sản phẩm](/products)

📞 Liên hệ **0123.456.789** để nhận báo giá tốt nhất!`;
        }

        // Company info
        if (lowerMsg.includes("công ty") || lowerMsg.includes("getabec") || lowerMsg.includes("giới thiệu")) {
            return `🏢 **Giới thiệu Getabec:**

**Getabec Việt Nam** là đơn vị chuyên cung cấp:
• 🔧 Linh kiện, phụ tùng cơ khí
• ⚙️ Thiết bị công nghiệp
• 🛠️ Dịch vụ sửa chữa, gia công

**Tại sao chọn Getabec?**
✅ Sản phẩm chính hãng, chất lượng
✅ Giá cạnh tranh, nhiều ưu đãi
✅ Bảo hành dài hạn
✅ Đội ngũ kỹ thuật chuyên nghiệp
✅ Hỗ trợ 24/7

📍 Kinh nghiệm **10+ năm** trong ngành!`;
        }

        // Booking/Appointment
        if (lowerMsg.includes("đặt lịch") || lowerMsg.includes("hẹn") || lowerMsg.includes("booking")) {
            return `📅 **Đặt lịch hẹn dịch vụ:**

Để đặt lịch sửa chữa/tư vấn, bạn có thể:

**Cách 1:** Đặt online 🌐
→ [Đặt lịch ngay](/bookings/create)

**Cách 2:** Gọi điện 📞
→ Hotline: **0123.456.789**

**Thông tin cần chuẩn bị:**
• Loại thiết bị/dịch vụ cần hỗ trợ
• Mô tả vấn đề (nếu có)
• Địa chỉ, thời gian thuận tiện

⏰ Chúng tôi sẽ liên hệ xác nhận trong **30 phút**!`;
        }

        // Account/Order tracking
        if (lowerMsg.includes("đơn hàng") || lowerMsg.includes("theo dõi") || lowerMsg.includes("tài khoản")) {
            return `👤 **Quản lý tài khoản & Đơn hàng:**

**Xem đơn hàng:**
→ [Đơn hàng của tôi](/orders/my)

**Xem lịch hẹn:**
→ [Lịch hẹn của tôi](/bookings/my)

**Quản lý địa chỉ:**
→ [Địa chỉ giao hàng](/shipping-addresses)

**Giỏ hàng:**
→ [Xem giỏ hàng](/cart)

❓ Cần hỗ trợ đơn hàng? Gọi **0123.456.789**`;
        }

        // Default - Try to be helpful
        return `Cảm ơn bạn đã nhắn tin! 😊

Tôi chưa hiểu rõ câu hỏi, nhưng tôi có thể giúp bạn:

🔧 **Sản phẩm:** "Tìm bulong M10", "Sản phẩm giá dưới 100K"
📦 **Đặt hàng:** "Cách đặt hàng", "Hướng dẫn thanh toán"
🛠️ **Dịch vụ:** "Dịch vụ sửa chữa", "Đặt lịch hẹn"
🚚 **Giao hàng:** "Phí ship", "Thời gian giao"
📞 **Liên hệ:** "Hotline", "Địa chỉ cửa hàng"

💡 **Mẹo:** Hãy nhập từ khóa cụ thể để tôi hỗ trợ tốt hơn!

Hoặc gọi **0123.456.789** để được tư vấn trực tiếp ạ.`;
    }, []);


    // Handle send message
    const handleSendMessage = async (content?: string) => {
        const messageContent = content || inputValue.trim();
        if (!messageContent || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: messageContent,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await generateResponse(messageContent);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error generating response:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hotline 0123.456.789 để được hỗ trợ.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle quick action click
    const handleQuickAction = (prompt: string) => {
        handleSendMessage(prompt);
    };

    // Toggle chat window
    const toggleChat = () => {
        setIsOpen(prev => !prev);
        if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen
                    ? "bg-gray-600 hover:bg-gray-700 rotate-90"
                    : "bg-blue-600 hover:bg-blue-700 animate-pulse hover:animate-none"
                    }`}
                aria-label={isOpen ? "Đóng chat" : "Mở chat hỗ trợ"}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>

            {/* Notification badge */}
            {!isOpen && (
                <span className="fixed bottom-16 right-6 z-50 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                    Hỗ trợ 24/7
                </span>
            )}

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-48px)] transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
                }`}>
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[70vh]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">Trợ lý AI Getabec</h3>
                                <p className="text-xs text-blue-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Đang hoạt động
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[300px] max-h-[400px]">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user"
                                    ? "bg-blue-600 text-white rounded-br-md"
                                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                                    }`}>
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {message.content.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
                                            const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                                            if (linkMatch) {
                                                return (
                                                    <a
                                                        key={i}
                                                        href={linkMatch[2]}
                                                        className={`underline hover:no-underline ${message.role === "user" ? "text-blue-100" : "text-blue-600"
                                                            }`}
                                                    >
                                                        {linkMatch[1]}
                                                    </a>
                                                );
                                            }
                                            // Handle bold text
                                            return part.split(/(\*\*.*?\*\*)/g).map((subpart, j) => {
                                                if (subpart.startsWith("**") && subpart.endsWith("**")) {
                                                    return <strong key={`${i}-${j}`}>{subpart.slice(2, -2)}</strong>;
                                                }
                                                return subpart;
                                            });
                                        })}
                                    </div>
                                    <div className={`text-[10px] mt-1 ${message.role === "user" ? "text-blue-200" : "text-gray-400"
                                        }`}>
                                        {message.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length <= 2 && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Câu hỏi thường gặp:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickAction(action.prompt)}
                                        className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex gap-2"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                        <p className="text-[10px] text-gray-400 text-center mt-2">
                            AI hỗ trợ bởi Getabec • Phản hồi chỉ mang tính tham khảo
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
