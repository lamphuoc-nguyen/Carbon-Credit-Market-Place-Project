package com.carboncredit.service;

import com.carboncredit.entity.Notification;
import com.carboncredit.entity.Notification.NotificationType;
import com.carboncredit.entity.Notification.EntityType;
import com.carboncredit.entity.User;
import com.carboncredit.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {
    @Autowired
    private final NotificationRepository notificationRepository;
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    /**
     * 1. Upload journey successfully (Cộng CO2 vào ví)
     * Trigger: Sau khi tính toán quãng đường di chuyển bằng xe điện.
     */
    @Transactional
    public void notifyJourneyUploaded(User user, double co2Amount) {
        createAndSave(
                user,
                "Journey Uploaded",
                String.format("Upload journey successfully. %.2f CO2 has been added to your wallet.", co2Amount),
                NotificationType.WALLET_UPDATED,
                EntityType.WALLET,
                null // Có thể truyền WalletID nếu muốn
        );
    }

    /**
     * 2. Vehicle linked successfully
     * Trigger: Sau khi user thêm xe mới vào tài khoản.
     */
    @Transactional
    public void notifyVehicleLinked(User user, String vehicleName, String vehicleId) {
        UUID refId = isValidUUID(vehicleId) ? UUID.fromString(vehicleId) : null;
        createAndSave(
                user,
                "Vehicle Linked",
                String.format("Vehicle '%s' has been linked to your account successfully.", vehicleName),
                NotificationType.ACCOUNT_UPDATE,
                EntityType.USER, // Hoặc tạo thêm EntityType.VEHICLE nếu cần
                refId
        );
    }

    /**
     * 3. Request transfer CO2 to credit (Chờ duyệt CVA)
     * Trigger: User yêu cầu đổi điểm CO2 thành tín chỉ (Credit).
     */
    @Transactional
    public void notifyCreditConversionRequested(User user, String requestId) {
        UUID refId = isValidUUID(requestId) ? UUID.fromString(requestId) : null;
        createAndSave(
                user,
                "Conversion Requested",
                "Request to transfer CO2 to credit sent successfully. Waiting for review by CVA.",
                NotificationType.CREDIT_LISTED, // Hoặc tạo type mới như CONVERSION_PENDING
                EntityType.CREDIT,
                refId
        );
    }

    /**
     * 4. CVA Approve/Reject (Kết quả duyệt)
     * Trigger: Admin/CVA duyệt yêu cầu đổi CO2.
     */
    @Transactional
    public void notifyCreditConversionResult(User user, boolean isApproved, String reason, String historyId) {
        String status = isApproved ? "approved" : "rejected";
        NotificationType type = isApproved ? NotificationType.CREDIT_VERIFIED : NotificationType.CREDIT_REJECTED;

        // Click to more detail -> Frontend sẽ dựa vào relatedEntityId (historyId) để điều hướng
        UUID refId = isValidUUID(historyId) ? UUID.fromString(historyId) : null;

        createAndSave(
                user,
                "Transfer Request " + (isApproved ? "Approved" : "Rejected"),
                String.format("Your transfer request was %s by CVA. %s. Click to view wallet history details.",
                        status, (reason != null && !reason.isEmpty() ? "Reason: " + reason : "")),
                type,
                EntityType.WALLET, // Link về Wallet History
                refId
        );
    }

    /**
     * 5. Credit Sold (Cho người bán)
     * Trigger: Giao dịch mua bán hoàn tất.
     */
    @Transactional
    public void notifyCreditSold(User seller, String creditName, String quantity, String transactionId) {
        UUID refId = isValidUUID(transactionId) ? UUID.fromString(transactionId) : null;
        createAndSave(
                seller,
                "Credit Sold",
                String.format("Congratulations! You have sold %s units of '%s'.", quantity, creditName),
                NotificationType.CREDIT_SOLD,
                EntityType.TRANSACTION,
                refId
        );
    }

    /**
     * 6. Buy Success (Cho người mua)
     * Trigger: Giao dịch mua bán hoàn tất.
     */
    @Transactional
    public void notifyPurchaseSuccess(User buyer, String creditName, String quantity, String transactionId) {
        UUID refId = isValidUUID(transactionId) ? UUID.fromString(transactionId) : null;
        createAndSave(
                buyer,
                "Purchase Successful",
                String.format("Buy success! You have purchased %s units of '%s'.", quantity, creditName),
                NotificationType.TRANSACTION_COMPLETED,
                EntityType.TRANSACTION,
                refId
        );
    }

    /**
     * 7. Retirement Successful
     * Trigger: User dùng tín chỉ để xóa dấu chân carbon (Retire).
     */
    @Transactional
    public void notifyRetirementSuccess(User user, String certificateId) {
        UUID refId = isValidUUID(certificateId) ? UUID.fromString(certificateId) : null;
        createAndSave(
                user,
                "Retirement Successful",
                "Retirement successful. The system is starting to generate your certificate.",
                NotificationType.RETIREMENT_COMPLETED,
                EntityType.CERTIFICATE,
                refId
        );
    }

    /**
     * 8. Welcome notification for new users
     * Trigger: After user registration is complete
     */
    @Transactional
    public void notifyWelcome(User user) {
        createAndSave(
                user,
                "Welcome to Carbon Credit Marketplace",
                String.format("Welcome %s! Your account has been created successfully. Start your journey to a greener future.", user.getFullName()),
                NotificationType.ACCOUNT_UPDATE,
                EntityType.USER,
                user.getId()
        );
    }

    /**
     * 9. Account updated notification
     * Trigger: After user profile is updated
     */
    @Transactional
    public void notifyAccountUpdated(User user) {
        createAndSave(
                user,
                "Account Updated",
                "Your account information has been updated successfully.",
                NotificationType.ACCOUNT_UPDATE,
                EntityType.USER,
                user.getId()
        );
    }

    /**
     * 10. Transaction failed notification
     * Trigger: When a transaction fails during processing
     */
    @Transactional
    public void notifyTransactionFailed(User buyer, User seller, String reason, String transactionId) {
        UUID refId = isValidUUID(transactionId) ? UUID.fromString(transactionId) : null;

        // Notify buyer
        createAndSave(
                buyer,
                "Transaction Failed",
                String.format("Your purchase transaction failed. Reason: %s", reason),
                NotificationType.TRANSACTION_FAILED,
                EntityType.TRANSACTION,
                refId
        );

        // Notify seller
        createAndSave(
                seller,
                "Transaction Failed",
                String.format("A sale transaction failed. Reason: %s", reason),
                NotificationType.TRANSACTION_FAILED,
                EntityType.TRANSACTION,
                refId
        );
    }

    /**
     * 11. Dispute created notification
     * Trigger: When a dispute is created for a transaction
     */
    @Transactional
    public void notifyDisputeCreated(User user, User otherParty, String transactionId) {
        UUID refId = isValidUUID(transactionId) ? UUID.fromString(transactionId) : null;

        createAndSave(
                otherParty,
                "Dispute Created",
                String.format("A dispute has been created for transaction %s. Please check your transactions for more details.", transactionId),
                NotificationType.DISPUTE_CREATED,
                EntityType.TRANSACTION,
                refId
        );
    }

    /**
     * 12. Dispute resolved notification
     * Trigger: When a dispute is resolved by admin
     */
    @Transactional
    public void notifyDisputeResolved(User buyer, User seller, String disputeId, String resolution) {
        UUID refId = isValidUUID(disputeId) ? UUID.fromString(disputeId) : null;

        // Notify buyer
        createAndSave(
                buyer,
                "Dispute Resolved",
                String.format("Your dispute has been resolved. Resolution: %s", resolution),
                NotificationType.DISPUTE_RESOLVED,
                EntityType.DISPUTE,
                refId
        );

        // Notify seller
        createAndSave(
                seller,
                "Dispute Resolved",
                String.format("A dispute involving your transaction has been resolved. Resolution: %s", resolution),
                NotificationType.DISPUTE_RESOLVED,
                EntityType.DISPUTE,
                refId
        );
    }

    // --- Helper Methods ---

    /**
     * Hàm chung để tạo và lưu Notification
     */
    private void createAndSave(User user, String title, String message,
                               NotificationType type, EntityType entityType, UUID entityId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(type);
        notification.setRelatedEntityType(entityType);
        notification.setRelatedEntityId(entityId);
        notification.setIsRead(false);

        // Lưu vào DB
        notificationRepository.save(notification);

        // Log kiểm tra
        log.info("Notification created for User {}: {}", user.getUsername(), title);
    }

    private boolean isValidUUID(String str) {
        if (str == null) return false;
        try {
            UUID.fromString(str);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}