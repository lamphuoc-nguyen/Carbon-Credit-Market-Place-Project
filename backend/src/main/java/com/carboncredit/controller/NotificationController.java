package com.carboncredit.controller;

import com.carboncredit.dto.NotificationDTO;
import com.carboncredit.dto.ApiResponse;
import com.carboncredit.entity.Notification;
import com.carboncredit.entity.User;
import com.carboncredit.repository.NotificationRepository;
import com.carboncredit.service.UserService;
import com.carboncredit.util.DTOMapper; // Import class Mapper có sẵn của bạn
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    // Helper để lấy User hiện tại từ Token
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getMyNotifications() {
        try {
            User user = getCurrentUser();

            // 1. Lấy danh sách Entity từ DB
            List<Notification> entities = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

            // 2. Dùng DTOMapper có sẵn để chuyển đổi (Cắt đứt vòng lặp User -> Wallet -> User)
            List<NotificationDTO> dtos = DTOMapper.toNotificationDTOList(entities);

            return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", dtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve notifications: " + e.getMessage()));
        }
    }

    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        try {
            User user = getCurrentUser();
            Long count = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
            return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve unread count: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable UUID id) {
        try {
            notificationRepository.findById(id).ifPresent(notification -> {
                User currentUser = getCurrentUser();
                if (notification.getUser().getId().equals(currentUser.getId())) {
                    notification.markAsRead();
                    notificationRepository.save(notification);
                }
            });
            return ResponseEntity.ok(ApiResponse.success("Notification marked as read", "Success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to mark notification as read: " + e.getMessage()));
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead() {
        try {
            User user = getCurrentUser();
            List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(user.getId());

            for (Notification notification : unreadNotifications) {
                notification.markAsRead();
            }

            notificationRepository.saveAll(unreadNotifications);
            return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", "Success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to mark all notifications as read: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(@PathVariable UUID id) {
        try {
            notificationRepository.findById(id).ifPresent(notification -> {
                User currentUser = getCurrentUser();
                if (notification.getUser().getId().equals(currentUser.getId())) {
                    notificationRepository.delete(notification);
                }
            });
            return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully", "Success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete notification: " + e.getMessage()));
        }
    }
}