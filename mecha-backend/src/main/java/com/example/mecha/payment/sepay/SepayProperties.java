// payment/sepay/SepayProperties.java
package com.example.mecha.payment.sepay;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "sepay")
@Getter
@Setter
public class SepayProperties {
    /**
     * API Key mà SePay dùng để gọi vào webhook của bạn.
     */
    private String apiKey;

    /**
     * Số tài khoản nhận tiền.
     */
    private String bankAccountNumber;

    /**
     * Tên ngân hàng (short name/ code theo SePay QR docs, ví dụ: Vietcombank / VCB).
     */
    private String bankName;

    /**
     * Tên chủ tài khoản.
     */
    private String accountHolderName;
}
