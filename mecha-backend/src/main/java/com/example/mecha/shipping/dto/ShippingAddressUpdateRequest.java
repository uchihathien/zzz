// shipping/dto/ShippingAddressUpdateRequest.java
package com.example.mecha.shipping.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu cập nhật địa chỉ giao hàng")
public class ShippingAddressUpdateRequest {

    @Schema(description = "Nhãn địa chỉ", example = "Nhà (update)")
    @Size(max = 100, message = "label không được dài quá 100 ký tự")
    private String label;

    @Schema(description = "Tên người nhận", example = "Nguyễn Văn B")
    @Size(max = 255, message = "recipientName không được dài quá 255 ký tự")
    private String recipientName;

    @Schema(description = "Số điện thoại", example = "0909345678")
    @Size(max = 50, message = "phone không được dài quá 50 ký tự")
    private String phone;

    @Schema(description = "Địa chỉ chi tiết")
    @Size(max = 500, message = "addressLine không được dài quá 500 ký tự")
    private String addressLine;

    @Schema(description = "Tỉnh/Thành phố")
    @Size(max = 100, message = "city không được dài quá 100 ký tự")
    private String city;

    @Schema(description = "Quận/Huyện")
    @Size(max = 100, message = "district không được dài quá 100 ký tự")
    private String district;

    @Schema(description = "Phường/Xã")
    @Size(max = 100, message = "ward không được dài quá 100 ký tự")
    private String ward;

    @Schema(description = "Có đặt làm mặc định không", example = "true")
    private Boolean defaultAddress;
}
