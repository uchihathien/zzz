// billing/BillingService.java
package com.example.mecha.billing;

import com.example.mecha.billing.dto.*;
import com.example.mecha.order.Order;
import com.example.mecha.order.OrderRepository;
import com.example.mecha.user.User;
import com.example.mecha.user.UserRole;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final QuotationRepository quotationRepository;
    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final PdfGeneratorService pdfGeneratorService;
    private final JavaMailSender mailSender;

    // ============= QUOTATION =============

    @Transactional
    public QuotationDto createQuotation(Long orderId, QuotationCreateRequest request, User currentUser) {
        Order order = getOrderWithAccessCheck(orderId, currentUser);

        BigDecimal totalAmount = order.getTotalAmount();
        Instant issueDate = Instant.now();

        Instant validUntil = request.getValidUntil();
        if (validUntil == null) {
            validUntil = issueDate.plus(7, ChronoUnit.DAYS);
        }

        Quotation quotation = Quotation.builder()
                .quoteNumber(generateQuoteNumber())
                .order(order)
                .issueDate(issueDate)
                .validUntil(validUntil)
                .totalAmount(totalAmount)
                .build();

        quotation = quotationRepository.save(quotation);
        return toDto(quotation);
    }

    @Transactional(readOnly = true)
    public QuotationDto getQuotation(Long id, User currentUser) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QUOTATION_NOT_FOUND"));

        checkOrderAccess(q.getOrder(), currentUser);
        return toDto(q);
    }

    @Transactional(readOnly = true)
    public List<QuotationDto> listQuotationsByOrder(Long orderId, User currentUser) {
        Order order = getOrderWithAccessCheck(orderId, currentUser);
        return quotationRepository.findByOrderId(order.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public byte[] getQuotationPdf(Long id, User currentUser) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QUOTATION_NOT_FOUND"));
        checkOrderAccess(q.getOrder(), currentUser);
        return pdfGeneratorService.generateQuotationPdf(q);
    }

    @Transactional
    public void sendQuotationEmail(Long id, SendPdfEmailRequest request, User currentUser) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QUOTATION_NOT_FOUND"));
        checkOrderAccess(q.getOrder(), currentUser);

        byte[] pdf = pdfGeneratorService.generateQuotationPdf(q);
        String subject = (request.getSubject() != null && !request.getSubject().isBlank())
                ? request.getSubject()
                : "Báo giá - " + q.getQuoteNumber();
        String body = (request.getBody() != null && !request.getBody().isBlank())
                ? request.getBody()
                : "Kính gửi quý khách,\n\nĐính kèm là báo giá cho đơn hàng " + q.getOrder().getOrderCode() + ".\n\nTrân trọng.";

        sendEmailWithAttachment(request.getTo(), subject, body,
                "quotation-" + q.getQuoteNumber() + ".pdf", pdf);
        // TODO: log vào email_logs (module notification)
    }

    private QuotationDto toDto(Quotation q) {
        return QuotationDto.builder()
                .id(q.getId())
                .quoteNumber(q.getQuoteNumber())
                .orderId(q.getOrder().getId())
                .orderCode(q.getOrder().getOrderCode())
                .issueDate(q.getIssueDate())
                .validUntil(q.getValidUntil())
                .totalAmount(q.getTotalAmount())
                .build();
    }

    private String generateQuoteNumber() {
        return "QUO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // ============= INVOICE =============

    @Transactional
    public InvoiceDto createInvoice(Long orderId, InvoiceCreateRequest request, User currentUser) {
        Order order = getOrderWithAccessCheck(orderId, currentUser);

        // Có thể ràng buộc: chỉ tạo invoice khi order đã DELIVERED, tùy business
        BigDecimal totalAmount = order.getTotalAmount();
        Instant issueDate = Instant.now();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .order(order)
                .issueDate(issueDate)
                .totalAmount(totalAmount)
                .build();

        invoice = invoiceRepository.save(invoice);
        return toDto(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceDto getInvoice(Long id, User currentUser) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "INVOICE_NOT_FOUND"));

        checkOrderAccess(inv.getOrder(), currentUser);
        return toDto(inv);
    }

    @Transactional(readOnly = true)
    public List<InvoiceDto> listInvoicesByOrder(Long orderId, User currentUser) {
        Order order = getOrderWithAccessCheck(orderId, currentUser);
        return invoiceRepository.findByOrderId(order.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public byte[] getInvoicePdf(Long id, User currentUser) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "INVOICE_NOT_FOUND"));
        checkOrderAccess(inv.getOrder(), currentUser);
        return pdfGeneratorService.generateInvoicePdf(inv);
    }

    @Transactional
    public void sendInvoiceEmail(Long id, SendPdfEmailRequest request, User currentUser) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "INVOICE_NOT_FOUND"));
        checkOrderAccess(inv.getOrder(), currentUser);

        byte[] pdf = pdfGeneratorService.generateInvoicePdf(inv);
        String subject = (request.getSubject() != null && !request.getSubject().isBlank())
                ? request.getSubject()
                : "Hóa đơn - " + inv.getInvoiceNumber();
        String body = (request.getBody() != null && !request.getBody().isBlank())
                ? request.getBody()
                : "Kính gửi quý khách,\n\nĐính kèm là hóa đơn cho đơn hàng " + inv.getOrder().getOrderCode() + ".\n\nTrân trọng.";

        sendEmailWithAttachment(request.getTo(), subject, body,
                "invoice-" + inv.getInvoiceNumber() + ".pdf", pdf);
        // TODO: log vào email_logs (module notification)
    }

    private InvoiceDto toDto(Invoice inv) {
        return InvoiceDto.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .orderId(inv.getOrder().getId())
                .orderCode(inv.getOrder().getOrderCode())
                .issueDate(inv.getIssueDate())
                .totalAmount(inv.getTotalAmount())
                .build();
    }

    private String generateInvoiceNumber() {
        return "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // ============= Helper: access control + email =============

    private Order getOrderWithAccessCheck(Long orderId, User currentUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND"));
        checkOrderAccess(order, currentUser);
        return order;
    }

    private void checkOrderAccess(Order order, User currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.STAFF) {
            return;
        }
        if (!order.getCustomer().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_ALLOWED");
        }
    }

    private void sendEmailWithAttachment(
            String to,
            String subject,
            String body,
            String attachmentName,
            byte[] pdfBytes
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);
            helper.addAttachment(attachmentName, new ByteArrayResource(pdfBytes));

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Error sending email", e);
        }
    }
}
