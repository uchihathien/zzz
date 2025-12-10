// order/OrderService.java
package com.example.mecha.order;

import com.example.mecha.cart.Cart;
import com.example.mecha.cart.CartItem;
import com.example.mecha.cart.CartItemType;
import com.example.mecha.cart.CartService;
import com.example.mecha.order.dto.OrderCreateRequest;
import com.example.mecha.order.dto.OrderDto;
import com.example.mecha.order.dto.OrderItemDto;
import com.example.mecha.product.Product;
import com.example.mecha.product.ProductRepository;
import com.example.mecha.shipping.ShippingAddress;
import com.example.mecha.shipping.ShippingAddressService;
import com.example.mecha.user.User;
import com.example.mecha.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final ShippingAddressService shippingAddressService;
    private final OrderEmailService orderEmailService;


    @Transactional
    public OrderDto checkout(User currentUser, OrderCreateRequest request) {
        Cart cart = cartService.getOrCreateCart(currentUser);

        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CART_IS_EMPTY");
        }

        // Lấy địa chỉ giao hàng
        String shippingAddressText;
        String contactPhoneText;

        if (request.getShippingAddressId() != null) {
            ShippingAddress addr = shippingAddressService.getAddressEntity(currentUser, request.getShippingAddressId());
            // Build full address from all components
            shippingAddressText = buildFullAddress(addr);
            contactPhoneText = addr.getPhone();
        } else {
            if (request.getShippingAddress() == null || request.getShippingAddress().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "shippingAddress_required");
            }
            if (request.getContactPhone() == null || request.getContactPhone().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "contactPhone_required");
            }
            shippingAddressText = request.getShippingAddress();
            contactPhoneText = request.getContactPhone();
        }

        // Check tồn kho product
        for (CartItem item : cart.getItems()) {
            if (item.getItemType() == CartItemType.PRODUCT) {
                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND"));

                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK");
                }
            }
        }

        // Tổng tiền
        BigDecimal total = cart.getItems().stream()
                .map(CartItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .customer(currentUser)
                .orderCode(generateOrderCode())
                .totalAmount(total)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .status(OrderStatus.PENDING)
                .shippingAddress(shippingAddressText)
                .contactPhone(contactPhoneText)
                .note(request.getNote())
                .build();

        order = orderRepository.save(order);

        // Order items + trừ tồn kho
        for (CartItem ci : cart.getItems()) {
            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .itemType(ci.getItemType())
                    .product(ci.getProduct())
                    .service(ci.getService())
                    .quantity(ci.getQuantity())
                    .unitPrice(ci.getUnitPrice())
                    .lineTotal(ci.getLineTotal())
                    .build();
            orderItemRepository.save(oi);

            if (ci.getItemType() == CartItemType.PRODUCT) {
                Product product = ci.getProduct();
                product.setStockQuantity(product.getStockQuantity() - ci.getQuantity());
                productRepository.save(product);
            }
        }

        // Clear cart
        cartService.clearCart(cart);

        // Gửi email xác nhận đơn hàng
        OrderDto orderDto = toDto(order);
        orderEmailService.sendOrderConfirmationEmail(currentUser, orderDto);

        return orderDto;
    }


    @Transactional(readOnly = true)
    public List<OrderDto> listMyOrders(User currentUser) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(currentUser.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public OrderDto getByIdForUser(Long id, User currentUser) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND"));


        if (!canView(order, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_ALLOWED");
        }
        return toDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> adminSearch(
            OrderStatus status,
            PaymentStatus paymentStatus,
            Instant from,
            Instant to
    ) {
        List<Order> orders;
        
        // Nếu tất cả params là null, lấy tất cả orders
        if (status == null && paymentStatus == null && from == null && to == null) {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        } else {
            // Filter trong Java thay vì dùng query với null params
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
            orders = orders.stream()
                .filter(o -> status == null || o.getStatus() == status)
                .filter(o -> paymentStatus == null || o.getPaymentStatus() == paymentStatus)
                .filter(o -> from == null || (o.getCreatedAt() != null && !o.getCreatedAt().isBefore(from)))
                .filter(o -> to == null || (o.getCreatedAt() != null && !o.getCreatedAt().isAfter(to)))
                .toList();
        }
        
        return orders.stream().map(this::toDto).toList();
    }

    @Transactional
    public OrderDto updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND"));
        order.setStatus(newStatus);
        return toDto(order);
    }

    @Transactional
    public OrderDto updatePaymentStatus(Long id, PaymentStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND"));
        order.setPaymentStatus(newStatus);
        return toDto(order);
    }

    @Transactional
    public OrderDto cancelOrderByUser(Long id, User currentUser) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND"));

        // Check ownership
        if (!order.getCustomer().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NOT_ALLOWED");
        }

        // Only allow cancel PENDING orders
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CANNOT_CANCEL_ORDER");
        }

        order.setStatus(OrderStatus.CANCELLED);
        
        // If payment was pending, mark as failed
        if (order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.FAILED);
        }

        order.setNote((order.getNote() != null ? order.getNote() + " | " : "") + "Khách hàng hủy đơn");
        
        return toDto(order);
    }


    private boolean canView(Order order, User currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.STAFF) {
            return true;
        }
        return order.getCustomer().getId().equals(currentUser.getId());
    }

    private String generateOrderCode() {
        // Đơn giản: ORD-<random> (có thể thay bằng pattern đẹp hơn)
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Build full shipping address from ShippingAddress entity
     * Format: addressLine, ward, district, city
     */
    private String buildFullAddress(ShippingAddress addr) {
        StringBuilder sb = new StringBuilder();
        
        if (addr.getAddressLine() != null && !addr.getAddressLine().isBlank()) {
            sb.append(addr.getAddressLine());
        }
        
        if (addr.getWard() != null && !addr.getWard().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(addr.getWard());
        }
        
        if (addr.getDistrict() != null && !addr.getDistrict().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(addr.getDistrict());
        }
        
        if (addr.getCity() != null && !addr.getCity().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(addr.getCity());
        }
        
        return sb.length() > 0 ? sb.toString() : "Không có địa chỉ";
    }

    private OrderDto toDto(Order o) {
        List<OrderItem> orderItems = o.getItems();
        if (orderItems == null) {
            orderItems = new java.util.ArrayList<>();
        }
        List<OrderItemDto> itemDtos = orderItems.stream().map(oi -> {
            String productName = oi.getProduct() != null ? oi.getProduct().getName() : null;
            String serviceName = oi.getService() != null ? oi.getService().getName() : null;

            return OrderItemDto.builder()
                    .id(oi.getId())
                    .itemType(oi.getItemType())
                    .productId(oi.getProduct() != null ? oi.getProduct().getId() : null)
                    .productName(productName)
                    .serviceId(oi.getService() != null ? oi.getService().getId() : null)
                    .serviceName(serviceName)
                    .quantity(oi.getQuantity())
                    .unitPrice(oi.getUnitPrice())
                    .lineTotal(oi.getLineTotal())
                    .build();
        }).toList();

        return OrderDto.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .customerId(o.getCustomer().getId())
                .customerName(o.getCustomer().getFullName())
                .totalAmount(o.getTotalAmount())
                .paymentMethod(o.getPaymentMethod())
                .paymentStatus(o.getPaymentStatus())
                .status(o.getStatus())
                .shippingAddress(o.getShippingAddress())
                .contactPhone(o.getContactPhone())
                .note(o.getNote())
                .createdAt(o.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}
