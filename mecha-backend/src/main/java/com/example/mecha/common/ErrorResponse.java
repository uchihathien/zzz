package com.example.mecha.common;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorResponse {
    private boolean success;
    private String code;     // mã lỗi FE có thể switch-case
    private String message;  // text hiển thị cho user
}
