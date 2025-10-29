package com.carboncredit.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
public class PdfService {

    @Autowired
    private TemplateEngine templateEngine;

    /**
     * Tạo file PDF từ template HTML và dữ liệu.
     * @param templateName Tên của template HTML (ví dụ: "certificate_template").
     * @param data Dữ liệu động để điền vào template.
     * @return Mảng byte của file PDF.
     * @throws Exception nếu có lỗi trong quá trình tạo PDF.
     */
    public byte[] generatePdfFromHtml(String templateName, Map<String, Object> data) throws Exception {
        log.info("Starting PDF generation for template: {}", templateName);

        try {
            // 0. Validate input data
            validateTemplateData(data);

            // 1. Chuẩn bị Context cho Thymeleaf
            Context context = new Context();
            context.setVariables(data);

            // 2. Xử lý Template để tạo HTML
            String htmlContent = templateEngine.process(templateName, context);
            log.debug("HTML content generated successfully for template: {}", templateName);

            // 3. Chuyển đổi HTML sang PDF bằng OpenHTMLToPDF
            return convertHtmlToPdf(htmlContent);

        } catch (Exception e) {
            log.error("Error generating PDF for template: {}", templateName, e);
            throw new Exception("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Chuyển đổi HTML content thành PDF bytes
     * @param htmlContent HTML content đã được xử lý
     * @return PDF bytes
     * @throws IOException nếu có lỗi trong quá trình chuyển đổi
     */
    private byte[] convertHtmlToPdf(String htmlContent) throws IOException {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();

            // Cấu hình cơ bản
            configurePdfRenderer(builder);
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(os);

            // Chạy quá trình chuyển đổi
            builder.run();

            byte[] pdfBytes = os.toByteArray();
            log.info("PDF conversion completed successfully. Size: {} bytes", pdfBytes.length);

            return pdfBytes;
        }
    }

    /**
     * Validates template data before PDF generation
     * @param data Template data to validate
     * @throws IllegalArgumentException if required data is missing
     */
    private void validateTemplateData(Map<String, Object> data) {
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Template data cannot be null or empty");
        }

        // Add specific validations for certificate data if needed
        log.debug("Template data validation passed for {} variables", data.size());
    }

    /**
     * Configures the PDF renderer with additional settings
     * @param builder The PdfRendererBuilder to configure
     */
    private void configurePdfRenderer(PdfRendererBuilder builder) {
        builder.useFastMode();

        // Additional configuration options:
        // builder.useColorProfile(colorProfile);
        // builder.usePdfAConformance(level);
        // builder.useDefaultPageSize(pageWidth, pageHeight, units);

        log.debug("PDF renderer configured with optimized settings");
    }
}