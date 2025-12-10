// shipping/dto/ShippingAddressDto.java
package com.example.mecha.shipping.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Địa chỉ giao hàng của khách")
public class ShippingAddressDto {

    private Long id;
    private String label;
    private String recipientName;
    private String phone;
    private String addressLine;
    private String city;
    private String district;
    private String ward;
    private boolean defaultAddress;
}
