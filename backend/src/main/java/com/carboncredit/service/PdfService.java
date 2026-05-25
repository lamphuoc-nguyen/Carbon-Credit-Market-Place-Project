package com.carboncredit.service;

import com.carboncredit.entity.Certificate; // <<< Import Entity
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
// Bỏ import Map vì không dùng nữa

@Service
@Slf4j
@RequiredArgsConstructor
public class PdfService {

    private final TemplateEngine templateEngine;

    /**
     * SỬA ĐỔI: Đây là phương thức chính, nhận trực tiếp Certificate entity.
     * @param certificate Đối tượng Certificate entity chứa toàn bộ dữ liệu.
     * @return Mảng byte của file PDF.
     * @throws Exception nếu có lỗi trong quá trình tạo PDF.
     */
    public byte[] generateCertificatePdf(Certificate certificate) throws Exception {
        log.info("Starting PDF generation for certificate code: {}", certificate.getCertificateCode());

        try {
            // 0. Validate input data
            if (certificate == null) {
                throw new IllegalArgumentException("Certificate entity cannot be null.");
            }

            // 1. Chuẩn bị Context cho Thymeleaf
            Context context = new Context();
            // Đặt toàn bộ đối tượng entity vào biến 'certificate'
            context.setVariable("certificate", certificate);

            // 2. Xử lý Template để tạo HTML
            String htmlContent = templateEngine.process("certificate_template", context);
            log.debug("HTML content generated successfully for certificate: {}", certificate.getCertificateCode());

            // 3. Chuyển đổi HTML sang PDF
            return convertHtmlToPdf(htmlContent);

        } catch (Exception e) {
            log.error("Error generating PDF for certificate {}: {}", certificate.getCertificateCode(), e.getMessage(), e);
            throw new Exception("Failed to generate PDF for certificate " + certificate.getCertificateCode() + ": " + e.getMessage(), e);
        }
    }

    /**
     * Chuyển đổi HTML content thành PDF bytes
     * (Giữ nguyên)
     */
    private byte[] convertHtmlToPdf(String htmlContent) throws IOException {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();

            configurePdfRenderer(builder);
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(os);
            builder.run();

            byte[] pdfBytes = os.toByteArray();
            log.info("PDF conversion completed successfully. Size: {} bytes", pdfBytes.length);
            return pdfBytes;
        }
    }

    /**
     * Configures the PDF renderer with additional settings
     * (Giữ nguyên)
     */
    private void configurePdfRenderer(PdfRendererBuilder builder) {
        builder.useFastMode();
        log.debug("PDF renderer configured with optimized settings");
    }

    /*
     * XÓA CÁC PHƯƠNG THỨC CŨ (không còn cần thiết):
     * - public byte[] generatePdfFromHtml(String templateName, Map<String, Object> data)
     * - private void validateTemplateData(Map<String, Object> data)
     */
}
