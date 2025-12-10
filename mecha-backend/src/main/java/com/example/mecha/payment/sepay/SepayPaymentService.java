// payment/sepay/SepayPaymentService.java
package com.example.mecha.payment.sepay;

import com.example.mecha.booking.Booking;
import com.example.mecha.booking.BookingRepository;
import com.example.mecha.order.Order;
import com.example.mecha.order.OrderRepository;
import com.example.mecha.order.OrderStatus;
import com.example.mecha.order.PaymentMethod;
import com.example.mecha.order.PaymentStatus;
import com.example.mecha.payment.sepay.dto.SepayPaymentInfoDto;
import com.example.mecha.payment.sepay.dto.SepayWebhookRequest;
import com.example.mecha.user.User;
import com.example.mecha.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class SepayPaymentService {

    private static final Logger log = LoggerFactory.getLogger(SepayPaymentService.class);

    private static final DateTimeFormatter SEPAY_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final SepayProperties sepayProperties;
    private final SepayTransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;


    // ============= API cho FE: lấy thông tin chuyển khoản =============

    @Transactional(readOnly = true)
    public SepayPaymentInfoDto getPaymentInfo(Long orderId, User currentUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND"));

        // Quyền xem: chủ đơn, staff, admin
        if (!order.getCustomer().getId().equals(currentUser.getId())
                && currentUser.getRole() != UserRole.ADMIN
                && currentUser.getRole() != UserRole.STAFF) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_ALLOWED");
        }

        if (order.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ORDER_NOT_BANK_TRANSFER");
        }

        String acc = sepayProperties.getBankAccountNumber();
        String bank = sepayProperties.getBankName();
        String content = order.getOrderCode(); // dùng orderCode làm mã thanh toán

        BigDecimal amount = order.getTotalAmount();

        // build QR url theo docs SePay: https://qr.sepay.vn/img?acc=...&bank=...&amount=...&des=...
        String qrUrl = String.format(
                "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
                urlEncode(acc),
                urlEncode(bank),
                amount.toPlainString(),
                urlEncode(content)
        );

        return SepayPaymentInfoDto.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .amount(amount)
                .bankAccountNumber(acc)
                .bankName(bank)
                .accountHolderName(sepayProperties.getAccountHolderName())
                .transferContent(content)
                .qrImageUrl(qrUrl)
                .build();
    }

    // ============= API cho FE: lấy thông tin chuyển khoản cho Booking =============

    @Transactional(readOnly = true)
    public SepayPaymentInfoDto getBookingPaymentInfo(Long bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND"));

        // Quyền xem: chủ booking, staff, admin
        if (!booking.getCustomer().getId().equals(currentUser.getId())
                && currentUser.getRole() != UserRole.ADMIN
                && currentUser.getRole() != UserRole.STAFF) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_ALLOWED");
        }

        if (booking.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "BOOKING_NOT_BANK_TRANSFER");
        }

        String acc = sepayProperties.getBankAccountNumber();
        String bank = sepayProperties.getBankName();
        String content = "BOOKING" + booking.getId(); // mã thanh toán cho booking

        BigDecimal amount = booking.getPriceAtBooking();

        // build QR url theo docs SePay
        String qrUrl = String.format(
                "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
                urlEncode(acc),
                urlEncode(bank),
                amount.toPlainString(),
                urlEncode(content)
        );

        return SepayPaymentInfoDto.builder()
                .orderId(booking.getId()) // using orderId field for bookingId
                .orderCode(content)
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .amount(amount)
                .bankAccountNumber(acc)
                .bankName(bank)
                .accountHolderName(sepayProperties.getAccountHolderName())
                .transferContent(content)
                .qrImageUrl(qrUrl)
                .build();
    }

    // ============= Xử lý Webhook từ SePay =============


    /**
     * Handle webhook từ SePay:
     *  - Xác thực API Key
     *  - Log & chống trùng lặp giao dịch
     *  - Nếu có code = orderCode & transferType = in & amount >= totalAmount => set PAID.
     */
    @Transactional
    public String handleWebhook(SepayWebhookRequest request, String authorizationHeader) {

        // 1. Xác thực API Key
        validateApiKey(authorizationHeader);

        if (request.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "MISSING_ID");
        }

        log.info("Sepay webhook received: id={}, code={}, content={}, amount={}, transferType={}",
                request.getId(), request.getCode(), request.getContent(), 
                request.getTransferAmount(), request.getTransferType());

        // 2. Chống trùng lặp: nếu đã nhận sepay_id này rồi thì bỏ qua (idempotent)
        if (transactionRepository.findBySepayId(request.getId()).isPresent()) {
            log.info("Sepay webhook duplicate id={}, ignore", request.getId());
            return "DUPLICATE";
        }

        // 3. Log transaction
        SepayTransaction transaction = toEntity(request);

        // 4. Cố gắng map với Order bằng code = orderCode
        Order matchedOrder = null;
        
        // 4a. Thử match bằng code trước
        if (request.getCode() != null && !request.getCode().isBlank()) {
            matchedOrder = orderRepository.findByOrderCode(request.getCode()).orElse(null);
            if (matchedOrder != null) {
                log.info("Matched order by code: {}", request.getCode());
            }
        }
        
        // 4b. Nếu không có code hoặc không match, thử parse từ content
        if (matchedOrder == null && request.getContent() != null && !request.getContent().isBlank()) {
            matchedOrder = tryParseOrderFromContent(request.getContent());
            if (matchedOrder != null) {
                log.info("Matched order by content parsing: {}", matchedOrder.getOrderCode());
            }
        }
        
        // 4c. Thử parse từ description nếu vẫn không match
        if (matchedOrder == null && request.getDescription() != null && !request.getDescription().isBlank()) {
            matchedOrder = tryParseOrderFromContent(request.getDescription());
            if (matchedOrder != null) {
                log.info("Matched order by description parsing: {}", matchedOrder.getOrderCode());
            }
        }
        
        if (matchedOrder != null) {
            transaction.setOrder(matchedOrder);
            applyPaymentIfMatched(matchedOrder, transaction);
        } else {
            log.warn("Sepay webhook: no order matched. code={}, content={}", 
                    request.getCode(), request.getContent());
        }

        transactionRepository.save(transaction);
        return "OK";
    }
    
    /**
     * Thử parse orderCode từ nội dung chuyển khoản.
     * OrderCode có format: ORD-XXXXXXXX (8 ký tự hex uppercase)
     * Nhưng nội dung CK có thể bị mất dấu - thành ORDXXXXXXXX
     */
    private Order tryParseOrderFromContent(String content) {
        if (content == null) return null;
        
        // Pattern 1: ORD-[A-Z0-9]{8} (format chuẩn)
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("ORD-[A-Z0-9]{8}", java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher matcher = pattern.matcher(content);
        
        while (matcher.find()) {
            String potentialCode = matcher.group().toUpperCase();
            log.info("Found potential order code (with dash): {}", potentialCode);
            var order = orderRepository.findByOrderCode(potentialCode);
            if (order.isPresent()) {
                return order.get();
            }
        }
        
        // Pattern 2: ORD[A-Z0-9]{8} (không có dấu -, do nội dung CK bị mất)
        pattern = java.util.regex.Pattern.compile("ORD([A-Z0-9]{8})", java.util.regex.Pattern.CASE_INSENSITIVE);
        matcher = pattern.matcher(content);
        
        while (matcher.find()) {
            // Normalize: thêm dấu - vào giữa
            String withoutDash = matcher.group().toUpperCase();
            String potentialCode = "ORD-" + withoutDash.substring(3); // ORD + 8chars -> ORD-8chars
            log.info("Found potential order code (without dash): {} -> normalized to {}", withoutDash, potentialCode);
            var order = orderRepository.findByOrderCode(potentialCode);
            if (order.isPresent()) {
                return order.get();
            }
        }
        
        // Thử match BOOKING pattern
        pattern = java.util.regex.Pattern.compile("BOOKING(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE);
        matcher = pattern.matcher(content);
        
        if (matcher.find()) {
            // Đây là thanh toán booking, không phải order
            log.info("Found booking payment pattern in content: {}", matcher.group());
        }
        
        return null;
    }

    // ============= Helper methods =============

    private void validateApiKey(String authorizationHeader) {
        log.info("Webhook Authorization header received: '{}'", 
                authorizationHeader != null ? authorizationHeader.substring(0, Math.min(authorizationHeader.length(), 20)) + "..." : "null");
        
        String expectedApiKey = sepayProperties.getApiKey();
        if (expectedApiKey == null || expectedApiKey.isBlank()) {
            log.warn("SEPAY_API_KEY not configured, skipping validation");
            return; // Skip validation if not configured
        }

        // SePay có thể không gửi Authorization header, trong trường hợp đó skip validation
        // Trong production, nên cấu hình SePay gửi API key và bật validation
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            log.warn("No Authorization header received from SePay webhook, skipping validation. " +
                    "Configure SePay to send 'Authorization: Apikey <key>' for better security.");
            return; // Skip validation if no header (SePay might not be configured to send it)
        }
        
        // Check if header starts with "Apikey " (SePay format)
        if (!authorizationHeader.startsWith("Apikey ")) {
            log.warn("Authorization header doesn't start with 'Apikey ': {}", authorizationHeader);
            // Still allow for now, but log warning
            return;
        }

        String incoming = authorizationHeader.substring("Apikey ".length()).trim();
        if (!expectedApiKey.equals(incoming)) {
            log.error("Invalid API key received");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "INVALID_API_KEY");
        }
        
        log.info("API key validation successful");
    }

    private SepayTransaction toEntity(SepayWebhookRequest req) {
        Instant txTime = null;
        try {
            if (req.getTransactionDate() != null) {
                LocalDateTime ldt = LocalDateTime.parse(req.getTransactionDate(), SEPAY_DATE_FORMAT);
                txTime = ldt.atZone(ZoneId.systemDefault()).toInstant();
            }
        } catch (Exception e) {
            log.warn("Cannot parse transactionDate: {}", req.getTransactionDate());
        }

        return SepayTransaction.builder()
                .sepayId(req.getId())
                .gateway(req.getGateway())
                .transactionDate(txTime)
                .accountNumber(req.getAccountNumber())
                .code(req.getCode())
                .content(req.getContent())
                .transferType(req.getTransferType())
                .transferAmount(req.getTransferAmount())
                .accumulated(req.getAccumulated())
                .subAccount(req.getSubAccount())
                .referenceCode(req.getReferenceCode())
                .description(req.getDescription())
                .build();
    }

    private void applyPaymentIfMatched(Order order, SepayTransaction tx) {
        log.info("applyPaymentIfMatched: orderCode={}, paymentMethod={}, paymentStatus={}, orderStatus={}, txAmount={}, transferType={}",
                order.getOrderCode(), order.getPaymentMethod(), order.getPaymentStatus(), 
                order.getStatus(), tx.getTransferAmount(), tx.getTransferType());
        
        // chỉ xử lý tiền vào
        if (!"in".equalsIgnoreCase(tx.getTransferType())) {
            log.warn("Skipped: transferType is not 'in', got '{}'", tx.getTransferType());
            return;
        }

        if (order.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
            log.warn("Skipped: paymentMethod is not BANK_TRANSFER, got '{}'", order.getPaymentMethod());
            return;
        }

        // chỉ xử lý nếu còn pending
        if (order.getPaymentStatus() != PaymentStatus.PENDING) {
            log.warn("Skipped: paymentStatus is not PENDING, got '{}'", order.getPaymentStatus());
            return;
        }

        BigDecimal txAmount = tx.getTransferAmount();
        if (txAmount == null) {
            log.warn("Skipped: txAmount is null");
            return;
        }

        // đơn giản: chỉ cần >= totalAmount
        if (txAmount.compareTo(order.getTotalAmount()) < 0) {
            log.warn("Payment amount less than order total. orderCode={}, total={}, txAmount={}",
                    order.getOrderCode(), order.getTotalAmount(), txAmount);
            return;
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        // Chỉ cập nhật paymentStatus, không tự động đổi order status
        // Admin sẽ chuyển sang DELIVERED khi đã giao hàng

        log.info("Order {} paid via SePay txId={}, amount={}", order.getOrderCode(), tx.getSepayId(), txAmount);
    }

    private String urlEncode(String value) {
        try {
            return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return value;
        }
    }
}
