// shipping/dto/ShippingAddressCreateRequest.java
package com.example.mecha.shipping.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu tạo mới địa chỉ giao hàng")
public class ShippingAddressCreateRequest {

    @Schema(description = "Nhãn địa chỉ (Nhà, Cơ quan,...)", example = "Nhà")
    @Size(max = 100, message = "label không được dài quá 100 ký tự")
    private String label;

    @Schema(description = "Tên người nhận", example = "Nguyễn Văn A")
    @NotBlank(message = "recipientName không được để trống")
    @Size(max = 255, message = "recipientName không được dài quá 255 ký tự")
    private String recipientName;

    @Schema(description = "Số điện thoại", example = "0909123456")
    @NotBlank(message = "phone không được để trống")
    @Size(max = 50, message = "phone không được dài quá 50 ký tự")
    private String phone;

    @Schema(description = "Địa chỉ chi tiết", example = "123 Đường ABC, Phường X, Quận 1")
    @NotBlank(message = "addressLine không được để trống")
    @Size(max = 500, message = "addressLine không được dài quá 500 ký tự")
    private String addressLine;

    @Schema(description = "Tỉnh/Thành phố", example = "TP.HCM")
    @Size(max = 100, message = "city không được dài quá 100 ký tự")
    private String city;

    @Schema(description = "Quận/Huyện", example = "Quận 1")
    @Size(max = 100, message = "district không được dài quá 100 ký tự")
    private String district;

    @Schema(description = "Phường/Xã", example = "Phường Bến Nghé")
    @Size(max = 100, message = "ward không được dài quá 100 ký tự")
    private String ward;

    @Schema(description = "Có đặt làm địa chỉ mặc định không", example = "true")
    private Boolean defaultAddress;
}
