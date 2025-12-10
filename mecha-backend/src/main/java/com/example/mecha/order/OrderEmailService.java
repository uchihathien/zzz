package com.example.mecha.order;

import com.example.mecha.order.dto.OrderDto;
import com.example.mecha.order.dto.OrderItemDto;
import com.example.mecha.user.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@getabec.vn}")
    private String fromEmail;

    private static final NumberFormat VND_FORMAT = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    /**
     * Gửi email xác nhận đơn hàng (async để không block request)
     */
    @Async
    public void sendOrderConfirmationEmail(User customer, OrderDto order) {
        try {
            String subject = "🛒 Xác nhận đơn hàng #" + order.getOrderCode() + " - Getabec";
            String body = buildOrderConfirmationHtml(customer, order);
            
            sendHtmlEmail(customer.getEmail(), subject, body);
            log.info("Order confirmation email sent to {} for order {}", customer.getEmail(), order.getOrderCode());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email to {} for order {}: {}", 
                    customer.getEmail(), order.getOrderCode(), e.getMessage());
        }
    }

    /**
     * Gửi email khi đơn hàng thay đổi trạng thái
     */
    @Async
    public void sendOrderStatusUpdateEmail(User customer, OrderDto order, String oldStatus) {
        try {
            String subject = "📦 Cập nhật đơn hàng #" + order.getOrderCode() + " - Getabec";
            String body = buildOrderStatusUpdateHtml(customer, order, oldStatus);
            
            sendHtmlEmail(customer.getEmail(), subject, body);
            log.info("Order status update email sent to {} for order {}", customer.getEmail(), order.getOrderCode());
        } catch (Exception e) {
            log.error("Failed to send order status update email: {}", e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }

    private String buildOrderConfirmationHtml(User customer, OrderDto order) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang='vi'><head><meta charset='UTF-8'></head>");
        html.append("<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>");
        
        // Header
        html.append("<div style='background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>");
        html.append("<h1 style='margin: 0; font-size: 24px;'>✅ Đặt hàng thành công!</h1>");
        html.append("<p style='margin: 10px 0 0; opacity: 0.9;'>Cảm ơn bạn đã mua hàng tại Getabec</p>");
        html.append("</div>");
        
        // Order info
        html.append("<div style='background: #f8fafc; padding: 25px; border: 1px solid #e2e8f0;'>");
        
        html.append("<p style='margin: 0 0 15px;'>Xin chào <strong>").append(customer.getFullName()).append("</strong>,</p>");
        html.append("<p style='margin: 0 0 20px;'>Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>");
        
        // Order details box
        html.append("<div style='background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;'>");
        html.append("<h2 style='margin: 0 0 15px; font-size: 18px; color: #1e40af;'>📋 Thông tin đơn hàng</h2>");
        html.append("<table style='width: 100%; border-collapse: collapse;'>");
        html.append("<tr><td style='padding: 8px 0; color: #64748b;'>Mã đơn hàng:</td><td style='padding: 8px 0; text-align: right;'><strong style='color: #2563eb;'>").append(order.getOrderCode()).append("</strong></td></tr>");
        html.append("<tr><td style='padding: 8px 0; color: #64748b;'>Ngày đặt:</td><td style='padding: 8px 0; text-align: right;'>").append(DATE_FORMAT.format(order.getCreatedAt())).append("</td></tr>");
        html.append("<tr><td style='padding: 8px 0; color: #64748b;'>Phương thức thanh toán:</td><td style='padding: 8px 0; text-align: right;'>").append(getPaymentMethodText(order.getPaymentMethod())).append("</td></tr>");
        html.append("<tr><td style='padding: 8px 0; color: #64748b;'>Trạng thái:</td><td style='padding: 8px 0; text-align: right;'><span style='background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px;'>Đang xử lý</span></td></tr>");
        html.append("</table>");
        html.append("</div>");
        
        // Products list
        html.append("<div style='background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;'>");
        html.append("<h2 style='margin: 0 0 15px; font-size: 18px; color: #1e40af;'>🛒 Chi tiết sản phẩm</h2>");
        html.append("<table style='width: 100%; border-collapse: collapse;'>");
        
        for (OrderItemDto item : order.getItems()) {
            String itemName = item.getProductName() != null ? item.getProductName() : item.getServiceName();
            html.append("<tr style='border-bottom: 1px solid #f1f5f9;'>");
            html.append("<td style='padding: 12px 0;'><strong>").append(itemName).append("</strong><br><span style='color: #64748b; font-size: 12px;'>Số lượng: ").append(item.getQuantity()).append("</span></td>");
            html.append("<td style='padding: 12px 0; text-align: right; white-space: nowrap;'>").append(formatMoney(item.getLineTotal())).append("</td>");
            html.append("</tr>");
        }
        
        // Total
        html.append("<tr><td style='padding: 15px 0; font-size: 16px;'><strong>Tổng cộng:</strong></td>");
        html.append("<td style='padding: 15px 0; text-align: right; font-size: 20px; color: #dc2626;'><strong>").append(formatMoney(order.getTotalAmount())).append("</strong></td></tr>");
        html.append("</table>");
        html.append("</div>");
        
        // Shipping info
        html.append("<div style='background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;'>");
        html.append("<h2 style='margin: 0 0 15px; font-size: 18px; color: #1e40af;'>📍 Địa chỉ giao hàng</h2>");
        html.append("<p style='margin: 0;'><strong>").append(customer.getFullName()).append("</strong></p>");
        html.append("<p style='margin: 5px 0; color: #64748b;'>").append(order.getContactPhone()).append("</p>");
        html.append("<p style='margin: 5px 0; color: #64748b;'>").append(order.getShippingAddress()).append("</p>");
        html.append("</div>");
        
        // Payment instructions for bank transfer
        if (order.getPaymentMethod() != null && order.getPaymentMethod().name().equals("BANK_TRANSFER")) {
            html.append("<div style='background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 20px;'>");
            html.append("<h2 style='margin: 0 0 15px; font-size: 18px; color: #1e40af;'>💳 Hướng dẫn thanh toán</h2>");
            html.append("<p style='margin: 0 0 10px;'>Vui lòng chuyển khoản với nội dung:</p>");
            html.append("<p style='background: white; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 16px; text-align: center; margin: 0;'><strong>").append(order.getOrderCode()).append("</strong></p>");
            html.append("<p style='margin: 10px 0 0; font-size: 13px; color: #64748b;'>Đơn hàng sẽ được xử lý sau khi nhận được thanh toán.</p>");
            html.append("</div>");
        }
        
        html.append("</div>");
        
        // Footer
        html.append("<div style='background: #1e293b; color: white; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;'>");
        html.append("<p style='margin: 0 0 10px; font-weight: bold;'>Getabec - Giải pháp Cơ khí Chuyên nghiệp</p>");
        html.append("<p style='margin: 0; color: #94a3b8; font-size: 13px;'>Hotline: 0123.456.789 | Email: info@getabec.vn</p>");
        html.append("<p style='margin: 10px 0 0; color: #64748b; font-size: 12px;'>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>");
        html.append("</div>");
        
        html.append("</body></html>");
        
        return html.toString();
    }

    private String buildOrderStatusUpdateHtml(User customer, OrderDto order, String oldStatus) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang='vi'><head><meta charset='UTF-8'></head>");
        html.append("<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>");
        
        html.append("<div style='background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px;'>");
        html.append("<h1 style='margin: 0;'>📦 Cập nhật đơn hàng</h1>");
        html.append("<p style='margin: 10px 0 0;'>Mã đơn: <strong>").append(order.getOrderCode()).append("</strong></p>");
        html.append("</div>");
        
        html.append("<div style='padding: 25px;'>");
        html.append("<p>Xin chào <strong>").append(customer.getFullName()).append("</strong>,</p>");
        html.append("<p>Đơn hàng của bạn đã được cập nhật trạng thái:</p>");
        html.append("<p style='font-size: 18px; text-align: center; margin: 20px 0;'>");
        html.append("<span style='color: #64748b;'>").append(getStatusText(oldStatus)).append("</span>");
        html.append(" → ");
        html.append("<strong style='color: #2563eb;'>").append(getStatusText(order.getStatus().name())).append("</strong>");
        html.append("</p>");
        html.append("</div>");
        
        html.append("<div style='background: #f8fafc; padding: 20px; text-align: center; border-radius: 10px;'>");
        html.append("<p style='margin: 0;'>Cảm ơn bạn đã mua hàng tại Getabec!</p>");
        html.append("<p style='margin: 5px 0 0; color: #64748b;'>Hotline: 0123.456.789</p>");
        html.append("</div>");
        
        html.append("</body></html>");
        
        return html.toString();
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "0đ";
        return String.format("%,.0f", amount) + "đ";
    }

    private String getPaymentMethodText(PaymentMethod method) {
        if (method == null) return "Chưa chọn";
        return switch (method) {
            case COD -> "Thanh toán khi nhận hàng (COD)";
            case BANK_TRANSFER -> "Chuyển khoản ngân hàng";
            default -> method.name();
        };
    }


    private String getStatusText(String status) {
        if (status == null) return "Không xác định";
        return switch (status) {
            case "PENDING" -> "Đang xử lý";
            case "CONFIRMED" -> "Đã xác nhận";
            case "PROCESSING" -> "Đang chuẩn bị";
            case "SHIPPED" -> "Đang giao hàng";
            case "DELIVERED" -> "Đã giao hàng";
            case "CANCELLED" -> "Đã hủy";
            default -> status;
        };
    }
}
