package com.carboncredit.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

@Configuration
@Getter
public class VNPayConfig {
    @Value("${vnpay.url}")
    private String vnpUrl;

    @Value("${vnpay.return-url}")
    private String vnpReturnUrl;

    @Value("${vnpay.tmn-code}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnpHashSecret;

    @Value("${vnpay.api-url}")
    private String vnpApiUrl;

    @Value("${vnpay.version}")
    private String vnpVersion = "2.1.0";

    @Value("${vnpay.command}")
    private String vnpCommand = "pay";

    @Value("${vnpay.order-type}")
    private String vnpOrderType = "other";
}
