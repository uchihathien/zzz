// shipping/ShippingAddressService.java
package com.example.mecha.shipping;

import com.example.mecha.shipping.dto.*;
import com.example.mecha.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShippingAddressService {

    private static final int MAX_ADDRESSES_PER_USER = 3;

    private final ShippingAddressRepository shippingAddressRepository;

    @Transactional(readOnly = true)
    public List<ShippingAddressDto> listMyAddresses(User currentUser) {
        return shippingAddressRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public ShippingAddressDto createAddress(User currentUser, ShippingAddressCreateRequest request) {
        Long count = shippingAddressRepository.countByUserId(currentUser.getId());
        if (count >= MAX_ADDRESSES_PER_USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "MAX_3_SHIPPING_ADDRESSES");
        }

        boolean setDefault = Boolean.TRUE.equals(request.getDefaultAddress());

        ShippingAddress address = ShippingAddress.builder()
                .user(currentUser)
                .label(request.getLabel())
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .district(request.getDistrict())
                .ward(request.getWard())
                .defaultAddress(setDefault)
                .build();

        // Nếu set default = true thì bỏ default ở các địa chỉ khác
        if (setDefault) {
            unsetDefaultForUser(currentUser.getId());
        } else if (count == 0) {
            // địa chỉ đầu tiên auto default
            address.setDefaultAddress(true);
        }

        address = shippingAddressRepository.save(address);
        return toDto(address);
    }

    @Transactional
    public ShippingAddressDto updateAddress(User currentUser, Long id, ShippingAddressUpdateRequest request) {
        ShippingAddress address = shippingAddressRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ADDRESS_NOT_FOUND"));

        if (request.getLabel() != null) address.setLabel(request.getLabel());
        if (request.getRecipientName() != null) address.setRecipientName(request.getRecipientName());
        if (request.getPhone() != null) address.setPhone(request.getPhone());
        if (request.getAddressLine() != null) address.setAddressLine(request.getAddressLine());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getDistrict() != null) address.setDistrict(request.getDistrict());
        if (request.getWard() != null) address.setWard(request.getWard());

        if (request.getDefaultAddress() != null) {
            boolean setDefault = request.getDefaultAddress();
            if (setDefault) {
                unsetDefaultForUser(currentUser.getId());
                address.setDefaultAddress(true);
            } else {
                address.setDefaultAddress(false);
            }
        }

        return toDto(address);
    }

    @Transactional
    public void deleteAddress(User currentUser, Long id) {
        ShippingAddress address = shippingAddressRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ADDRESS_NOT_FOUND"));

        boolean wasDefault = address.isDefaultAddress();
        shippingAddressRepository.delete(address);

        // Nếu xóa default → có thể auto set default cho 1 địa chỉ còn lại
        if (wasDefault) {
            List<ShippingAddress> remaining = shippingAddressRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
            if (!remaining.isEmpty()) {
                ShippingAddress first = remaining.get(0);
                first.setDefaultAddress(true);
            }
        }
    }

    @Transactional
    public ShippingAddressDto setDefault(User currentUser, Long id) {
        ShippingAddress address = shippingAddressRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ADDRESS_NOT_FOUND"));

        unsetDefaultForUser(currentUser.getId());
        address.setDefaultAddress(true);
        return toDto(address);
    }

    @Transactional(readOnly = true)
    public ShippingAddress getAddressEntity(User currentUser, Long id) {
        return shippingAddressRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ADDRESS_NOT_FOUND"));
    }

    @Transactional(readOnly = true)
    public ShippingAddress getDefaultAddressEntity(User currentUser) {
        return shippingAddressRepository.findByUserIdAndDefaultAddressTrue(currentUser.getId())
                .orElse(null);
    }

    private void unsetDefaultForUser(Long userId) {
        shippingAddressRepository.findByUserIdAndDefaultAddressTrue(userId)
                .ifPresent(addr -> addr.setDefaultAddress(false));
    }

    private ShippingAddressDto toDto(ShippingAddress a) {
        return ShippingAddressDto.builder()
                .id(a.getId())
                .label(a.getLabel())
                .recipientName(a.getRecipientName())
                .phone(a.getPhone())
                .addressLine(a.getAddressLine())
                .city(a.getCity())
                .district(a.getDistrict())
                .ward(a.getWard())
                .defaultAddress(a.isDefaultAddress())
                .build();
    }
}
