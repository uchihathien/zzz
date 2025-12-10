// cart/CartService.java
package com.example.mecha.cart;

import com.example.mecha.cart.dto.*;
import com.example.mecha.product.Product;
import com.example.mecha.product.ProductRepository;
import com.example.mecha.product.ProductService;
import com.example.mecha.servicecatalog.ServiceEntity;
import com.example.mecha.servicecatalog.ServiceRepository;
import com.example.mecha.servicecatalog.ServiceStatus;
import com.example.mecha.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final ServiceRepository serviceRepository;

    @Transactional
    public CartDto getMyCart(User currentUser) {
        Cart cart = getOrCreateCart(currentUser);
        return toDto(cart);
    }

    @Transactional
    public CartDto addItem(User currentUser, CartItemAddRequest request) {
        Cart cart = getOrCreateCart(currentUser);

        // Validate cross-field: PRODUCT → cần productId, SERVICE → cần serviceId
        if (request.getItemType() == CartItemType.PRODUCT && request.getProductId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "productId_required_for_PRODUCT");
        }
        if (request.getItemType() == CartItemType.SERVICE && request.getServiceId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "serviceId_required_for_SERVICE");
        }

        int quantity = request.getQuantity();

        CartItem item = CartItem.builder()
                .cart(cart)
                .itemType(request.getItemType())
                .quantity(quantity)
                .build();

        if (request.getItemType() == CartItemType.PRODUCT) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND"));

            // Kiểm tra tồn kho
            if (product.getStockQuantity() < quantity) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK");
            }

            BigDecimal unitPrice = productService.calculateUnitPrice(product.getId(), quantity);

            item.setProduct(product);
            item.setUnitPrice(unitPrice);
            item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        } else { // SERVICE
            ServiceEntity service = serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND"));

            if (service.getStatus() != ServiceStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SERVICE_NOT_ACTIVE");
            }

            BigDecimal unitPrice = service.getBasePrice();

            item.setService(service);
            item.setUnitPrice(unitPrice);
            item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        }

        cart.addItem(item);
        cartRepository.save(cart); // cascade CartItem

        return toDto(cart);
    }

    @Transactional
    public CartDto updateItem(User currentUser, Long itemId, CartItemUpdateRequest request) {
        Cart cart = getOrCreateCart(currentUser);
        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CART_ITEM_NOT_FOUND"));

        int newQty = request.getQuantity();
        item.setQuantity(newQty);

        if (item.getItemType() == CartItemType.PRODUCT) {
            Product product = item.getProduct();
            // Kiểm tra tồn kho
            if (product.getStockQuantity() < newQty) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK");
            }
            BigDecimal unitPrice = productService.calculateUnitPrice(product.getId(), newQty);
            item.setUnitPrice(unitPrice);
            item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(newQty)));
        } else {
            ServiceEntity service = item.getService();
            if (service.getStatus() != ServiceStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SERVICE_NOT_ACTIVE");
            }
            BigDecimal unitPrice = service.getBasePrice();
            item.setUnitPrice(unitPrice);
            item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(newQty)));
        }

        return toDto(cart);
    }

    @Transactional
    public CartDto removeItem(User currentUser, Long itemId) {
        Cart cart = getOrCreateCart(currentUser);
        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CART_ITEM_NOT_FOUND"));
        cart.removeItem(item);
        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public CartDto clearCart(User currentUser) {
        Cart cart = getOrCreateCart(currentUser);
        if (cart.getItems() != null) {
            cart.getItems().clear();
        }
        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public void clearCart(Cart cart) {
        if (cart.getItems() != null) {
            cart.getItems().clear();
        }
        cartRepository.save(cart);
    }


    @Transactional(readOnly = true)
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .user(user)
                                .build()
                ));
    }

    private CartDto toDto(Cart cart) {
        List<CartItem> cartItems = cart.getItems();
        if (cartItems == null) {
            cartItems = new java.util.ArrayList<>();
        }
        
        List<CartItemDto> itemDtos = cartItems.stream().map(ci -> {
            String productName = ci.getProduct() != null ? ci.getProduct().getName() : null;
            String serviceName = ci.getService() != null ? ci.getService().getName() : null;

            return CartItemDto.builder()
                    .id(ci.getId())
                    .itemType(ci.getItemType())
                    .productId(ci.getProduct() != null ? ci.getProduct().getId() : null)
                    .productName(productName)
                    .serviceId(ci.getService() != null ? ci.getService().getId() : null)
                    .serviceName(serviceName)
                    .quantity(ci.getQuantity())
                    .unitPrice(ci.getUnitPrice())
                    .lineTotal(ci.getLineTotal())
                    .build();
        }).toList();


        BigDecimal total = itemDtos.stream()
                .map(CartItemDto::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDto.builder()
                .id(cart.getId())
                .items(itemDtos)
                .totalItems(itemDtos.size())
                .totalAmount(total)
                .build();
    }
}
