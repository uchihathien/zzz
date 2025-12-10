package com.example.mecha.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu đặt lại mật khẩu")
public class ResetPasswordRequest {

    @Schema(description = "Mật khẩu mới", example = "NewPassword123")
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6-100 ký tự")
    private String newPassword;
}
