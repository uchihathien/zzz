// billing/PdfGeneratorService.java
package com.example.mecha.billing;

import com.example.mecha.order.Order;
import com.example.mecha.order.OrderItem;
import com.example.mecha.order.OrderItemRepository; // nếu cần, nhưng ta dùng order.getItems()
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PdfGeneratorService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                    .withLocale(new Locale("vi", "VN"))
                    .withZone(ZoneId.systemDefault());

    public byte[] generateQuotationPdf(Quotation quotation) {
        Order order = quotation.getOrder();
        return generateOrderBasedPdf(
                "BÁO GIÁ",
                "Quotation: " + quotation.getQuoteNumber(),
                quotation.getIssueDate(),
                quotation.getValidUntil(),
                quotation.getTotalAmount(),
                order
        );
    }

    public byte[] generateInvoicePdf(Invoice invoice) {
        Order order = invoice.getOrder();
        return generateOrderBasedPdf(
                "HÓA ĐƠN",
                "Invoice: " + invoice.getInvoiceNumber(),
                invoice.getIssueDate(),
                null,
                invoice.getTotalAmount(),
                order
        );
    }

    private byte[] generateOrderBasedPdf(
            String title,
            String subTitle,
            java.time.Instant issueDate,
            java.time.Instant extraDate, // validUntil, nếu có
            BigDecimal totalAmount,
            Order order
    ) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, baos);

            document.open();

            // Title
            Paragraph pTitle = new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18));
            pTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(pTitle);

            Paragraph pSub = new Paragraph(subTitle, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
            pSub.setAlignment(Element.ALIGN_CENTER);
            document.add(pSub);

            document.add(new Paragraph(" "));

            // Info khách + đơn hàng
            document.add(new Paragraph("Mã đơn hàng: " + order.getOrderCode()));
            document.add(new Paragraph("Khách hàng: " + order.getCustomer().getFullName() + " (" + order.getCustomer().getEmail() + ")"));
            document.add(new Paragraph("Số điện thoại: " + order.getContactPhone()));
            document.add(new Paragraph("Địa chỉ: " + order.getShippingAddress()));

            document.add(new Paragraph("Ngày lập: " + DATE_FORMAT.format(issueDate)));

            if (extraDate != null) {
                document.add(new Paragraph("Hiệu lực đến: " + DATE_FORMAT.format(extraDate)));
            }

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Chi tiết:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            document.add(new Paragraph(" "));

            // Bảng items
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1, 4, 1.5f, 2, 2});

            addTableHeader(table, "STT");
            addTableHeader(table, "Mô tả");
            addTableHeader(table, "SL");
            addTableHeader(table, "Đơn giá");
            addTableHeader(table, "Thành tiền");

            int index = 1;
            for (OrderItem item : order.getItems()) {
                String desc;
                if (item.getProduct() != null) {
                    desc = "[SP] " + item.getProduct().getName();
                } else if (item.getService() != null) {
                    desc = "[DV] " + item.getService().getName();
                } else {
                    desc = "Item";
                }

                addTableCell(table, String.valueOf(index++));
                addTableCell(table, desc);
                addTableCell(table, String.valueOf(item.getQuantity()));
                addTableCell(table, item.getUnitPrice().toPlainString());
                addTableCell(table, item.getLineTotal().toPlainString());
            }

            document.add(table);

            document.add(new Paragraph(" "));
            Paragraph total = new Paragraph("Tổng tiền: " + totalAmount.toPlainString(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Xin cảm ơn quý khách!", FontFactory.getFont(FontFactory.HELVETICA, 11)));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA, 10)));
        table.addCell(cell);
    }
}
