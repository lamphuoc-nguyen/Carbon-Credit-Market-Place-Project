package com.carboncredit.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URL;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class StorageService {

    private final Storage storage;
    private final String bucketName;
    private final boolean storageEnabled;

    /**
     * Spring Cloud GCP sẽ tự động tiêm (inject) bean 'Storage'
     * nếu bạn đã cấu hình credentials đúng.
     */
    @Autowired
    public StorageService(@Autowired(required = false) Storage storage,
                         @Value("${gcp.storage.bucket-name:mock-bucket}") String bucketName,
                         @Value("${spring.cloud.gcp.storage.enabled:false}") boolean storageEnabled) {
        this.storage = storage;
        this.bucketName = bucketName;
        this.storageEnabled = storageEnabled;

        if (!storageEnabled) {
            log.warn("Google Cloud Storage is disabled. StorageService will use mock operations.");
        }
    }

    /**
     * Upload một file lên Google Cloud Storage.
     *
     * @param fileContent Mảng byte của nội dung file.
     * @param objectName Tên đối tượng trên GCS (ví dụ: "certificates/CERT-123.pdf").
     * @param contentType Loại nội dung (ví dụ: "application/pdf").
     * @return URL công khai (public URL) của file đã upload.
     * @throws IOException nếu có lỗi khi upload.
     */
    public String uploadFile(byte[] fileContent, String objectName, String contentType) throws IOException {
        log.info("Starting file upload: {} (Enabled: {})", objectName, storageEnabled);

        if (!storageEnabled || storage == null) {
            // Mock upload for development/testing
            log.info("Mock file upload completed: {} (Size: {} bytes)", objectName, fileContent.length);
            return String.format("https://mock-storage.example.com/%s/%s", bucketName, objectName);
        }

        try {
            // 1. Tạo BlobId (định danh đối tượng)
            BlobId blobId = BlobId.of(bucketName, objectName);

            // 2. Tạo BlobInfo (metadata)
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(contentType)
                    .build();

            // 3. Upload file
            storage.create(blobInfo, fileContent);
            log.info("File uploaded successfully to GCS: {} (Size: {} bytes)", objectName, fileContent.length);

            // 4. Trả về Public URL (cho development/testing)
            // Note: Trong production, nên sử dụng pre-signed URLs cho security
            return String.format("https://storage.googleapis.com/%s/%s", bucketName, objectName);

        } catch (Exception e) {
            log.error("Failed to upload file to GCS: {}", objectName, e);
            throw new IOException("Failed to upload file to cloud storage: " + e.getMessage(), e);
        }
    }

    /**
     * Generate Pre-signed URL for file on GCS with auto-download support
     * This URL has limited validity time and forces browser download
     *
     * @param objectName Object name on GCS
     * @param filename Desired filename for download
     * @param duration Validity duration
     * @param timeUnit Time unit
     * @return Pre-signed URL with Content-Disposition header
     */
    public String generateSignedDownloadUrl(String objectName, String filename, long duration, TimeUnit timeUnit) {
        log.info("Generating signed download URL for: {} with filename: {} (Enabled: {})", objectName, filename, storageEnabled);

        if (!storageEnabled || storage == null) {
            // Mock signed URL for development/testing
            String mockUrl = String.format("https://mock-storage.example.com/%s/%s?signed=true&filename=%s", bucketName, objectName, filename);
            log.info("Mock signed download URL generated for: {}", objectName);
            return mockUrl;
        }

        try {
            BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName, objectName)).build();

            // Create signed URL with Content-Disposition header for auto-download
            URL signedUrl = storage.signUrl(
                blobInfo,
                duration,
                timeUnit,
                Storage.SignUrlOption.withV4Signature(),
                Storage.SignUrlOption.httpMethod(com.google.cloud.storage.HttpMethod.GET),
                Storage.SignUrlOption.withQueryParams(java.util.Map.of(
                    "response-content-disposition", "attachment; filename=\"" + filename + "\""
                ))
            );

            log.info("Signed download URL generated for: {} with filename: {}", objectName, filename);
            return signedUrl.toString();

        } catch (Exception e) {
            log.error("Failed to generate signed download URL for: {}", objectName, e);
            throw new RuntimeException("Failed to generate signed download URL: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo Pre-signed URL cho file trên GCS (Secure access)
     * URL này có thời hạn sử dụng giới hạn
     *
     * @param objectName Tên đối tượng trên GCS
     * @param duration Thời gian hiệu lực
     * @param timeUnit Đơn vị thời gian
     * @return Pre-signed URL
     */
    public String generateSignedUrl(String objectName, long duration, TimeUnit timeUnit) {
        log.info("Generating signed URL for: {} (Enabled: {})", objectName, storageEnabled);

        if (!storageEnabled || storage == null) {
            // Mock signed URL for development/testing
            String mockUrl = String.format("https://mock-storage.example.com/%s/%s?signed=true", bucketName, objectName);
            log.info("Mock signed URL generated for: {}", objectName);
            return mockUrl;
        }

        try {
            BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName, objectName)).build();
            URL signedUrl = storage.signUrl(blobInfo, duration, timeUnit, Storage.SignUrlOption.withV4Signature());

            log.debug("Signed URL generated for: {}", objectName);
            return signedUrl.toString();

        } catch (Exception e) {
            log.error("Failed to generate signed URL for: {}", objectName, e);
            throw new RuntimeException("Failed to generate signed URL: " + e.getMessage(), e);
        }
    }

    /**
     * Upload PDF certificate file to GCS
     * Specialized method for certificate uploads with proper naming
     *
     * @param pdfBytes PDF file content
     * @param certificateCode Certificate code for naming
     * @return Public URL of uploaded certificate
     * @throws IOException if upload fails
     */
    public String uploadCertificatePdf(byte[] pdfBytes, String certificateCode) throws IOException {
        String objectName = String.format("certificates/%s.pdf", certificateCode);
        return uploadFile(pdfBytes, objectName, "application/pdf");
    }

    /**
     * Generate secure download URL for certificate PDF
     * Creates a signed URL with auto-download behavior
     *
     * @param certificateCode Certificate code for filename
     * @return Signed download URL with Content-Disposition header
     */
    public String generateCertificateDownloadUrl(String certificateCode) {
        String objectName = String.format("certificates/%s.pdf", certificateCode);
        String filename = String.format("%s.pdf", certificateCode);

        // URL valid for 1 hour - enough time for user to download
        return generateSignedDownloadUrl(objectName, filename, 1, TimeUnit.HOURS);
    }
}