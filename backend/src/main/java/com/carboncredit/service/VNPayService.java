package com.carboncredit.service;

import com.carboncredit.config.VNPayConfig;
import com.carboncredit.entity.Transaction;
import com.carboncredit.util.VNPayUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig vnPayConfig;

    // Tỷ giá USD -> VND (cố định hoặc có thể lấy từ API)
    private static final int USD_TO_VND_RATE = 25000; // 1 USD = 25,000 VND

    public String createPaymentUrl(Transaction transaction, String ipAddress) {
        Map<String, String> vnpParams = new HashMap<>();

        vnpParams.put("vnp_Version", vnPayConfig.getVnpVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getVnpCommand());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());

        // Chuyển đổi từ USD sang VND, sau đó nhân 100 (đơn vị nhỏ nhất của VNPay)
        // Ví dụ: $10 -> 10 * 25000 = 250,000 VND -> 250,000 * 100 = 25,000,000
        long amountInVND = transaction.getAmount()
                .multiply(new java.math.BigDecimal(USD_TO_VND_RATE))
                .multiply(new java.math.BigDecimal(100))
                .longValue();

        vnpParams.put("vnp_Amount", String.valueOf(amountInVND));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", transaction.getId().toString());
        vnpParams.put("vnp_OrderInfo", "Thanh toan tin chi carbon: " + transaction.getId());
        vnpParams.put("vnp_OrderType", vnPayConfig.getVnpOrderType());
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
        vnpParams.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        String queryUrl = VNPayUtil.getPaymentURL(vnpParams, vnPayConfig.getVnpHashSecret());
        return vnPayConfig.getVnpUrl() + "?" + queryUrl;
    }

    public boolean verifyPayment(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String signValue = VNPayUtil.getPaymentURL(params, vnPayConfig.getVnpHashSecret());
        String[] parts = signValue.split("vnp_SecureHash=");
        if (parts.length > 1) {
            String calculatedHash = parts[1];
            return calculatedHash.equals(vnpSecureHash);
        }
        return false;
    }
}
